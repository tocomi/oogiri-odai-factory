/**
 * 評価(feedback_events)の集計レポート。`pnpm run analyze` で実行する。
 *
 * like率の差はどれもセル当たりの n が小さく、点推定だけを見ると
 * ノイズを差だと読み違える。そのため全ての行に 95% 信頼区間を付け、
 * 主要な比較には z 検定を添えている。CI が重なっている限り
 * 「差がある」と判断しないこと。
 */
import { createClient } from '@libsql/client'

/** db.ts と同じフォールバック。ローカル DB でも同じレポートが出せるようにする */
const DEFAULT_URL = 'file:data/odai.db'

/**
 * A/B の再判定ラインとなる評価数（現行 prompt_version 配下の like+dislike）。
 *
 * technique_variant は 3 群あるので 1 群 250 件。like率のベースを 15% とすると、
 * この水準で検出できる最小の差が約 10pt になる。これを下回る間は
 * 3 群が横並びに見えても「差がない」ではなく「判定できていない」が正しい。
 */
const AB_DECISION_N = 750

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || DEFAULT_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// --- 統計 ---

const Z_95 = 1.96

/** 二項比率の Wilson 信頼区間（正規近似は n が小さいと下限が負に振れるため使わない） */
function wilson(likes: number, n: number): [number, number] {
  if (n === 0) return [0, 0]
  const p = likes / n
  const d = 1 + Z_95 ** 2 / n
  const center = (p + Z_95 ** 2 / (2 * n)) / d
  const half =
    (Z_95 * Math.sqrt((p * (1 - p)) / n + Z_95 ** 2 / (4 * n ** 2))) / d
  return [(center - half) * 100, (center + half) * 100]
}

/** 標準正規分布の累積分布関数（Abramowitz & Stegun 7.1.26 による誤差関数の近似） */
function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const z = Math.abs(x) / Math.SQRT2
  const t = 1 / (1 + 0.3275911 * z)
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-z * z)
  return 0.5 * (1 + sign * y)
}

/** 2 群の比率の差の検定。両側 p 値を返す */
function twoProportionP(
  likes1: number,
  n1: number,
  likes2: number,
  n2: number,
): number {
  if (n1 === 0 || n2 === 0) return Number.NaN
  const pooled = (likes1 + likes2) / (n1 + n2)
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
  if (se === 0) return Number.NaN
  const z = (likes1 / n1 - likes2 / n2) / se
  return 2 * (1 - normalCdf(Math.abs(z)))
}

// --- 表示 ---

/** 全角文字を 2 桁として数えた表示幅。日本語ラベルの桁を揃えるために使う */
function displayWidth(s: string): number {
  let w = 0
  for (const c of s) {
    w += /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/.test(c) ? 2 : 1
  }
  return w
}

function pad(s: string, width: number, align: 'left' | 'right'): string {
  const space = ' '.repeat(Math.max(0, width - displayWidth(s)))
  return align === 'right' ? space + s : s + space
}

interface Row {
  label: string
  likes: number
  n: number
}

function printTable(title: string, rows: Row[]): void {
  console.log(`\n■ ${title}`)
  if (rows.length === 0) {
    console.log('  (データなし)')
    return
  }
  const body = rows.map((r) => {
    const [lo, hi] = wilson(r.likes, r.n)
    return [
      r.label,
      r.n === 0 ? '-' : `${((100 * r.likes) / r.n).toFixed(1)}%`,
      `[${lo.toFixed(1)}, ${hi.toFixed(1)}]`,
      String(r.n),
    ]
  })
  const header = ['', 'like率', '95%CI', 'n']
  const widths = header.map((_, i) =>
    Math.max(...[header, ...body].map((r) => displayWidth(r[i]))),
  )
  const aligns: ('left' | 'right')[] = ['left', 'right', 'right', 'right']
  for (const row of [header, ...body]) {
    console.log(
      `  ${row.map((c, i) => pad(c, widths[i], aligns[i])).join('  ')}`,
    )
  }
}

// --- 集計 ---

const RATED = "f.type IN ('like', 'dislike')"
const JOINED = `FROM feedback_events f
  JOIN odais o ON o.id = f.odai_id
  JOIN generations g ON g.id = o.generation_id`

/**
 * 任意の式で切った like率の内訳を取る。
 * like/dislike 以外（copy, skip）は好みの表明ではないので母数から外す。
 */
async function breakdown(expr: string, where = '1=1'): Promise<Row[]> {
  const res = await client.execute(`
    SELECT ${expr} AS label,
           sum(f.type = 'like') AS likes,
           count(*) AS n
    ${JOINED}
    WHERE ${RATED} AND ${where}
    GROUP BY label
    ORDER BY 1.0 * likes / n DESC, n DESC
  `)
  return res.rows.map((r) => ({
    label: String(r.label),
    likes: Number(r.likes),
    n: Number(r.n),
  }))
}

function find(rows: Row[], label: string): Row {
  return rows.find((r) => r.label === label) ?? { label, likes: 0, n: 0 }
}

function printComparison(title: string, a: Row, b: Row): void {
  const p = twoProportionP(a.likes, a.n, b.likes, b.n)
  const verdict = Number.isNaN(p)
    ? '判定不能'
    : p < 0.05
      ? '有意差あり'
      : '判定できず'
  console.log(
    `  ${title}: p = ${Number.isNaN(p) ? '-' : p.toFixed(3)}  (${verdict})`,
  )
}

async function main(): Promise<void> {
  const overview = await client.execute(`
    SELECT (SELECT count(*) FROM generations) AS generations,
           (SELECT count(*) FROM odais) AS odais,
           (SELECT count(DISTINCT odai_id) FROM feedback_events) AS rated,
           sum(type = 'like') AS likes,
           sum(type = 'dislike') AS dislikes,
           sum(type = 'copy') AS copies,
           sum(type = 'skip') AS skips,
           min(date(created_at)) AS since,
           max(date(created_at)) AS until
    FROM feedback_events
  `)
  const o = overview.rows[0]
  const likes = Number(o.likes)
  const rated = likes + Number(o.dislikes)

  console.log('■ 概況')
  console.log(`  期間           ${o.since} 〜 ${o.until}`)
  console.log(`  生成           ${o.generations} 回 / ${o.odais} お題`)
  console.log(
    `  評価済み       ${o.rated} お題 (${((100 * Number(o.rated)) / Number(o.odais)).toFixed(1)}%)`,
  )
  console.log(
    `  like / dislike ${likes} / ${o.dislikes}  → like率 ${((100 * likes) / rated).toFixed(1)}%`,
  )
  console.log(`  copy / skip    ${o.copies} / ${o.skips}`)

  // 現行バージョンはコードから読まず、記録されている最新のものを使う。
  // 集計スクリプトが prompts.ts の更新に追従し損ねるのを避けるため。
  const latest = await client.execute(`
    SELECT prompt_version FROM generations
    ORDER BY created_at DESC LIMIT 1
  `)
  const current = String(latest.rows[0]?.prompt_version ?? '')
  const currentOnly = `g.prompt_version = '${current}'`

  printTable('プロンプト版別', await breakdown('g.prompt_version'))
  printTable(
    'カテゴリ別（全期間）',
    await breakdown("coalesce(g.category, '(指定なし)')"),
  )
  printTable(
    `プロバイダ別（${current}）`,
    await breakdown('g.provider', currentOnly),
  )

  const variants = await breakdown(
    "coalesce(g.technique_variant, '(未記録)')",
    currentOnly,
  )
  printTable(`technique_variant 別（${current}）`, variants)

  const abN = variants.reduce((sum, r) => sum + r.n, 0)
  console.log(
    `\n  A/B 判定ラインまで: ${abN} / ${AB_DECISION_N} 件` +
      (abN >= AB_DECISION_N
        ? '  → 到達。3群の順位が初期の並びを保っているか確認する'
        : `  (あと ${AB_DECISION_N - abN} 件)`),
  )

  printTable(
    'テクニック別（自己申告、全期間）',
    await breakdown("coalesce(o.used_technique, '(帰属なし)')"),
  )

  // generation_techniques.position（提示順バイアス）はレポートに載せていない。
  // 提示した4つをモデルがほぼ全部消化するため採用率が position 0〜3 で
  // 92〜98% と横並びになり、この軸では何も測れないことが確認済みのため。
  // 提示するテクニック数を絞ったら復活させる価値がある。

  console.log('\n■ 主要な比較')
  const byVersion = await breakdown('g.prompt_version')
  const sorted = [...byVersion].sort((a, b) => a.label.localeCompare(b.label))
  if (sorted.length >= 2) {
    const prev = sorted[sorted.length - 2]
    const now = sorted[sorted.length - 1]
    printComparison(`プロンプト ${prev.label} vs ${now.label}`, prev, now)
  }
  printComparison(
    'variant none vs names_only',
    find(variants, 'none'),
    find(variants, 'names_only'),
  )
  printComparison(
    'variant none vs with_examples',
    find(variants, 'none'),
    find(variants, 'with_examples'),
  )

  const providers = await breakdown('g.provider', currentOnly)
  if (providers.length >= 2) {
    printComparison(
      `${providers[0].label} vs ${providers[providers.length - 1].label}`,
      providers[0],
      providers[providers.length - 1],
    )
  }
  console.log()
}

await main()
client.close()

import type { Category } from '@/types'

/**
 * プロンプトの組み立てロジックを変更したら必ずバンプする。
 * お題ごとに記録され、プロンプト改善の前後で評価を比較するために使う。
 *
 * A/Bバリアントは {@link TECHNIQUE_VARIANTS} 側で管理するので、
 * バリアントを1つ足しただけならバンプ不要
 * （generations.technique_variant に記録される）。
 *
 * 変更履歴:
 * - 2026-07-27.2: difficulty を廃止し、シンプルさブロックを rule_only 相当に固定。
 *   これ以前のデータは difficulty がランダムに振られ、シンプルさブロックも
 *   3バリアントが混ざっているため、単純比較するときは prompt_version で絞ること。
 * - 2026-07-27.3: provider ごとに分けていた作風の指示を全プロバイダー共通にした。
 * - 2026-07-27.4: OpenAI の注入層を system から user に変更し、3社とも
 *   単一の user ターンに揃えた。これ以前の provider 間の比較には、
 *   モデルの差・プロンプト文面の差・注入層の差が混ざっている。
 */
export const PROMPT_VERSION = '2026-07-27.4'

interface Technique {
  name: string
  description: string
  example: string
}

const TECHNIQUES: Technique[] = [
  {
    name: '微妙ランキング',
    description:
      'ランキングの上位ではなく「下位」に該当する条件を問うパターン。「ありそうだけど、少ない回答」を想像させる。',
    example:
      '医者にアンケート。「医者人生の中で一度は言ってみたいセリフ」第87位は？',
  },
  {
    name: 'オクシモロン',
    description:
      '意味が矛盾する言葉を並べる手法。固定観念に相反する形容詞で二項対立の先にある発想を誘発。',
    example: '危険だけど居心地が良いカフェとは？',
  },
  {
    name: '既存物語の拡張',
    description:
      '童話や映画など既存のストーリーの続きや発展的な設定について問う。',
    example: '13日の金曜日に暴れ回るジェイソン。14日の土曜日は何をしてる？',
  },
  {
    name: 'プラスワン',
    description: '既存のラインナップに+1を加える問い。',
    example: '相撲の決まり手が1つ増えて八十三手になりました。何ですか？',
  },
  {
    name: '不要機能',
    description: '常識的に考えて「必要のない」機能について想像させる。',
    example: '最新型洗濯機。「この機能いる？」どんな機能？',
  },
  {
    name: '境界ギリギリ',
    description: 'AとBのカテゴリの境界、価値の曖昧な領域について問う。',
    example:
      '格安航空会社。「そこまでするなら格安じゃなくていいよ！」どんなの？',
  },
  {
    name: '極端化',
    description: 'ある価値や意味を極端に誇張する文脈を設定。',
    example: 'もったいないオバケが怒り狂ったもったいない事とは？',
  },
  {
    name: '有名人リアクション',
    description:
      '具体的な有名人のリアクションを設定し、その原因について想像させる。',
    example: 'あのガンジーでも激怒した出来事とは？',
  },
  {
    name: '何が起きる？',
    description:
      '普段はやらないアクションをとった際に「何が起こるか？」と想像させる。',
    example: 'バスの降車ボタン7回連打すると何が起きる？',
  },
]

/** 配列から重複なく n 件を無作為に選ぶ（元の配列は変更しない） */
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, n)
}

/** 提示するテクニックを「テクニック集」ブロックの本文に整形する */
function buildTechniquesSection(
  techniques: Technique[],
  showExample: boolean,
): string {
  return techniques
    .map((t, i) => {
      const example = showExample && t.example ? `\n例：${t.example}` : ''
      return `### ${i + 1}. ${t.name}\n${t.description}${example}`
    })
    .join('\n\n')
}

/**
 * 「シンプルさ」ブロック。以前は具体例の有無をA/Bしていたが、
 * 変数を絞るため rule_only 相当（ルールのみ・具体例なし）で固定した。
 */
const SIMPLICITY_BLOCK = `## お題の「シンプルさ」について（最重要）

良いお題は短い。設定と問いを詰め込みすぎると、答え手が迷子になる。

**長さの目安：50文字以内**

**シンプルにするコツ：**
- 状況設定と問いかけで合計3文以内に収める
- 説明・修飾語を削っても伝わるなら削る`

/**
 * プロンプトのバリアント（A/Bテスト用）。
 * 「テクニック集」ブロックの見せ方を均等ランダムで選び、引いたキーを
 * generations.technique_variant に記録する。count が 0 のときはブロックを出さない。
 *
 * 評価データと突き合わせて効果を比較するのが目的なので、
 * 一度使ったキーの意味は後から変えないこと。
 * 中身を変えたいときはキーを新設し、古いキーは削除して抽選から外す
 * （意味を変えると、そのキーで記録済みの過去の評価が別物と混ざって壊れる）。
 */
const TECHNIQUE_VARIANTS = {
  none: { count: 0, showExample: false },
  names_only: { count: 4, showExample: false },
  with_examples: { count: 4, showExample: true },
} as const

export type TechniqueVariant = keyof typeof TECHNIQUE_VARIANTS

/** バリアント定義から均等ランダムでキーを1つ引く */
function pickVariantKey<T extends object>(variants: T): keyof T & string {
  const keys = Object.keys(variants) as (keyof T & string)[]
  return keys[Math.floor(Math.random() * keys.length)]
}

/**
 * 作風の指示。以前は provider ごとに文面を分けていたが、全プロバイダーで共通にした。
 * これで provider 間の評価差が「モデルの差」だけを表すようになる
 * （プロンプトが違うと、モデルの差なのか文面の差なのか切り分けられない）。
 */
const STYLE_PROMPT = `
以下の点を意識してお題を作成してください：
- 意外性のある状況設定や、具体的な数字・条件を使った、思わず考え込むお題
- 言葉の響きやテンポが良く、口に出して読みたくなるお題
- 人間の機微や、身近なあるあるを新鮮な角度で切り取ったお題
`

export const CATEGORY_PROMPTS = {
  daily:
    '日常生活の何気ない場面や出来事を題材にした大喜利のお題を作成してください。家事、通勤、買い物、食事など、誰もが経験する日常的な状況を面白く捉えたお題にしてください。',

  situation:
    '特定のシチュエーションや状況設定を明確にした大喜利のお題を作成してください。「〜な時」「〜な場面で」といった具体的な場面設定があるお題にしてください。',

  wordplay:
    '言葉遊びを活用した大喜利のお題を作成してください。ダジャレ、語呂合わせ、同音異義語、回文など、言葉の音や意味の面白さを活かせるお題にしてください。',

  current:
    '時事問題や最新のトレンド、流行を題材にした大喜利のお題を作成してください。ニュース、SNSの話題、新しい技術、社会現象などを取り入れたお題にしてください。',

  character:
    'キャラクターや人物を題材にした大喜利のお題を作成してください。有名人、歴史上の人物、アニメキャラクター、職業の人など、人物の特徴を活かしたお題にしてください。',

  place:
    '場所や風景を題材にした大喜利のお題を作成してください。観光地、建物、自然、都市など、場所の特徴や雰囲気を活かしたお題にしてください。',

  object:
    '物や道具を題材にした大喜利のお題を作成してください。日用品、電化製品、文房具、食器など、物の形や用途の面白さを活かしたお題にしてください。',

  emotion:
    '感情や気持ち、心境を表現する大喜利のお題を作成してください。喜び、悲しみ、怒り、驚き、恥ずかしさなど、感情の微妙な変化や表現を活かしたお題にしてください。',

  fantasy:
    'ファンタジーや空想的な世界を題材にした大喜利のお題を作成してください。魔法、ドラゴン、異世界、超能力など、現実離れした設定を活かしたお題にしてください。',

  food: '食べ物や料理を題材にした大喜利のお題を作成してください。食材、調理法、食事の場面、グルメなど、食に関する様々な要素を活かしたお題にしてください。',

  work: '仕事や職業を題材にした大喜利のお題を作成してください。会社員、職人、接客業、専門職など、職業の特徴や仕事場面を活かしたお題にしてください。',

  family:
    '家族や人間関係を題材にした大喜利のお題を作成してください。親子、夫婦、兄弟、友人、恋人など、人間関係の微妙さや温かさを活かしたお題にしてください。',
} as const

export interface BuiltPrompt {
  prompt: string
  techniqueVariant: TechniqueVariant
  /**
   * プロンプトに提示したテクニック名（提示順）。technique バリアントが none なら空。
   * odais.used_technique（AIの自己申告）と突き合わせて、
   * 「提示したのに使われなかった」テクニックまで追えるようにするため記録する。
   */
  presentedTechniques: string[]
}

/**
 * 全プロバイダー共通のプロンプトを組み立てる。
 * A/Bバリアントは呼び出しごとに抽選され、記録用に結果へ含めて返す。
 */
export function buildPrompt({
  category,
  count = 5,
  customPrompt,
}: {
  category?: Category
  count: number
  customPrompt?: string
}): BuiltPrompt {
  const techniqueKey = pickVariantKey(TECHNIQUE_VARIANTS)
  const techniqueConfig = TECHNIQUE_VARIANTS[techniqueKey]
  const withTechniques = techniqueConfig.count > 0

  const presentedTechniques = withTechniques
    ? pickRandom(TECHNIQUES, techniqueConfig.count)
    : []
  const techniqueBlock = withTechniques
    ? `## 良いお題を作るコツ（以下のテクニックを参考にしてください）

${buildTechniquesSection(presentedTechniques, techniqueConfig.showExample)}`
    : ''

  // テクニックを提示していないときに「上記のテクニック」を参照させると
  // 指示が空振りするので、その項目だけ落とす
  const requirements = [
    '各お題は独立していて、重複しないこと',
    '回答者の創造性を刺激するような内容',
    '適度な制約がありつつも、幅広い回答が可能',
    '日本語として自然で理解しやすい',
    '不適切な内容を含まない',
    '大喜利らしいユーモアと発想の余地がある',
    ...(withTechniques
      ? ['上記のテクニックのいずれかを活用したお題にする']
      : []),
    'ありきたりなパターンは避け、意外性のある切り口を重視する',
  ]

  // 同じ理由で、テクニック未提示のときは technique フィールドも要求しない
  const outputSchema = withTechniques
    ? `[{"odai": "お題の本文", "technique": "実際に使ったテクニック名"}]
"technique" には上記テクニックのうち、そのお題で実際に使ったものの名前を正確に入れてください。`
    : '[{"odai": "お題の本文"}]'

  let prompt = `${[
    `あなたは大喜利のお題を作る専門家です。
以下の条件に従って、面白くて創造的なお題を生成してください。`,
    SIMPLICITY_BLOCK,
    techniqueBlock,
    `## 要求事項:
${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
    `出力形式:
以下の形式のJSON配列のみを出力してください。コードブロック記法や前後の説明は不要です。
${outputSchema}`,
  ]
    .filter((block) => block.length > 0)
    .join('\n\n')}\n`

  // 作風の共通指示を追加
  prompt += `\n${STYLE_PROMPT}`

  // カテゴリが指定されている場合
  if (category && CATEGORY_PROMPTS[category]) {
    prompt += `\n\n【カテゴリ指定】\n${CATEGORY_PROMPTS[category]}`
  }

  // カスタムプロンプト（キーワード）が指定されている場合
  if (customPrompt) {
    prompt += `\n\n【キーワード指定】\n以下のキーワードやテーマを含めた、またはそれに関連するお題を作成してください：「${customPrompt}」`
  }

  // 生成数を指定
  prompt += `\n\n${count}個のお題を生成してください。`

  return {
    prompt,
    techniqueVariant: techniqueKey,
    presentedTechniques: presentedTechniques.map((t) => t.name),
  }
}

export interface ParsedOdai {
  text: string
  technique?: string
}

/**
 * モデルの応答からお題を取り出す。
 * まず JSON として解釈し、取れなければ行単位のフォールバックに落とす
 */
export function parseOdaiResponse(response: string): ParsedOdai[] {
  const parsed = parseJsonResponse(response)
  if (parsed.length > 0) {
    return parsed
  }
  return parseLinesResponse(response)
}

/** 応答中の最初の JSON 配列を解釈する。解釈できなければ空配列を返す */
function parseJsonResponse(response: string): ParsedOdai[] {
  const start = response.indexOf('[')
  const end = response.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) {
    return []
  }

  try {
    const items: unknown = JSON.parse(response.slice(start, end + 1))
    if (!Array.isArray(items)) {
      return []
    }
    return items
      .filter(
        (item): item is { odai: string; technique?: string } =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as { odai?: unknown }).odai === 'string',
      )
      .map((item) => ({
        text: item.odai.trim(),
        technique:
          typeof item.technique === 'string' ? item.technique : undefined,
      }))
      .filter((item) => item.text.length > 0 && item.text.length <= 200)
  } catch {
    return []
  }
}

/** JSONで返ってこなかった場合のフォールバック（テクニック帰属なし） */
function parseLinesResponse(response: string): ParsedOdai[] {
  return response
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // 番号や記号を除去 (例: "1. ", "・", "- ")
      return line
        .replace(/^[\d]+[.)]\s*/, '')
        .replace(/^[・\-*]\s*/, '')
        .replace(/^[\d]+\s*/, '')
        .trim()
    })
    .filter((line) => line.length > 0 && line.length <= 200)
    .map((text) => ({ text }))
}

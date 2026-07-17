import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { type Client, createClient, type Transaction } from '@libsql/client'
import type {
  AIProvider,
  Category,
  Difficulty,
  FeedbackType,
  GeneratedOdai,
} from '@/types'
import type { ParsedOdai } from './prompts'
import { PROMPT_VERSION } from './prompts'

// TURSO_DATABASE_URL 未設定時はローカルファイルにフォールバックする
const DEFAULT_URL = 'file:data/odai.db'

let client: Client | null = null
let schemaReady: Promise<void> | null = null

function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL || DEFAULT_URL
    if (url.startsWith('file:')) {
      mkdirSync('data', { recursive: true })
    }
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return client
}

// --- マイグレーション ---
// スキーマを変更するときは MIGRATIONS の末尾に追記する。適用済みの要素は書き換えない。
// 適用状況は schema_migrations テーブルで管理する。

async function tableExists(tx: Transaction, name: string): Promise<boolean> {
  const res = await tx.execute({
    sql: "SELECT count(*) AS c FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [name],
  })
  return Number(res.rows[0].c) > 0
}

async function tableHasColumn(
  tx: Transaction,
  table: string,
  column: string,
): Promise<boolean> {
  const res = await tx.execute({
    sql: 'SELECT count(*) AS c FROM pragma_table_info(?) WHERE name = ?',
    args: [table, column],
  })
  return Number(res.rows[0].c) > 0
}

type Migration = (tx: Transaction) => Promise<void>

const MIGRATIONS: Migration[] = [
  // v1: generations / odais / feedback_events 構成。
  // 旧設計（generation_id を持たない odais）が居る場合は _legacy に退避してから作る。
  async (tx) => {
    if (
      (await tableExists(tx, 'odais')) &&
      !(await tableHasColumn(tx, 'odais', 'generation_id'))
    ) {
      await tx.execute('ALTER TABLE odais RENAME TO odais_legacy')
      if (await tableExists(tx, 'feedback_events')) {
        await tx.execute(
          'ALTER TABLE feedback_events RENAME TO feedback_events_legacy',
        )
      }
    }

    await tx.execute(`CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      prompt_version TEXT NOT NULL,
      category TEXT,
      difficulty TEXT,
      keyword TEXT,
      prompt_text TEXT,
      tokens INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`)
    await tx.execute(`CREATE TABLE IF NOT EXISTS odais (
      id TEXT PRIMARY KEY,
      generation_id TEXT NOT NULL REFERENCES generations(id),
      text TEXT NOT NULL,
      used_technique TEXT
    )`)
    await tx.execute(`CREATE TABLE IF NOT EXISTS feedback_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      odai_id TEXT NOT NULL REFERENCES odais(id),
      type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`)
    await tx.execute(
      'CREATE INDEX IF NOT EXISTS idx_odais_generation_id ON odais(generation_id)',
    )
    await tx.execute(
      'CREATE INDEX IF NOT EXISTS idx_feedback_odai_id ON feedback_events(odai_id)',
    )
  },
]

async function migrate(c: Client): Promise<void> {
  await c.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)
  const res = await c.execute(
    'SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations',
  )
  const applied = Number(res.rows[0].version)

  for (let version = applied + 1; version <= MIGRATIONS.length; version++) {
    const tx = await c.transaction('write')
    try {
      await MIGRATIONS[version - 1](tx)
      await tx.execute({
        sql: 'INSERT INTO schema_migrations (version) VALUES (?)',
        args: [version],
      })
      await tx.commit()
    } finally {
      // commit 済みなら no-op、失敗時はロールバックされる
      tx.close()
    }
  }
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = migrate(getClient()).catch((error) => {
      // 失敗した Promise を残すと以降の全リクエストが同じ失敗を返し続けるため、
      // リセットして次のリクエストで再試行できるようにする
      schemaReady = null
      throw error
    })
  }
  return schemaReady
}

// 1回の生成リクエストを generations + odais として永続化し、
// クライアントに返す形に変換する。
// 永続化に失敗した場合は例外を投げる。保存されていないお題は評価もできないため、
// 呼び出し元（生成API）ごと失敗させて「返したお題は必ず評価可能」の不変条件を保つ。
export async function persistGeneratedOdais(params: {
  parsed: ParsedOdai[]
  provider: AIProvider
  model: string
  category?: Category
  difficulty?: Difficulty
  keyword?: string
  promptText: string
  tokens?: number
}): Promise<GeneratedOdai[]> {
  const generationId = randomUUID()
  const odais = params.parsed.map((p) => ({
    id: randomUUID(),
    text: p.text,
    source: params.provider,
    technique: p.technique,
  }))

  await ensureSchema()
  await getClient().batch(
    [
      {
        sql: `INSERT INTO generations
          (id, provider, model, prompt_version, category, difficulty, keyword, prompt_text, tokens)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          generationId,
          params.provider,
          params.model,
          PROMPT_VERSION,
          params.category ?? null,
          params.difficulty ?? null,
          params.keyword ?? null,
          params.promptText,
          params.tokens ?? null,
        ],
      },
      ...odais.map((o) => ({
        sql: 'INSERT INTO odais (id, generation_id, text, used_technique) VALUES (?, ?, ?, ?)',
        args: [o.id, generationId, o.text, o.technique ?? null],
      })),
    ],
    'write',
  )

  return odais
}

export async function recordFeedback(
  odaiId: string,
  type: FeedbackType,
): Promise<number> {
  await ensureSchema()
  const result = await getClient().execute({
    sql: 'INSERT INTO feedback_events (odai_id, type) VALUES (?, ?)',
    args: [odaiId, type],
  })
  return Number(result.lastInsertRowid)
}

// ユーザーが評価を取り消したときに該当イベントを削除する。
// 取り消されたイベントを残すと like/dislike の集計が実際の評価とずれるため、
// 論理削除ではなく物理削除にしている。
export async function deleteFeedback(eventId: number): Promise<void> {
  await ensureSchema()
  await getClient().execute({
    sql: 'DELETE FROM feedback_events WHERE id = ?',
    args: [eventId],
  })
}

import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type {
  AIProvider,
  Category,
  Difficulty,
  FeedbackType,
  GeneratedOdai,
} from '@/types'
import type { ParsedOdai } from './prompts'
import { PROMPT_VERSION } from './prompts'

let db: DatabaseSync | null = null

function getDb(): DatabaseSync {
  if (!db) {
    const dir = path.join(process.cwd(), 'data')
    mkdirSync(dir, { recursive: true })
    db = new DatabaseSync(path.join(dir, 'odai.db'))
    db.exec(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS odais (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        category TEXT,
        difficulty TEXT,
        keyword TEXT,
        offered_techniques TEXT,
        used_technique TEXT,
        prompt_version TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS feedback_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        odai_id TEXT NOT NULL REFERENCES odais(id),
        type TEXT NOT NULL,
        reason_tag TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );

      CREATE INDEX IF NOT EXISTS idx_feedback_odai_id ON feedback_events(odai_id);
    `)
  }
  return db
}

export interface OdaiInsert {
  id: string
  text: string
  provider: AIProvider
  model: string
  category?: Category
  difficulty?: Difficulty
  keyword?: string
  offeredTechniques: string[]
  usedTechnique?: string
  promptVersion: string
}

// 永続化の失敗（Vercel 等の読み取り専用環境）で生成自体を落とさない
export function saveOdais(records: OdaiInsert[]): void {
  try {
    const stmt = getDb().prepare(`
      INSERT INTO odais (
        id, text, provider, model, category, difficulty, keyword,
        offered_techniques, used_technique, prompt_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const r of records) {
      stmt.run(
        r.id,
        r.text,
        r.provider,
        r.model,
        r.category ?? null,
        r.difficulty ?? null,
        r.keyword ?? null,
        JSON.stringify(r.offeredTechniques),
        r.usedTechnique ?? null,
        r.promptVersion,
      )
    }
  } catch (error) {
    console.warn('Failed to persist odais:', error)
  }
}

// パース済みのお題にIDを振って永続化し、クライアントに返す形に変換する
export function persistGeneratedOdais(params: {
  parsed: ParsedOdai[]
  provider: AIProvider
  model: string
  category?: Category
  difficulty?: Difficulty
  keyword?: string
  offeredTechniques: string[]
}): GeneratedOdai[] {
  const records = params.parsed.map((p) => ({
    id: randomUUID(),
    text: p.text,
    provider: params.provider,
    model: params.model,
    category: params.category,
    difficulty: params.difficulty,
    keyword: params.keyword,
    offeredTechniques: params.offeredTechniques,
    usedTechnique: p.technique,
    promptVersion: PROMPT_VERSION,
  }))

  saveOdais(records)

  return records.map((r) => ({
    id: r.id,
    text: r.text,
    source: r.provider,
    technique: r.usedTechnique,
  }))
}

export function recordFeedback(
  odaiId: string,
  type: FeedbackType,
  reasonTag?: string,
): number {
  const result = getDb()
    .prepare(
      'INSERT INTO feedback_events (odai_id, type, reason_tag) VALUES (?, ?, ?)',
    )
    .run(odaiId, type, reasonTag ?? null)
  return Number(result.lastInsertRowid)
}

export function deleteFeedback(eventId: number): void {
  getDb().prepare('DELETE FROM feedback_events WHERE id = ?').run(eventId)
}

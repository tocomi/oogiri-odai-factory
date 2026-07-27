'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AIProvider, Category, FeedbackType, GeneratedOdai } from '@/types'
import { CATEGORIES } from '@/types'

const BATCH_COUNT = 4
/**
 * キューがこれを下回ったら裏で次バッチを生成する。
 * {@link BATCH_COUNT} より大きいので、キューが空に近い状態からは補充が2回連続で走る。
 */
const REFILL_THRESHOLD = 6
const RETRY_BASE_DELAY_MS = 2_000
const RETRY_MAX_DELAY_MS = 30_000

const PROVIDERS: AIProvider[] = ['openai', 'claude', 'gemini']
/** 取り消せる評価の履歴数 */
const MAX_HISTORY = 20

/**
 * 評価をサーバーに記録する。
 *
 * @returns 記録した eventId（取り消し時の削除に使う）。失敗時は null
 */
function postFeedback(
  odaiId: string,
  type: FeedbackType,
): Promise<number | null> {
  return fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ odaiId, type }),
  })
    .then((res) => res.json())
    .then((json) => (typeof json?.eventId === 'number' ? json.eventId : null))
    .catch(() => null)
}

/**
 * 記録済みの評価を削除する。
 * eventId が確定する前に取り消される場合があるので、Promise のまま受け取る
 */
function undoFeedback(eventIdPromise: Promise<number | null>) {
  eventIdPromise
    .then((eventId) => {
      if (eventId === null) return
      return fetch('/api/feedback', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
    })
    .catch(() => {})
}

type RatedEntry = {
  odai: GeneratedOdai
  type: FeedbackType
  eventIdPromise: Promise<number | null>
}

/**
 * お題キューの補充・再試行・評価の確定を一手に引き受けるフック。
 *
 * - 補充失敗時はバックオフ付きで自動再試行する
 * - `rate()` は「いま表示中の先頭」に対して一度だけ確定する（連打・キーリピート対策）
 * - `undo()` は直近の評価を取り消してお題をキュー先頭に戻す
 *
 * @param active 補充を行うかどうか。別画面を見ている間に false にすると、
 *   キューを保持したまま生成だけを止められる
 */
export function useRatingQueue({ active }: { active: boolean }) {
  const [queue, setQueue] = useState<GeneratedOdai[]>([])
  const [error, setError] = useState<string | null>(null)
  const [retryNonce, setRetryNonce] = useState(0)
  const [history, setHistory] = useState<RatedEntry[]>([])

  const fetchingRef = useRef(false)
  const providerIndexRef = useRef(Math.floor(Math.random() * PROVIDERS.length))
  const retryAttemptRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ratedHeadRef = useRef<string | null>(null)

  const current: GeneratedOdai | undefined = queue[0]

  const scheduleRetry = useCallback(() => {
    retryAttemptRef.current += 1
    const delay = Math.min(
      RETRY_MAX_DELAY_MS,
      RETRY_BASE_DELAY_MS * 2 ** (retryAttemptRef.current - 1),
    )
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
    }
    retryTimerRef.current = setTimeout(() => setRetryNonce((n) => n + 1), delay)
  }, [])

  const refill = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    // プロバイダはラウンドロビン、カテゴリはランダムに散らして
    // データに偏りが出ないようにする
    const provider = PROVIDERS[providerIndexRef.current % PROVIDERS.length]
    providerIndexRef.current++

    const category: Category | undefined =
      Math.random() < 0.25
        ? undefined
        : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id

    try {
      const res = await fetch(`/api/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, count: BATCH_COUNT }),
      })
      const json = await res.json()
      if (json.success && json.data?.odais?.length) {
        retryAttemptRef.current = 0
        setError(null)
        setQueue((q) => [...q, ...json.data.odais])
      } else {
        setError('生成に失敗しました（自動で再試行します）')
        scheduleRetry()
      }
    } catch {
      setError('ネットワークエラー（自動で再試行します）')
      scheduleRetry()
    } finally {
      fetchingRef.current = false
    }
  }, [scheduleRetry])

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryNonce は失敗後の再試行を発火させるための意図的な依存
  useEffect(() => {
    if (active && queue.length < REFILL_THRESHOLD) {
      refill()
    }
  }, [active, queue.length, refill, retryNonce])

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current)
      }
    }
  }, [])

  /**
   * 表示中の先頭お題への評価を確定してキューを進める。
   *
   * @returns 確定できた場合はそのお題。既に確定済み（連打等）なら null
   */
  const rate = useCallback(
    (type: FeedbackType): GeneratedOdai | null => {
      const odai = queue[0]
      if (!odai || ratedHeadRef.current === odai.id) return null

      ratedHeadRef.current = odai.id
      const eventIdPromise = postFeedback(odai.id, type)
      setHistory((h) => [
        ...h.slice(-(MAX_HISTORY - 1)),
        { odai, type, eventIdPromise },
      ])
      setQueue((q) => (q[0]?.id === odai.id ? q.slice(1) : q))
      return odai
    },
    [queue],
  )

  /**
   * 直近の評価を取り消す。お題をキュー先頭に戻し、サーバーの記録も削除する。
   *
   * @returns 取り消した評価の内容。履歴が空なら null
   */
  const undo = useCallback((): {
    odai: GeneratedOdai
    type: FeedbackType
  } | null => {
    const entry = history[history.length - 1]
    if (!entry) return null

    setHistory((h) => h.slice(0, -1))
    // 戻したお題を再評価できるようにする
    ratedHeadRef.current = null
    setQueue((q) => [entry.odai, ...q])
    undoFeedback(entry.eventIdPromise)
    return { odai: entry.odai, type: entry.type }
  }, [history])

  /** コピーはキューを進めない。表示中のお題に copy イベントだけ記録する */
  const recordCopy = useCallback(() => {
    if (current) {
      postFeedback(current.id, 'copy')
    }
  }, [current])

  return { current, error, rate, undo, canUndo: history.length > 0, recordCopy }
}

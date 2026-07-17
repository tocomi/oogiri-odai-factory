'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRatingQueue } from '@/hooks/useRatingQueue'
import type { FeedbackType, GeneratedOdai } from '@/types'

const LIKED_ODAIS_STORAGE_KEY = 'oogiri-liked-odais'

const SOURCE_LABELS = {
  openai: 'GPT',
  claude: 'CLAUDE',
  gemini: 'GEMINI',
} as const

function MaruIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  )
}

function BatsuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <path
        d="M5.5 5.5l13 13M18.5 5.5l-13 13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <path
        d="M8 5l-4 4 4 4M4 9h10a6 6 0 0 1 0 12h-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15 5H7a2 2 0 0 0-2 2v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

type ExitingOdai = {
  odai: GeneratedOdai
  type: 'like' | 'dislike'
}

export default function RateExperience() {
  const [likedOdais, setLikedOdais] = useState<GeneratedOdai[]>([])
  const [view, setView] = useState<'rate' | 'liked'>('rate')
  const [showCopied, setShowCopied] = useState(false)
  const [exiting, setExiting] = useState<ExitingOdai | null>(null)

  const { current, error, rate, undo, canUndo, recordCopy } = useRatingQueue({
    active: view === 'rate',
  })

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(LIKED_ODAIS_STORAGE_KEY)
      if (!saved) return

      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        setLikedOdais(parsed as GeneratedOdai[])
      }
    } catch {
      window.sessionStorage.removeItem(LIKED_ODAIS_STORAGE_KEY)
    }
  }, [])

  const saveLikedOdai = useCallback((odai: GeneratedOdai) => {
    setLikedOdais((previous) => {
      const next = previous.some((item) => item.id === odai.id)
        ? previous
        : [odai, ...previous]

      try {
        window.sessionStorage.setItem(
          LIKED_ODAIS_STORAGE_KEY,
          JSON.stringify(next),
        )
      } catch {
        // ストレージが利用できない場合でも、現在の画面では見返せるようにする
      }

      return next
    })
  }, [])

  const removeLikedOdai = useCallback((id: string) => {
    setLikedOdais((previous) => {
      const next = previous.filter((item) => item.id !== id)

      try {
        window.sessionStorage.setItem(
          LIKED_ODAIS_STORAGE_KEY,
          JSON.stringify(next),
        )
      } catch {
        // ストレージが利用できない場合でも、現在の画面の表示は正しく保つ
      }

      return next
    })
  }, [])

  const handleRate = useCallback(
    (type: FeedbackType) => {
      const odai = rate(type)
      if (!odai) return

      if (type === 'like') {
        saveLikedOdai(odai)
      }

      if (type === 'like' || type === 'dislike') {
        setExiting({ odai, type })
      }

      setShowCopied(false)
    },
    [rate, saveLikedOdai],
  )

  const handleUndo = useCallback(() => {
    const undone = undo()
    if (!undone) return

    // 飛んでいく途中のカードが残っていたら消して、戻ってきたカードだけを見せる
    setExiting(null)

    if (undone.type === 'like') {
      removeLikedOdai(undone.odai.id)
    }

    setShowCopied(false)
  }, [undo, removeLikedOdai])

  const copyCurrent = useCallback(() => {
    if (!current) return
    navigator.clipboard.writeText(current.text)
    recordCopy()
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }, [current, recordCopy])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (view !== 'rate' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) {
        return
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'j':
          e.preventDefault()
          handleRate('like')
          break
        case 'ArrowLeft':
        case 'f':
          e.preventDefault()
          handleRate('dislike')
          break
        case 'ArrowDown':
        case ' ':
          e.preventDefault()
          handleRate('skip')
          break
        case 'c':
          e.preventDefault()
          copyCurrent()
          break
        case 'z':
        case 'Backspace':
          e.preventDefault()
          handleUndo()
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleRate, handleUndo, copyCurrent, view])

  return (
    <main className="flex h-dvh flex-col overflow-hidden p-4">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        {/* ヘッダー */}
        <header className="flex items-center justify-between py-3">
          <h1 className="flex items-center gap-2.5 font-bold font-mincho text-ink text-lg tracking-wide sm:text-xl">
            <span className="inline-block size-2.5 bg-shu" aria-hidden />
            大喜利ネタ工場
          </h1>
          <button
            type="button"
            onClick={() =>
              setView((currentView) =>
                currentView === 'rate' ? 'liked' : 'rate',
              )
            }
            className="rounded-md border border-line bg-card px-3 py-1.5 font-medium text-muted text-xs transition-colors hover:border-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 sm:text-sm"
            aria-pressed={view === 'liked'}
          >
            {view === 'liked'
              ? '← 評価にもどる'
              : `あり一覧 (${likedOdais.length})`}
          </button>
        </header>

        {view === 'rate' && error && (
          <p className="py-1 text-center text-shu text-xs">{error}</p>
        )}

        {view === 'liked' ? (
          <section
            className="min-h-0 flex-1 overflow-y-auto py-4"
            aria-labelledby="liked-odais-heading"
          >
            <h1
              id="liked-odais-heading"
              className="text-balance font-bold font-mincho text-ink text-xl"
            >
              ありにしたお題
            </h1>
            <p className="mt-1 text-pretty text-muted text-sm">
              このブラウザを閉じるまで保存されます。
            </p>
            {likedOdais.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {likedOdais.map((odai) => (
                  <li
                    key={odai.id}
                    className="rounded-md border border-line bg-card p-4"
                  >
                    <p className="text-pretty font-medium font-mincho text-ink leading-relaxed">
                      {odai.text}
                    </p>
                    <p className="mt-2 text-[11px] text-muted tracking-widest">
                      {SOURCE_LABELS[odai.source]}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center text-center text-muted">
                <p className="text-pretty">
                  まだ「あり」にしたお題はありません。
                </p>
                <button
                  type="button"
                  onClick={() => setView('rate')}
                  className="mt-4 rounded-md border border-line bg-card px-4 py-2 font-medium text-ink text-sm transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                >
                  評価を続ける
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* お題カード */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center py-3">
              {current ? (
                <div
                  key={current.id}
                  className="relative w-full animate-card-in rounded-md border border-line bg-card px-6 py-12 shadow-[0_1px_2px_rgba(36,34,30,0.05),0_12px_32px_rgba(36,34,30,0.07)] sm:px-12 sm:py-16"
                >
                  <p className="text-balance text-center font-medium font-mincho text-ink text-xl leading-relaxed sm:text-2xl lg:text-3xl">
                    {current.text}
                  </p>
                  <button
                    type="button"
                    onClick={copyCurrent}
                    className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted text-xs transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
                    aria-label="お題をコピー"
                  >
                    {showCopied ? (
                      'コピーしました'
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <MaruIcon className="mx-auto mb-3 size-8 animate-pulse text-line" />
                  <p className="text-sm">お題を生成しています…</p>
                </div>
              )}

              {/* 評価済みカードの退場演出（あり=右へ朱、なし=左へ紺） */}
              {exiting && (
                <div
                  key={exiting.odai.id}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center py-3"
                  aria-hidden="true"
                  onAnimationEnd={() => setExiting(null)}
                >
                  <div
                    className={`relative w-full rounded-md border-2 px-6 py-12 shadow-[0_1px_2px_rgba(36,34,30,0.05),0_12px_32px_rgba(36,34,30,0.07)] sm:px-12 sm:py-16 ${
                      exiting.type === 'like'
                        ? 'animate-card-out-like border-shu bg-[#fbf1ee]'
                        : 'animate-card-out-dislike border-kon bg-[#eef3f8]'
                    }`}
                  >
                    <p className="text-balance text-center font-medium font-mincho text-ink text-xl leading-relaxed sm:text-2xl lg:text-3xl">
                      {exiting.odai.text}
                    </p>
                    <span className="absolute inset-0 flex items-center justify-center">
                      {exiting.type === 'like' ? (
                        <MaruIcon className="size-28 rotate-6 text-shu/50" />
                      ) : (
                        <BatsuIcon className="-rotate-6 size-28 text-kon/50" />
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 評価ボタン */}
            <div className="flex flex-col items-center gap-4 pb-6 sm:pb-5">
              <div className="flex items-center justify-center gap-8 sm:gap-14">
                <button
                  type="button"
                  onClick={() => handleRate('dislike')}
                  disabled={!current}
                  className="flex items-center gap-2.5 whitespace-nowrap rounded-md border-2 border-kon px-7 py-3 font-bold text-kon transition-colors hover:bg-kon hover:text-card focus-visible:outline-2 focus-visible:outline-kon focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:px-9"
                >
                  <BatsuIcon className="size-[18px]" />
                  なし
                </button>
                <button
                  type="button"
                  onClick={() => handleRate('like')}
                  disabled={!current}
                  className="flex items-center gap-2.5 whitespace-nowrap rounded-md border-2 border-shu px-7 py-3 font-bold text-shu transition-colors hover:bg-shu hover:text-card focus-visible:outline-2 focus-visible:outline-shu focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:px-9"
                >
                  <MaruIcon className="size-[18px]" />
                  あり
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-4 py-1.5 text-muted text-sm transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40"
                >
                  <UndoIcon className="size-4" />
                  取り消す
                </button>
                <button
                  type="button"
                  onClick={() => handleRate('skip')}
                  disabled={!current}
                  className="whitespace-nowrap rounded-md px-4 py-1.5 text-muted text-sm transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40"
                >
                  スキップ
                </button>
              </div>
            </div>

            {/* キー操作の説明（キーボードのない画面では非表示） */}
            <footer className="hidden pb-2 text-center text-muted text-xs sm:block">
              <p className="flex items-center justify-center gap-5">
                <span>
                  <kbd>J</kbd>/<kbd>→</kbd> あり
                </span>
                <span>
                  <kbd>F</kbd>/<kbd>←</kbd> なし
                </span>
                <span>
                  <kbd>Space</kbd> スキップ
                </span>
                <span>
                  <kbd>Z</kbd> 取り消す
                </span>
                <span>
                  <kbd>C</kbd> コピー
                </span>
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRatingQueue } from '@/hooks/useRatingQueue'
import type { FeedbackType, GeneratedOdai } from '@/types'

const LIKED_ODAIS_STORAGE_KEY = 'oogiri-liked-odais'

export default function RateExperience() {
  const [likedOdais, setLikedOdais] = useState<GeneratedOdai[]>([])
  const [view, setView] = useState<'rate' | 'liked'>('rate')
  const [flash, setFlash] = useState<'like' | 'dislike' | null>(null)
  const [showCopied, setShowCopied] = useState(false)

  const { current, error, rate, recordCopy } = useRatingQueue({
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

  const handleRate = useCallback(
    (type: FeedbackType) => {
      const odai = rate(type)
      if (!odai) return

      if (type === 'like') {
        saveLikedOdai(odai)
      }

      if (type === 'like' || type === 'dislike') {
        setFlash(type)
        setTimeout(() => setFlash(null), 180)
      }

      setShowCopied(false)
    },
    [rate, saveLikedOdai],
  )

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
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleRate, copyCurrent, view])

  return (
    <main className="flex h-dvh flex-col overflow-hidden p-4">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        {/* ヘッダー */}
        <header className="flex items-center justify-between py-2">
          <h1 className="text-balance font-bold text-gray-900 text-lg sm:text-xl">
            🏭 大喜利ネタ工場
          </h1>
          <button
            type="button"
            onClick={() =>
              setView((currentView) =>
                currentView === 'rate' ? 'liked' : 'rate',
              )
            }
            className="rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700 text-xs transition-colors hover:bg-green-100 sm:text-sm"
            aria-pressed={view === 'liked'}
          >
            {view === 'liked'
              ? '← お題を見る'
              : `👍 いいねしたお題 (${likedOdais.length})`}
          </button>
        </header>

        {view === 'rate' && error && (
          <p className="py-1 text-center text-orange-500 text-xs">{error}</p>
        )}

        {view === 'liked' ? (
          <section
            className="min-h-0 flex-1 overflow-y-auto py-4"
            aria-labelledby="liked-odais-heading"
          >
            <h1
              id="liked-odais-heading"
              className="text-balance font-bold text-gray-900 text-xl"
            >
              いいねしたお題
            </h1>
            <p className="mt-1 text-pretty text-gray-500 text-sm">
              このブラウザを閉じるまで保存されます。
            </p>
            {likedOdais.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {likedOdais.map((odai) => (
                  <li
                    key={odai.id}
                    className="rounded-xl bg-white p-4 shadow-sm"
                  >
                    <p className="text-pretty text-gray-900 leading-relaxed">
                      {odai.text}
                    </p>
                    <p className="mt-2 text-gray-400 text-xs">
                      {odai.source === 'openai'
                        ? 'GPT'
                        : odai.source === 'claude'
                          ? 'Claude'
                          : 'Gemini'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center text-center text-gray-500">
                <p className="text-pretty">まだいいねしたお題はありません。</p>
                <button
                  type="button"
                  onClick={() => setView('rate')}
                  className="mt-3 rounded-full bg-green-50 px-4 py-2 font-medium text-green-700 text-sm transition-colors hover:bg-green-100"
                >
                  評価を続ける
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* お題カード */}
            <div className="flex min-h-0 flex-1 items-center justify-center py-3">
              {current ? (
                <div
                  key={current.id}
                  className={`relative w-full rounded-2xl p-6 pb-10 shadow-lg transition-colors duration-150 sm:p-10 sm:pb-12 ${
                    flash === 'like'
                      ? 'bg-green-100'
                      : flash === 'dislike'
                        ? 'bg-red-100'
                        : 'bg-white'
                  }`}
                >
                  <p className="text-balance text-center text-gray-900 text-xl leading-relaxed sm:text-2xl lg:text-3xl">
                    {current.text}
                  </p>
                  <button
                    type="button"
                    onClick={copyCurrent}
                    className="absolute right-3 bottom-3 rounded-md bg-gray-50 px-2 py-1 text-gray-400 text-sm transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="お題をコピー"
                  >
                    {showCopied ? '✓ コピーしました' : '📋'}
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="mb-2 animate-pulse text-4xl">🏭</div>
                  <p>お題を生成中...</p>
                </div>
              )}
            </div>

            {/* 評価ボタン */}
            <div className="flex items-center justify-center gap-2 pb-6 sm:gap-4 sm:pb-5">
              <button
                type="button"
                onClick={() => handleRate('dislike')}
                disabled={!current}
                className="whitespace-nowrap rounded-full bg-red-50 px-6 py-3 font-bold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-40 sm:px-8"
              >
                👎 なし
              </button>
              <button
                type="button"
                onClick={() => handleRate('skip')}
                disabled={!current}
                className="whitespace-nowrap rounded-full bg-gray-50 px-4 py-3 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40 sm:px-6"
              >
                ⏭ スキップ
              </button>
              <button
                type="button"
                onClick={() => handleRate('like')}
                disabled={!current}
                className="whitespace-nowrap rounded-full bg-green-50 px-6 py-3 font-bold text-green-600 transition-colors hover:bg-green-100 disabled:opacity-40 sm:px-8"
              >
                👍 あり
              </button>
            </div>

            {/* キー操作の説明（キーボードのない画面では非表示） */}
            <footer className="hidden py-2 text-center text-gray-400 text-xs sm:block">
              <p>
                <kbd>→</kbd>/<kbd>J</kbd> 👍　<kbd>←</kbd>/<kbd>F</kbd> 👎{'　'}
                <kbd>Space</kbd> スキップ　<kbd>C</kbd> コピー
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  )
}

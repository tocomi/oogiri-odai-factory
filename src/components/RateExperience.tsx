'use client'

import { useCallback, useEffect, useState } from 'react'
import { LikedOdaiList } from '@/components/LikedOdaiList'
import {
  ExitingOdaiCard,
  OdaiCard,
  OdaiCardPlaceholder,
} from '@/components/OdaiCard'
import { RatingControls } from '@/components/RatingControls'
import { useLikedOdais } from '@/hooks/useLikedOdais'
import { useRatingQueue } from '@/hooks/useRatingQueue'
import type { FeedbackType, GeneratedOdai } from '@/types'

type ExitingOdai = {
  odai: GeneratedOdai
  seq: number
  type: 'like' | 'dislike'
  /** スワイプで指を離した位置。ボタンやキーボードでの評価は 0（＝中央から捌く） */
  offsetX: number
}

export default function RateExperience() {
  const [view, setView] = useState<'rate' | 'liked'>('rate')
  const [showCopied, setShowCopied] = useState(false)
  const [exiting, setExiting] = useState<ExitingOdai | null>(null)

  const { likedOdais, like, unlike } = useLikedOdais()
  const { current, error, rate, undo, canUndo, ratedCount, recordCopy } =
    useRatingQueue({ active: view === 'rate' })

  /** 表示中のお題が何枚目か。伝票の見出しに出す */
  const seq = ratedCount + 1

  const handleRate = useCallback(
    (type: FeedbackType, offsetX = 0) => {
      const odai = rate(type)
      if (!odai) return

      if (type === 'like') {
        like(odai)
      }

      if (type === 'like' || type === 'dislike') {
        setExiting({ odai, seq, type, offsetX })
      }

      setShowCopied(false)
    },
    [rate, like, seq],
  )

  const handleUndo = useCallback(() => {
    const undone = undo()
    if (!undone) return

    // 飛んでいく途中のカードが残っていたら消して、戻ってきたカードだけを見せる
    setExiting(null)

    if (undone.type === 'like') {
      unlike(undone.odai.id)
    }

    setShowCopied(false)
  }, [undo, unlike])

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
    <main className="relative flex h-dvh flex-col overflow-hidden p-4">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        {/* ヘッダー。台紙のハッチングを断ち切る帯として置く */}
        <header className="relative z-10 flex items-center justify-between gap-3 border-ink border-b-[3px] bg-daishi py-3">
          <h1 className="-rotate-[1.2deg] bg-ink px-3 py-1.5 font-extrabold text-base text-daishi tracking-[0.06em] sm:text-lg">
            大喜利お題工場
          </h1>
          <button
            type="button"
            onClick={() =>
              setView((currentView) =>
                currentView === 'rate' ? 'liked' : 'rate',
              )
            }
            className="flex items-center gap-2 whitespace-nowrap border-[3px] border-ink bg-card px-3 py-1.5 font-extrabold text-ink text-xs shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4 sm:text-sm"
            aria-pressed={view === 'liked'}
          >
            {view === 'liked' ? (
              '← 評価にもどる'
            ) : (
              <>
                いいね一覧
                <span className="min-w-6 rounded-full bg-ka px-2 py-px text-center text-card">
                  {likedOdais.length}
                </span>
              </>
            )}
          </button>
        </header>

        {view === 'rate' && error && (
          <p className="relative z-10 py-1.5 text-center font-bold text-ka text-xs">
            {error}
          </p>
        )}

        {view === 'liked' ? (
          <LikedOdaiList odais={likedOdais} onBack={() => setView('rate')} />
        ) : (
          <>
            <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center py-3">
              {current ? (
                <OdaiCard
                  key={current.id}
                  odai={current}
                  seq={seq}
                  copied={showCopied}
                  onCopy={copyCurrent}
                  onSwipe={handleRate}
                />
              ) : (
                <OdaiCardPlaceholder />
              )}

              {exiting && (
                <ExitingOdaiCard
                  key={exiting.odai.id}
                  odai={exiting.odai}
                  seq={exiting.seq}
                  type={exiting.type}
                  offsetX={exiting.offsetX}
                  onAnimationEnd={() => setExiting(null)}
                />
              )}
            </div>

            <RatingControls
              canRate={!!current}
              canUndo={canUndo}
              onRate={handleRate}
              onUndo={handleUndo}
            />
          </>
        )}
      </div>
    </main>
  )
}

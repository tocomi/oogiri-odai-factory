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
  type: 'like' | 'dislike'
}

export default function RateExperience() {
  const [view, setView] = useState<'rate' | 'liked'>('rate')
  const [showCopied, setShowCopied] = useState(false)
  const [exiting, setExiting] = useState<ExitingOdai | null>(null)

  const { likedOdais, like, unlike } = useLikedOdais()
  const { current, error, rate, undo, canUndo, recordCopy } = useRatingQueue({
    active: view === 'rate',
  })

  const handleRate = useCallback(
    (type: FeedbackType) => {
      const odai = rate(type)
      if (!odai) return

      if (type === 'like') {
        like(odai)
      }

      if (type === 'like' || type === 'dislike') {
        setExiting({ odai, type })
      }

      setShowCopied(false)
    },
    [rate, like],
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
              : `いいね一覧 (${likedOdais.length})`}
          </button>
        </header>

        {view === 'rate' && error && (
          <p className="py-1 text-center text-shu text-xs">{error}</p>
        )}

        {view === 'liked' ? (
          <LikedOdaiList odais={likedOdais} onBack={() => setView('rate')} />
        ) : (
          <>
            <div className="relative flex min-h-0 flex-1 items-center justify-center py-3">
              {current ? (
                <OdaiCard
                  key={current.id}
                  odai={current}
                  copied={showCopied}
                  onCopy={copyCurrent}
                />
              ) : (
                <OdaiCardPlaceholder />
              )}

              {exiting && (
                <ExitingOdaiCard
                  key={exiting.odai.id}
                  odai={exiting.odai}
                  type={exiting.type}
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

import { BatsuIcon, MaruIcon, UndoIcon } from '@/components/icons'
import type { FeedbackType } from '@/types'

type Props = {
  canRate: boolean
  canUndo: boolean
  onRate: (type: FeedbackType) => void
  onUndo: () => void
}

export function RatingControls({ canRate, canUndo, onRate, onUndo }: Props) {
  return (
    <>
      <div className="flex flex-col items-center gap-4 pb-6 sm:pb-5">
        <div className="flex items-center justify-center gap-8 sm:gap-14">
          <button
            type="button"
            onClick={() => onRate('dislike')}
            disabled={!canRate}
            className="flex items-center gap-2.5 whitespace-nowrap rounded-md border-2 border-kon px-7 py-3 font-bold text-kon transition-colors hover:bg-kon hover:text-card focus-visible:outline-2 focus-visible:outline-kon focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:px-9"
          >
            <BatsuIcon className="size-[18px]" />
            なし
          </button>
          <button
            type="button"
            onClick={() => onRate('like')}
            disabled={!canRate}
            className="flex items-center gap-2.5 whitespace-nowrap rounded-md border-2 border-shu px-7 py-3 font-bold text-shu transition-colors hover:bg-shu hover:text-card focus-visible:outline-2 focus-visible:outline-shu focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:px-9"
          >
            <MaruIcon className="size-[18px]" />
            あり
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-4 py-1.5 text-muted text-sm transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40"
          >
            <UndoIcon className="size-4" />
            取り消す
          </button>
          <button
            type="button"
            onClick={() => onRate('skip')}
            disabled={!canRate}
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
  )
}

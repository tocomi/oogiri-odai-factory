import { BatsuIcon, MaruIcon, UndoIcon } from '@/components/icons'
import type { FeedbackType } from '@/types'

/**
 * 押し込む手応えを出すため、影の分だけ動かして影を詰める。
 * 押せないときは半透明にせず塗りを抜く（透けると台紙の地が出て濁る）
 */
const STAMP_BUTTON =
  'flex items-center gap-2.5 whitespace-nowrap border-[3px] border-ink px-7 py-3.5 font-extrabold text-lg shadow-[6px_6px_0_var(--color-ink)] transition-transform hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_var(--color-ink)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4 disabled:pointer-events-none disabled:border-ink/35 disabled:bg-card disabled:text-ink/35 sm:px-9'

const SUB_BUTTON =
  'flex items-center gap-1.5 whitespace-nowrap border-transparent border-b-2 px-1 py-1 font-extrabold text-ink/60 text-xs tracking-[0.06em] transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 disabled:pointer-events-none disabled:text-ink/30'

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
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <button
            type="button"
            onClick={() => onRate('dislike')}
            disabled={!canRate}
            className={`${STAMP_BUTTON} bg-hi text-ink`}
          >
            <BatsuIcon className="size-[18px]" />
            なし
          </button>
          <button
            type="button"
            onClick={() => onRate('like')}
            disabled={!canRate}
            className={`${STAMP_BUTTON} bg-ka text-card`}
          >
            <MaruIcon className="size-[18px]" />
            あり
          </button>
        </div>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={SUB_BUTTON}
          >
            <UndoIcon className="size-3.5" />
            取り消す
          </button>
          <button
            type="button"
            onClick={() => onRate('skip')}
            disabled={!canRate}
            className={SUB_BUTTON}
          >
            とばす
          </button>
        </div>
      </div>

      {/* キー操作の説明（キーボードのない画面では非表示） */}
      <footer className="hidden pb-2 text-center font-extrabold text-[10px] text-ink/55 sm:block">
        <p className="flex items-center justify-center gap-4">
          <span>
            <kbd>J</kbd>/<kbd>→</kbd> あり
          </span>
          <span>
            <kbd>F</kbd>/<kbd>←</kbd> なし
          </span>
          <span>
            <kbd>Space</kbd> とばす
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

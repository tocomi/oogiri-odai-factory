import { BatsuIcon, CopyIcon, MaruIcon } from '@/components/icons'
import type { GeneratedOdai } from '@/types'

/** 表示中のカードと退場アニメーション中のカードで、枠線以外の見た目を揃える */
const CARD_BASE =
  'relative w-full rounded-md px-6 py-12 shadow-[0_1px_2px_rgba(36,34,30,0.05),0_12px_32px_rgba(36,34,30,0.07)] sm:px-12 sm:py-16'
const CARD_TEXT =
  'text-balance text-center font-medium font-mincho text-ink text-xl leading-relaxed sm:text-2xl lg:text-3xl'

type OdaiCardProps = {
  odai: GeneratedOdai
  copied: boolean
  onCopy: () => void
}

/**
 * 評価対象として表示中のお題。
 *
 * お題が変わるたびに再マウントさせて入場演出を出すため、
 * 呼び出し側で key にお題の id を渡すこと
 */
export function OdaiCard({ odai, copied, onCopy }: OdaiCardProps) {
  return (
    <div className={`${CARD_BASE} animate-card-in border border-line bg-card`}>
      <p className={CARD_TEXT}>{odai.text}</p>
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted text-xs transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
        aria-label="お題をコピー"
      >
        {copied ? 'コピーしました' : <CopyIcon className="size-4" />}
      </button>
    </div>
  )
}

/** キューが空でお題を生成している間の代替表示 */
export function OdaiCardPlaceholder() {
  return (
    <div className="text-center text-muted">
      <MaruIcon className="mx-auto mb-3 size-8 animate-pulse text-line" />
      <p className="text-sm">お題を生成しています…</p>
    </div>
  )
}

type ExitingOdaiCardProps = {
  odai: GeneratedOdai
  type: 'like' | 'dislike'
  onAnimationEnd: () => void
}

/**
 * 評価済みカードの退場演出（あり=右へ朱、なし=左へ紺）。
 * 表示中のカードに重ねて流すだけなので、操作も読み上げも対象外にする
 */
export function ExitingOdaiCard({
  odai,
  type,
  onAnimationEnd,
}: ExitingOdaiCardProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center py-3"
      aria-hidden="true"
      onAnimationEnd={onAnimationEnd}
    >
      <div
        className={`${CARD_BASE} border-2 ${
          type === 'like'
            ? 'animate-card-out-like border-shu bg-[#fbf1ee]'
            : 'animate-card-out-dislike border-kon bg-[#eef3f8]'
        }`}
      >
        <p className={CARD_TEXT}>{odai.text}</p>
        <span className="absolute inset-0 flex items-center justify-center">
          {type === 'like' ? (
            <MaruIcon className="size-28 rotate-6 text-shu/50" />
          ) : (
            <BatsuIcon className="-rotate-6 size-28 text-kon/50" />
          )}
        </span>
      </div>
    </div>
  )
}

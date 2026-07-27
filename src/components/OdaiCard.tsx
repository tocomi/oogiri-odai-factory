import { CopyIcon, MaruIcon } from '@/components/icons'
import type { GeneratedOdai } from '@/types'

/** 表示中のカードと退場アニメーション中のカードで、見た目を揃える */
const CARD_BASE =
  'relative w-full border-[3px] border-ink bg-card px-5 pt-4 pb-14 shadow-[9px_9px_0_var(--color-ink)] sm:px-8 sm:pt-5'
const CARD_TEXT =
  'text-pretty font-extrabold text-ink text-2xl leading-[1.5] tracking-[-0.01em] sm:text-3xl'

/**
 * 伝票の見出し行。捌いている枚数だけを出す。
 * どのAIが書いたかは判断に効かせたくないので、いいね一覧に取っておく
 */
function CardSlip({ seq }: { seq: number }) {
  return (
    <div className="border-ink/30 border-b-2 border-dashed pb-2.5">
      <span className="inline-block bg-ink px-2 py-0.5 font-extrabold text-[10px] text-card tracking-[0.2em]">
        {seq}枚目
      </span>
    </div>
  )
}

type OdaiCardProps = {
  odai: GeneratedOdai
  seq: number
  copied: boolean
  onCopy: () => void
}

/**
 * 評価対象として表示中のお題。
 *
 * お題が変わるたびに再マウントさせて入場演出を出すため、
 * 呼び出し側で key にお題の id を渡すこと
 */
export function OdaiCard({ odai, seq, copied, onCopy }: OdaiCardProps) {
  return (
    /* 後ろに控える次のお題を重ねて、まだ束があることを見せる */
    <div className="relative w-full max-w-2xl">
      <span
        className="absolute inset-0 border-[3px] border-ink bg-card"
        style={{ transform: 'rotate(2.4deg) translateY(6px)' }}
        aria-hidden
      />
      <span
        className="absolute inset-0 border-[3px] border-ink bg-card"
        style={{ transform: 'rotate(-1.6deg) translateY(3px)' }}
        aria-hidden
      />
      <div className={`${CARD_BASE} animate-card-in`}>
        <CardSlip seq={seq} />
        <p className={`${CARD_TEXT} pt-6 pb-4`}>{odai.text}</p>
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-3 bottom-3 flex items-center gap-1.5 border-2 border-ink bg-card px-2.5 py-1 font-extrabold text-[11px] text-ink tracking-[0.1em] shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-3"
          aria-label="お題をコピー"
        >
          {copied ? (
            'コピーしました'
          ) : (
            <>
              <CopyIcon className="size-3.5" />
              コピー
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/** キューが空でお題を生成している間の代替表示。まだ届いていない申請書の空欄 */
export function OdaiCardPlaceholder() {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-3 border-[3px] border-ink/35 border-dashed px-6 py-20 text-center">
      <MaruIcon className="size-8 animate-pulse text-ink/35" />
      <p className="font-extrabold text-ink/55 text-sm">
        お題を生成しています…
      </p>
    </div>
  )
}

type ExitingOdaiCardProps = {
  odai: GeneratedOdai
  seq: number
  type: 'like' | 'dislike'
  onAnimationEnd: () => void
}

/**
 * 評価済みカードの退場演出。印が押されてから捌かれる（可=右へ、否=左へ）。
 * 表示中のカードに重ねて流すだけなので、操作も読み上げも対象外にする
 */
export function ExitingOdaiCard({
  odai,
  seq,
  type,
  onAnimationEnd,
}: ExitingOdaiCardProps) {
  const like = type === 'like'

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
      /* 退場アニメーションの方が印より後に終わるので、これで消し込む */
      onAnimationEnd={(e) => {
        if (e.animationName.startsWith('card-out')) onAnimationEnd()
      }}
    >
      <div className="relative w-full max-w-2xl">
        <div
          className={`${CARD_BASE} ${
            like ? 'animate-card-out-like' : 'animate-card-out-dislike'
          }`}
        >
          <CardSlip seq={seq} />
          <p className={`${CARD_TEXT} pt-6 pb-4`}>{odai.text}</p>
          {/* 印は本物のゴム印と同じくお題の上に重なる */}
          <span
            className={`-translate-y-1/2 absolute top-1/2 right-4 flex size-24 animate-stamp-in flex-col items-center justify-center rounded-full border-[5px] border-double font-extrabold tracking-[0.1em] sm:right-8 sm:size-32 sm:border-[6px] ${
              like ? 'border-ka text-ka' : 'border-hi text-hi'
            }`}
          >
            <b className="text-3xl leading-none sm:text-4xl">
              {like ? '可' : '否'}
            </b>
            <span className="mt-1 text-[8px] sm:mt-1.5 sm:text-[9px]">
              OOGIRI
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

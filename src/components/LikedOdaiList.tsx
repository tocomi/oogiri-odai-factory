import { MAX_LIKED_ODAIS } from '@/hooks/useLikedOdais'
import type { GeneratedOdai } from '@/types'

const SOURCE_LABELS = {
  openai: 'GPT',
  claude: 'CLAUDE',
  gemini: 'GEMINI',
} as const

type Props = {
  odais: GeneratedOdai[]
  onBack: () => void
}

export function LikedOdaiList({ odais, onBack }: Props) {
  return (
    <section
      className="relative z-10 min-h-0 flex-1 overflow-y-auto py-4"
      aria-labelledby="liked-odais-heading"
    >
      <h1
        id="liked-odais-heading"
        className="text-balance font-extrabold text-2xl"
      >
        いいねしたお題
      </h1>
      <p className="mt-1.5 text-pretty font-bold text-ink/65 text-xs leading-relaxed">
        このブラウザに新しい順で最大{MAX_LIKED_ODAIS}
        件まで保存されます。超えた分は古いものから消えます。
      </p>
      {odais.length > 0 ? (
        /* 決裁済みの束。1枚ずつ角度をずらして積んだ紙に見せる */
        <ul className="mt-6 space-y-4 pr-2 pb-2">
          {odais.map((odai, i) => (
            <li
              key={odai.id}
              className="relative border-[3px] border-ink bg-card py-4 pr-20 pl-4 shadow-[5px_5px_0_var(--color-ink)]"
              style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.6}deg)` }}
            >
              <p className="text-pretty font-extrabold leading-relaxed">
                {odai.text}
              </p>
              <p className="mt-2 font-extrabold text-[9px] text-ink/55 tracking-[0.2em]">
                {SOURCE_LABELS[odai.source]}
              </p>
              <span
                className="-translate-y-1/2 absolute top-1/2 right-4 flex size-13 rotate-[-12deg] items-center justify-center rounded-full border-[3px] border-ka border-double font-extrabold text-base text-ka"
                aria-hidden
              >
                可
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center text-center">
          <p className="text-pretty font-bold">
            まだいいねしたお題はありません。
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-5 border-[3px] border-ink bg-card px-5 py-2.5 font-extrabold text-sm shadow-[5px_5px_0_var(--color-ink)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_var(--color-ink)] focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4"
          >
            評価を続ける
          </button>
        </div>
      )}
    </section>
  )
}

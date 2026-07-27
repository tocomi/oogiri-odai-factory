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
      className="min-h-0 flex-1 overflow-y-auto py-4"
      aria-labelledby="liked-odais-heading"
    >
      <h1
        id="liked-odais-heading"
        className="text-balance font-bold font-mincho text-ink text-xl"
      >
        いいねしたお題
      </h1>
      <p className="mt-1 text-pretty text-muted text-sm">
        このブラウザに新しい順で最大{MAX_LIKED_ODAIS}
        件まで保存されます。超えた分は古いものから消えます。
      </p>
      {odais.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {odais.map((odai) => (
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
          <p className="text-pretty">まだいいねしたお題はありません。</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 rounded-md border border-line bg-card px-4 py-2 font-medium text-ink text-sm transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            評価を続ける
          </button>
        </div>
      )}
    </section>
  )
}

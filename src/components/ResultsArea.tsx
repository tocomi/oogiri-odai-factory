'use client'

import OdaiCard from './OdaiCard'

interface ResultsAreaProps {
  results: {
    openai: string[]
    claude: string[]
    gemini: string[]
  }
  isLoading: boolean
  onCopy: (text: string) => void
}

export default function ResultsArea({
  results,
  isLoading,
  onCopy,
}: ResultsAreaProps) {
  const renderAllCards = () => {
    // ローディング中の表示
    if (isLoading) {
      return [
        ...Array.from({ length: 5 }, (_, i) => (
          <OdaiCard
            // biome-ignore lint/suspicious/noArrayIndexKey: no problem
            key={`loading-openai-${i}`}
            odai=""
            source="openai"
            onCopy={() => {}}
            isLoading={true}
          />
        )),
        ...Array.from({ length: 5 }, (_, i) => (
          <OdaiCard
            // biome-ignore lint/suspicious/noArrayIndexKey: no problem
            key={`loading-claude-${i}`}
            odai=""
            source="claude"
            onCopy={() => {}}
            isLoading={true}
          />
        )),
        ...Array.from({ length: 5 }, (_, i) => (
          <OdaiCard
            // biome-ignore lint/suspicious/noArrayIndexKey: no problem
            key={`loading-gemini-${i}`}
            odai=""
            source="gemini"
            onCopy={() => {}}
            isLoading={true}
          />
        )),
      ]
    }

    // 全てのお題を統合
    const allCards = [
      ...results.openai.map((odai) => (
        <OdaiCard
          key={`openai-${odai}`}
          odai={odai}
          source="openai"
          onCopy={() => onCopy(odai)}
        />
      )),
      ...results.claude.map((odai) => (
        <OdaiCard
          key={`claude-${odai}`}
          odai={odai}
          source="claude"
          onCopy={() => onCopy(odai)}
        />
      )),
      ...results.gemini.map((odai) => (
        <OdaiCard
          key={`gemini-${odai}`}
          odai={odai}
          source="gemini"
          onCopy={() => onCopy(odai)}
        />
      )),
    ]

    // 空状態の表示
    if (allCards.length === 0) {
      return [
        <div
          key="empty-state"
          className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500"
        >
          <svg
            role="img"
            aria-label="empty"
            className="mb-4 h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="mb-2 font-medium text-lg">
            お題を生成してみましょう！
          </h3>
          <p className="text-center">
            カテゴリと難易度を選択して、
            <br />
            「お題を生成する」ボタンを押してください。
          </p>
        </div>,
      ]
    }

    return allCards
  }

  return (
    <div className="space-y-6">
      {/* 結果表示エリア */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
        {renderAllCards()}
      </div>
    </div>
  )
}

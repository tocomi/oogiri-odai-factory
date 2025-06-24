'use client'

import type { AIProvider, OdaiItem } from '@/types'
import OdaiCard from './OdaiCard'

interface ResultsAreaProps {
  results: {
    openai: string[]
    claude: string[]
    gemini: string[]
  }
  isLoading: boolean
  favorites: OdaiItem[]
  onCopy: (text: string) => void
  onRegenerate: (source: AIProvider, index: number) => void
  onFavorite: (odai: string, source: AIProvider) => void
}

export default function ResultsArea({
  results,
  isLoading,
  favorites,
  onCopy,
  onRegenerate,
  onFavorite,
}: ResultsAreaProps) {
  const totalResults =
    results.openai.length + results.claude.length + results.gemini.length

  const isFavorite = (odai: string, source: AIProvider) => {
    return favorites.some((fav) => fav.text === odai && fav.source === source)
  }

  const renderAllCards = () => {
    // ローディング中の表示
    if (isLoading) {
      return [
        ...Array.from({ length: 5 }, (_, i) => (
          <OdaiCard
            key={`loading-openai-${i}`}
            odai=""
            source="openai"
            onCopy={() => {}}
            onRegenerate={() => {}}
            onFavorite={() => {}}
            isFavorite={false}
            isLoading={true}
          />
        )),
        ...Array.from({ length: 5 }, (_, i) => (
          <OdaiCard
            key={`loading-claude-${i}`}
            odai=""
            source="claude"
            onCopy={() => {}}
            onRegenerate={() => {}}
            onFavorite={() => {}}
            isFavorite={false}
            isLoading={true}
          />
        )),
        ...Array.from({ length: 5 }, (_, i) => (
          <OdaiCard
            key={`loading-gemini-${i}`}
            odai=""
            source="gemini"
            onCopy={() => {}}
            onRegenerate={() => {}}
            onFavorite={() => {}}
            isFavorite={false}
            isLoading={true}
          />
        )),
      ]
    }

    // 全てのお題を統合
    const allCards = [
      ...results.openai.map((odai, index) => (
        <OdaiCard
          key={`openai-${index}`}
          odai={odai}
          source="openai"
          onCopy={() => onCopy(odai)}
          onRegenerate={() => onRegenerate('openai', index)}
          onFavorite={() => onFavorite(odai, 'openai')}
          isFavorite={isFavorite(odai, 'openai')}
        />
      )),
      ...results.claude.map((odai, index) => (
        <OdaiCard
          key={`claude-${index}`}
          odai={odai}
          source="claude"
          onCopy={() => onCopy(odai)}
          onRegenerate={() => onRegenerate('claude', index)}
          onFavorite={() => onFavorite(odai, 'claude')}
          isFavorite={isFavorite(odai, 'claude')}
        />
      )),
      ...results.gemini.map((odai, index) => (
        <OdaiCard
          key={`gemini-${index}`}
          odai={odai}
          source="gemini"
          onCopy={() => onCopy(odai)}
          onRegenerate={() => onRegenerate('gemini', index)}
          onFavorite={() => onFavorite(odai, 'gemini')}
          isFavorite={isFavorite(odai, 'gemini')}
        />
      )),
    ]

    // 空状態の表示
    if (allCards.length === 0) {
      return [
        <div key="empty-state" className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mb-4"
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
          <h3 className="text-lg font-medium mb-2">
            お題を生成してみましょう！
          </h3>
          <p className="text-center">
            カテゴリと難易度を選択して、
            <br />
            「お題を生成する」ボタンを押してください。
          </p>
        </div>
      ]
    }

    return allCards
  }

  return (
    <div className="space-y-6">
      {/* 結果表示エリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderAllCards()}
      </div>

      {/* 統計情報 */}
      {totalResults > 0 && !isLoading && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {totalResults}
              </div>
              <div className="text-sm text-gray-600">総お題数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {results.openai.length}
              </div>
              <div className="text-sm text-gray-600">OpenAI</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {results.claude.length}
              </div>
              <div className="text-sm text-gray-600">Claude</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {results.gemini.length}
              </div>
              <div className="text-sm text-gray-600">Gemini</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

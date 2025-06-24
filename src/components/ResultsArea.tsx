'use client'

import { useState } from 'react'
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
  const [activeTab, setActiveTab] = useState<'all' | AIProvider>('all')

  const totalResults =
    results.openai.length + results.claude.length + results.gemini.length

  const isFavorite = (odai: string, source: AIProvider) => {
    return favorites.some((fav) => fav.text === odai && fav.source === source)
  }

  const getTabCount = (tab: 'all' | AIProvider) => {
    if (tab === 'all') return totalResults
    return results[tab].length
  }

  const renderCards = (odais: string[], source: AIProvider) => {
    if (isLoading) {
      return Array.from({ length: 3 }, (_, i) => (
        <OdaiCard
          key={`loading-${source}-${i}`}
          odai=""
          source={source}
          onCopy={() => {}}
          onRegenerate={() => {}}
          onFavorite={() => {}}
          isFavorite={false}
          isLoading={true}
        />
      ))
    }

    return odais.map((odai, index) => (
      <OdaiCard
        key={`${source}-${index}`}
        odai={odai}
        source={source}
        onCopy={() => onCopy(odai)}
        onRegenerate={() => onRegenerate(source, index)}
        onFavorite={() => onFavorite(odai, source)}
        isFavorite={isFavorite(odai, source)}
      />
    ))
  }

  const renderAllCards = () => {
    const allCards = [
      ...renderCards(results.openai, 'openai'),
      ...renderCards(results.claude, 'claude'),
      ...renderCards(results.gemini, 'gemini'),
    ]

    if (allCards.length === 0 && !isLoading) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
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
            上の設定でAIとカテゴリを選択して、
            <br />
            「お題を生成する」ボタンを押してください。
          </p>
        </div>
      )
    }

    return allCards
  }

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          すべて ({getTabCount('all')})
        </button>

        <button
          onClick={() => setActiveTab('openai')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'openai'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          OpenAI ({getTabCount('openai')})
        </button>

        <button
          onClick={() => setActiveTab('claude')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'claude'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Claude ({getTabCount('claude')})
        </button>

        <button
          onClick={() => setActiveTab('gemini')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'gemini'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Gemini ({getTabCount('gemini')})
        </button>
      </div>

      {/* 結果表示エリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'all' && renderAllCards()}
        {activeTab === 'openai' && renderCards(results.openai, 'openai')}
        {activeTab === 'claude' && renderCards(results.claude, 'claude')}
        {activeTab === 'gemini' && renderCards(results.gemini, 'gemini')}
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

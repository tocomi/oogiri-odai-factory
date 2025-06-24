'use client'

import { useState } from 'react'
import ControlPanel from '@/components/ControlPanel'
import ResultsArea from '@/components/ResultsArea'
import type { AIProvider, GenerateParams, OdaiItem, UIState } from '@/types'

export default function Home() {
  const [state, setState] = useState<UIState>({
    isLoading: false,
    results: {
      openai: [],
      claude: [],
      gemini: [],
    },
    favorites: [],
    error: null,
  })

  const handleGenerate = async (params: GenerateParams) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // 常に全AI生成
      const response = await fetch('/api/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: params.category || undefined,
          difficulty: params.difficulty,
          count: params.count,
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          results: {
            openai: result.data.openai,
            claude: result.data.claude,
            gemini: result.data.gemini,
          },
        }))

        if (result.errors) {
          console.warn('Some AI services had errors:', result.errors)
        }
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || 'お題の生成に失敗しました',
        }))
      }
    } catch (error) {
      console.error('Generation error:', error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'ネットワークエラーが発生しました',
      }))
    }
  }

  const handleCopy = (text: string) => {
    console.log('Copied:', text)
  }

  const handleFavorite = (odai: string, source: AIProvider) => {
    const existingIndex = state.favorites.findIndex(
      (fav) => fav.text === odai && fav.source === source,
    )

    if (existingIndex >= 0) {
      // お気に入りから削除
      setState((prev) => ({
        ...prev,
        favorites: prev.favorites.filter((_, i) => i !== existingIndex),
      }))
    } else {
      // お気に入りに追加
      const newFavorite: OdaiItem = {
        id: Date.now().toString(),
        text: odai,
        source,
        createdAt: new Date(),
        isFavorite: true,
      }

      setState((prev) => ({
        ...prev,
        favorites: [...prev.favorites, newFavorite],
      }))
    }
  }

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* ヘッダー */}
        <header className="py-8 text-center">
          <h1 className="mb-4 font-bold text-4xl text-gray-900">
            🏭 大喜利ネタ工場
          </h1>
        </header>

        {/* エラー表示 */}
        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <svg
                role="img"
                aria-label="error"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {state.error}
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* コントロールパネル */}
          <div className="lg:col-span-1">
            <ControlPanel
              onGenerate={handleGenerate}
              isLoading={state.isLoading}
            />
          </div>

          {/* 結果表示エリア */}
          <div className="lg:col-span-2">
            <ResultsArea
              results={state.results}
              isLoading={state.isLoading}
              favorites={state.favorites}
              onCopy={handleCopy}
              onFavorite={handleFavorite}
            />
          </div>
        </div>

        {/* フッター */}
        <footer className="py-8 text-center text-gray-500">
          <p>Powered by OpenAI GPT, Claude, and Gemini</p>
        </footer>
      </div>
    </main>
  )
}

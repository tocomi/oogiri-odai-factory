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
      if (params.selectedAIs.length === 1) {
        // 単一AI生成
        const ai = params.selectedAIs[0]
        const response = await fetch(`/api/${ai}`, {
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
              openai: ai === 'openai' ? result.data.odais : [],
              claude: ai === 'claude' ? result.data.odais : [],
              gemini: ai === 'gemini' ? result.data.odais : [],
            },
          }))
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: result.error || 'お題の生成に失敗しました',
          }))
        }
      } else {
        // 複数AI生成
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
              openai: params.selectedAIs.includes('openai')
                ? result.data.openai
                : [],
              claude: params.selectedAIs.includes('claude')
                ? result.data.claude
                : [],
              gemini: params.selectedAIs.includes('gemini')
                ? result.data.gemini
                : [],
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

  const handleRegenerate = async (source: AIProvider, index: number) => {
    // 個別再生成機能（簡易実装）
    console.log('Regenerate:', source, index)
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ヘッダー */}
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎭 大喜利お題生成器
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            OpenAI、Claude、Geminiの3つのAIを使って、
            多様で創造的な大喜利のお題を生成します
          </p>
        </header>

        {/* エラー表示 */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <svg
                className="w-5 h-5"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              onRegenerate={handleRegenerate}
              onFavorite={handleFavorite}
            />
          </div>
        </div>

        {/* フッター */}
        <footer className="text-center py-8 text-gray-500">
          <p>Powered by OpenAI GPT, Claude, and Gemini</p>
        </footer>
      </div>
    </main>
  )
}

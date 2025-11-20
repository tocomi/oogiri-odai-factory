'use client'

import { useId, useState } from 'react'
import type { GenerateParams } from '@/types'
import CategorySelector from './CategorySelector'
import DifficultySelector from './DifficultySelector'

interface ControlPanelProps {
  onGenerate: (params: GenerateParams) => void
  isLoading: boolean
}

export default function ControlPanel({
  onGenerate,
  isLoading,
}: ControlPanelProps) {
  const keywordInputId = useId()
  const [category, setCategory] = useState<GenerateParams['category']>('')
  const [difficulty, setDifficulty] =
    useState<GenerateParams['difficulty']>('easy')
  const [keyword, setKeyword] = useState('')

  const handleGenerate = () => {
    onGenerate({
      selectedAIs: ['openai', 'claude', 'gemini'], // 常に全AI選択
      category,
      difficulty,
      count: 5, // 固定で5個
      keyword: keyword.trim() || undefined,
    })
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-linear-to-r from-blue-50 via-purple-50 to-orange-50 p-4">
          <div className="mb-2 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="font-medium text-blue-700 text-sm">OpenAI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              <span className="font-medium text-purple-700 text-sm">
                Claude
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span className="font-medium text-orange-700 text-sm">
                Gemini
              </span>
            </div>
          </div>
          <p className="text-center text-gray-600 text-sm">
            3つのAIが異なる視点でお題を生成します
          </p>
        </div>

        <CategorySelector
          selectedCategory={category}
          onCategoryChange={setCategory}
        />

        <DifficultySelector
          selectedDifficulty={difficulty}
          onDifficultyChange={setDifficulty}
        />

        <div className="space-y-2">
          <label
            htmlFor={keywordInputId}
            className="block font-medium text-gray-700 text-sm"
          >
            キーワード（任意）
          </label>
          <input
            id={keywordInputId}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="例: 猫、宇宙、夏休み"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-gray-500 text-xs">
            キーワードを指定すると、そのテーマに沿ったお題が生成されます
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-500 to-purple-600 px-6 py-4 font-semibold text-white transition-all duration-200 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
        >
          {isLoading ? (
            <>
              <svg
                role="img"
                aria-label="loading"
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              生成中...
            </>
          ) : (
            <>
              <svg
                role="img"
                aria-label="generate"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              お題を生成する
            </>
          )}
        </button>
      </div>
    </div>
  )
}

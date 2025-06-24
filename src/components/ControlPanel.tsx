'use client'

import { useState } from 'react'
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
  const [category, setCategory] = useState<GenerateParams['category']>('')
  const [difficulty, setDifficulty] =
    useState<GenerateParams['difficulty']>('medium')

  const handleGenerate = () => {
    onGenerate({
      selectedAIs: ['openai', 'claude', 'gemini'], // 常に全AI選択
      category,
      difficulty,
      count: 5, // 固定で5個
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">
        🎭 大喜利お題生成器
      </h2>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-orange-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-blue-700">OpenAI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium text-purple-700">
                Claude
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-orange-700">
                Gemini
              </span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">
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

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
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
                className="w-5 h-5"
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

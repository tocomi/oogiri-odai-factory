'use client'

import { useState } from 'react'
import type { GenerateParams } from '@/types'
import AISelector from './AISelector'
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
  const [selectedAIs, setSelectedAIs] = useState<GenerateParams['selectedAIs']>(
    ['openai', 'claude', 'gemini'],
  )
  const [category, setCategory] = useState<GenerateParams['category']>('')
  const [difficulty, setDifficulty] =
    useState<GenerateParams['difficulty']>('medium')
  const [count, setCount] = useState<number>(3)

  const handleGenerate = () => {
    if (selectedAIs.length === 0) {
      alert('少なくとも1つのAIを選択してください')
      return
    }

    onGenerate({
      selectedAIs,
      category,
      difficulty,
      count,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center">
        🎭 大喜利お題生成器
      </h2>

      <div className="space-y-6">
        <AISelector
          selectedAIs={selectedAIs}
          onSelectionChange={setSelectedAIs}
        />

        <CategorySelector
          selectedCategory={category}
          onCategoryChange={setCategory}
        />

        <DifficultySelector
          selectedDifficulty={difficulty}
          onDifficultyChange={setDifficulty}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">生成数</h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="5"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="w-12 text-center font-medium text-gray-900">
              {count}個
            </div>
          </div>
          <div className="text-sm text-gray-600">
            各AIから生成するお題の数を選択してください
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || selectedAIs.length === 0}
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

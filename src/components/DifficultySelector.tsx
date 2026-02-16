'use client'

import type { Difficulty } from '@/types'
import { DIFFICULTY_INFO } from '@/types'

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
}

export default function DifficultySelector({
  selectedDifficulty,
  onDifficultyChange,
}: DifficultySelectorProps) {
  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'border-green-300 bg-green-50 text-green-800'
      case 'medium':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800'
      case 'hard':
        return 'border-red-300 bg-red-50 text-red-800'
    }
  }

  const getDifficultyActiveColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'border-green-500 bg-green-500 text-white'
      case 'medium':
        return 'border-yellow-500 bg-yellow-500 text-white'
      case 'hard':
        return 'border-red-500 bg-red-500 text-white'
    }
  }

  return (
    <div className="@container space-y-4">
      <h3 className="font-medium text-gray-900 text-lg">難易度選択</h3>

      <div className="grid @sm:grid-cols-3 grid-cols-1 gap-3">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => {
          const isSelected = selectedDifficulty === difficulty
          const difficultyInfo = DIFFICULTY_INFO[difficulty]

          return (
            <button
              type="button"
              key={difficulty}
              onClick={() => onDifficultyChange(difficulty)}
              className={`rounded-lg border-2 px-4 py-2 text-left transition-all duration-200 ${
                isSelected
                  ? getDifficultyActiveColor(difficulty)
                  : `${getDifficultyColor(difficulty)} hover:border-gray-300`
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isSelected
                      ? 'bg-white'
                      : difficulty === 'easy'
                        ? 'bg-green-500'
                        : difficulty === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                  }`}
                />
                <div>
                  <div className="font-medium">{difficultyInfo.name}</div>
                  <div
                    className={`text-xs ${
                      isSelected ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    {difficultyInfo.description}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

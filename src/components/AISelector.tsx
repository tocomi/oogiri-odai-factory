'use client'

import type { AIProvider } from '@/types'
import { AI_INFO } from '@/types'

interface AISelectorProps {
  selectedAIs: AIProvider[]
  onSelectionChange: (ais: AIProvider[]) => void
}

export default function AISelector({
  selectedAIs,
  onSelectionChange,
}: AISelectorProps) {
  const handleAIToggle = (ai: AIProvider) => {
    if (selectedAIs.includes(ai)) {
      onSelectionChange(selectedAIs.filter((selected) => selected !== ai))
    } else {
      onSelectionChange([...selectedAIs, ai])
    }
  }

  const handleSelectAll = () => {
    if (selectedAIs.length === 3) {
      onSelectionChange([])
    } else {
      onSelectionChange(['openai', 'claude', 'gemini'])
    }
  }

  const getAIColor = (ai: AIProvider) => {
    switch (ai) {
      case 'openai':
        return 'border-blue-300 bg-blue-50 text-blue-800'
      case 'claude':
        return 'border-purple-300 bg-purple-50 text-purple-800'
      case 'gemini':
        return 'border-orange-300 bg-orange-50 text-orange-800'
    }
  }

  const getAIActiveColor = (ai: AIProvider) => {
    switch (ai) {
      case 'openai':
        return 'border-blue-500 bg-blue-500 text-white'
      case 'claude':
        return 'border-purple-500 bg-purple-500 text-white'
      case 'gemini':
        return 'border-orange-500 bg-orange-500 text-white'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 text-lg">AI選択</h3>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-blue-600 text-sm transition-colors hover:text-blue-800"
        >
          {selectedAIs.length === 3 ? '全て解除' : '全て選択'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(['openai', 'claude', 'gemini'] as AIProvider[]).map((ai) => {
          const isSelected = selectedAIs.includes(ai)
          const aiInfo = AI_INFO[ai]

          return (
            <button
              type="button"
              key={ai}
              onClick={() => handleAIToggle(ai)}
              className={`rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                isSelected
                  ? getAIActiveColor(ai)
                  : `${getAIColor(ai)} hover:border-gray-300`
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isSelected
                      ? 'bg-white'
                      : ai === 'openai'
                        ? 'bg-blue-500'
                        : ai === 'claude'
                          ? 'bg-purple-500'
                          : 'bg-orange-500'
                  }`}
                />
                <div>
                  <div className="font-medium">{aiInfo.name}</div>
                  <div
                    className={`text-xs ${
                      isSelected ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    {aiInfo.description}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="text-gray-600 text-sm">
        選択したAIからお題を生成します。複数選択可能です。
      </div>
    </div>
  )
}

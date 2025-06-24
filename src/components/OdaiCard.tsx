'use client'

import { useState } from 'react'
import type { AIProvider } from '@/types'
import { AI_INFO } from '@/types'

interface OdaiCardProps {
  odai: string
  source: AIProvider
  onCopy: () => void
  onRegenerate: () => void
  onFavorite: () => void
  isFavorite: boolean
  isLoading?: boolean
}

export default function OdaiCard({
  odai,
  source,
  onCopy,
  onRegenerate,
  onFavorite,
  isFavorite,
  isLoading = false,
}: OdaiCardProps) {
  const [showCopied, setShowCopied] = useState(false)

  const aiInfo = AI_INFO[source]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(odai)
    onCopy()
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const getSourceColor = (source: AIProvider) => {
    switch (source) {
      case 'openai':
        return 'from-blue-500 to-blue-600'
      case 'claude':
        return 'from-purple-500 to-purple-600'
      case 'gemini':
        return 'from-orange-500 to-orange-600'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 card-hover animate-fade-in-up">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-r ${getSourceColor(source)} flex items-center justify-center text-white font-bold text-sm`}
        >
          {source === 'openai' ? 'GPT' : source === 'claude' ? 'CL' : 'GM'}
        </div>
        <div>
          <div className="font-medium text-gray-900">{aiInfo.name}</div>
          <div className="text-sm text-gray-500">{aiInfo.description}</div>
        </div>
      </div>

      {/* お題テキスト */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed text-base">{odai}</p>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md transition-colors duration-150 flex items-center gap-1"
        >
          {showCopied ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              コピー済み
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              コピー
            </>
          )}
        </button>

        <button
          onClick={onRegenerate}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md transition-colors duration-150 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          再生成
        </button>

        <button
          onClick={onFavorite}
          className={`p-1.5 rounded-md transition-colors duration-150 ${
            isFavorite
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

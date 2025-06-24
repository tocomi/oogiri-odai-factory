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
      <div className="animate-pulse rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="h-4 w-20 rounded bg-gray-200"></div>
        </div>
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-8 rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-hover animate-fade-in-up rounded-lg bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg">
      {/* ヘッダー */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r font-bold text-sm text-white ${getSourceColor(source)}`}
        >
          {source === 'openai' ? 'GPT' : source === 'claude' ? 'CL' : 'GM'}
        </div>
        <div>
          <div className="font-medium text-gray-900">{aiInfo.name}</div>
          <div className="text-gray-500 text-sm">{aiInfo.description}</div>
        </div>
      </div>

      {/* お題テキスト */}
      <div className="mb-4">
        <p className="text-base text-gray-800 leading-relaxed">{odai}</p>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-gray-700 text-sm transition-colors duration-150 hover:bg-gray-200"
        >
          {showCopied ? (
            <>
              <svg
                role="img"
                aria-label="copy"
                className="h-4 w-4"
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
                role="img"
                aria-label="copy"
                className="h-4 w-4"
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
          type="button"
          onClick={onRegenerate}
          className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-gray-700 text-sm transition-colors duration-150 hover:bg-gray-200"
        >
          <svg
            role="img"
            aria-label="regenerate"
            className="h-4 w-4"
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
          type="button"
          onClick={onFavorite}
          className={`rounded-md p-1.5 transition-colors duration-150 ${
            isFavorite
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <svg
            role="img"
            aria-label="favorite"
            className="h-5 w-5"
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

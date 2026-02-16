'use client'

import { useState } from 'react'
import type { AIProvider } from '@/types'

interface OdaiCardProps {
  odai: string
  source: AIProvider
  onCopy: () => void
  isLoading?: boolean
}

export default function OdaiCard({
  odai,
  source,
  onCopy,
  isLoading = false,
}: OdaiCardProps) {
  const [showCopied, setShowCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(odai)
    onCopy()
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const getSourceBgColor = (source: AIProvider) => {
    switch (source) {
      case 'openai':
        return 'bg-blue-50'
      case 'claude':
        return 'bg-purple-50'
      case 'gemini':
        return 'bg-orange-50'
    }
  }

  const getSourceTextColor = (source: AIProvider) => {
    switch (source) {
      case 'openai':
        return 'text-blue-300'
      case 'claude':
        return 'text-purple-300'
      case 'gemini':
        return 'text-orange-300'
    }
  }

  const getSourceLabel = (source: AIProvider) => {
    switch (source) {
      case 'openai':
        return 'GPT'
      case 'claude':
        return 'Claude'
      case 'gemini':
        return 'Gemini'
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg bg-gray-50 shadow-md">
        <div className="flex items-center gap-4 p-4 lg:p-6">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="h-8 w-16 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`card-hover relative animate-fade-in-up rounded-lg shadow-md transition-shadow duration-200 hover:shadow-lg ${getSourceBgColor(source)}`}
    >
      <div className="flex items-center gap-4 p-4 lg:p-6">
        {/* お題テキスト */}
        <div className="min-w-0 flex-1">
          <p className="text-base text-gray-800 leading-relaxed lg:text-lg">
            {odai}
          </p>
        </div>

        {/* アクションボタン */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md bg-white/60 p-1.5 text-gray-700 transition-colors duration-150 hover:bg-white/90"
          >
            {showCopied ? (
              <svg
                role="img"
                aria-label="コピー済み"
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
            ) : (
              <svg
                role="img"
                aria-label="コピー"
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
            )}
          </button>
        </div>
      </div>
      {/* モデル名 */}
      <span
        className={`absolute right-3 bottom-1.5 text-xs ${getSourceTextColor(source)}`}
      >
        {getSourceLabel(source)}
      </span>
    </div>
  )
}

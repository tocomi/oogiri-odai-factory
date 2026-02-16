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
      <div className="animate-pulse rounded-lg bg-white shadow-md">
        <div className="flex items-center gap-4 p-4 lg:p-6">
          <div className="shrink-0">
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="h-8 w-16 rounded bg-gray-200"></div>
            <div className="h-8 w-8 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-hover animate-fade-in-up rounded-lg bg-white shadow-md transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-center gap-4 p-4 lg:p-6">
        {/* AI識別アイコン */}
        <div className="shrink-0">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r font-bold text-sm text-white ${getSourceColor(source)}`}
          >
            {source === 'openai' ? 'GPT' : source === 'claude' ? 'CL' : 'GM'}
          </div>
        </div>

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
        </div>
      </div>
    </div>
  )
}

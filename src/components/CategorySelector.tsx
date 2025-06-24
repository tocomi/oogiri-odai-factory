'use client'

import type { Category } from '@/types'
import { CATEGORIES } from '@/types'

interface CategorySelectorProps {
  selectedCategory: Category | ''
  onCategoryChange: (category: Category | '') => void
}

export default function CategorySelector({
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 text-lg">カテゴリ選択</h3>

      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as Category | '')}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500"
        >
          <option value="">すべてのカテゴリ</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            role="img"
            aria-label="arrow-down"
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {selectedCategory && (
        <div className="rounded-lg bg-purple-50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-lg">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.icon}
            </span>
            <span className="font-medium text-purple-900">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            </span>
          </div>
          <p className="text-purple-700 text-sm">
            {CATEGORIES.find((c) => c.id === selectedCategory)?.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CATEGORIES.slice(0, 8).map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`rounded-md p-2 text-sm transition-colors ${
              selectedCategory === category.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="mb-1 text-base">{category.icon}</div>
            <div className="text-xs">{category.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

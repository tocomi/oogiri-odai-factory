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
      <h3 className="text-lg font-medium text-gray-900">カテゴリ選択</h3>

      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as Category | '')}
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
        >
          <option value="">すべてのカテゴリ</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
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
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.icon}
            </span>
            <span className="font-medium text-purple-900">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            </span>
          </div>
          <p className="text-sm text-purple-700">
            {CATEGORIES.find((c) => c.id === selectedCategory)?.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CATEGORIES.slice(0, 8).map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`p-2 rounded-md text-sm transition-colors ${
              selectedCategory === category.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-base mb-1">{category.icon}</div>
            <div className="text-xs">{category.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

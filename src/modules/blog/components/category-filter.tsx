'use client'

import { useState } from 'react'

interface CategoryFilterProps {
  categories: {
    _id: string
    title: string
  }[]
  onFilterChange: (categoryId: string | null) => void
}

export default function CategoryFilter({ categories, onFilterChange }: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string | null) => {
    setActiveCategory(categoryId)
    onFilterChange(categoryId)
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        <button 
          className={`px-4 py-2 rounded-full transition-colors ${
            activeCategory === null 
              ? 'bg-blue-600 text-white' 
              : 'bg-white hover:bg-gray-100'
          }`}
          onClick={() => handleCategoryClick(null)}
        >
          全部文章
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeCategory === category._id
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleCategoryClick(category._id)}
          >
            {category.title}
          </button>
        ))}
      </div>
    </div>
  )
}

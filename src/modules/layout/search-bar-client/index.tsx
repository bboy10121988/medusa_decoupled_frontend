'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

type ProductResult = {
  id: string
  title: string
  handle: string
  thumbnail?: string
}

type SearchResults = {
  products: ProductResult[]
  isLoading: boolean
}

const SearchBarClient = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({
    products: [],
    isLoading: false
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 當使用者輸入變化時立即執行搜尋
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setResults({
        products: [],
        isLoading: false
      })
      setShowDropdown(false)
      return
    }
    
    const timer = setTimeout(() => {
      performSearch(searchQuery)
      setShowDropdown(true)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 點擊外部關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) && 
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setResults(prev => ({ ...prev, isLoading: true }))

    try {
      // 簡化的搜尋實現，實際應該調用你的搜尋API
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setResults({
          products: data.products || [],
          isLoading: false
        })
      }
    } catch (error) {
      console.error('搜尋錯誤:', error)
      setResults({
        products: [],
        isLoading: false
      })
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowDropdown(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="relative">
      {/* 搜尋輸入框 */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          placeholder="搜尋商品..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full max-w-xs pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
          aria-label="搜尋"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* 搜尋結果下拉菜單 */}
      {showDropdown && searchQuery.trim() && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-2"
        >
          {results.isLoading ? (
            <div className="p-4 text-center text-gray-500">
              搜尋中...
            </div>
          ) : (
            <>
              {results.products.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  沒有找到相關商品
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide px-2 py-1">
                      商品 ({results.products.length})
                    </div>
                    {results.products.slice(0, 6).map((product) => (
                      <LocalizedClientLink
                        key={product.id}
                        href={`/products/${product.handle}`}
                        className="flex items-center p-2 hover:bg-gray-50 rounded"
                        onClick={() => setShowDropdown(false)}
                      >
                        {product.thumbnail && (
                          <div className="w-10 h-10 mr-3 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {product.title}
                          </div>
                        </div>
                      </LocalizedClientLink>
                    ))}
                  </div>
                  
                  {results.products.length > 6 && (
                    <div className="border-t p-2">
                      <button
                        onClick={handleSearch}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                      >
                        查看全部 {results.products.length} 個搜尋結果
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBarClient

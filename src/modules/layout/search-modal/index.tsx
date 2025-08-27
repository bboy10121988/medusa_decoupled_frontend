'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

// 搜尋結果類型定義
type ProductResult = {
  id: string
  title: string
  handle: string
  thumbnail?: string
  price?: {
    calculated_price: string
    original_price?: string
  }
}

type BlogResult = {
  id: string
  title: string
  slug: string
  image?: string
  publishedAt?: string
}

type SearchResults = {
  products: ProductResult[]
  blogs: BlogResult[]
  isLoading: boolean
}

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  onSearchSubmit: (query: string) => void
}

const SearchModal = ({ 
  isOpen, 
  onClose,
  searchQuery,
  onSearchSubmit
}: SearchModalProps) => {
  const [results, setResults] = useState<SearchResults>({
    products: [],
    blogs: [],
    isLoading: false
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [showDropdown, setShowDropdown] = useState(false)

  // 當搜尋查詢變更時自動進行搜尋
  useEffect(() => {
    setLocalQuery(searchQuery)
    
    if (searchQuery.trim().length >= 1) {
      performSearch(searchQuery)
      setShowDropdown(true)
    } else {
      setResults({
        products: [],
        blogs: [],
        isLoading: false
      })
      setShowDropdown(false)
    }
  }, [searchQuery])

  // 當使用者輸入變化時立即執行搜尋
  useEffect(() => {
    // 如果輸入長度小於1，不執行搜尋
    if (localQuery.trim().length < 1) {
      setResults({
        products: [],
        blogs: [],
        isLoading: false
      })
      setShowDropdown(false)
      return
    }
    
    // 使用延遲執行搜尋，避免每次按鍵都觸發API請求
    const timer = setTimeout(() => {
      performSearch(localQuery)
      setShowDropdown(true)
    }, 300)  // 300毫秒延遲
    
    return () => clearTimeout(timer)
  }, [localQuery])

  // 當模態框打開時，聚焦搜尋框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // 點擊外部處理 - 對於彈出層不需要，但我們仍然使用這個來處理搜尋下拉菜單外的點擊
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 檢查是否在瀏覽器環境中
      if (typeof document === 'undefined') return
      
      // 處理點擊搜尋框外的事件，關閉下拉菜單
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) && 
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    // 確保在瀏覽器環境中才添加事件監聽器
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [])

  // 按ESC關閉下拉菜單
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDropdown) {
          setShowDropdown(false)
        } else {
          onClose()
        }
      }
    }

    // 確保在瀏覽器環境中才添加事件監聽器
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleEsc)
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleEsc)
      }
    }
  }, [onClose, showDropdown])

  // 執行搜尋
  const performSearch = async (query: string) => {
    if (!query || query.trim().length < 1) return

    setResults(prev => ({ ...prev, isLoading: true }))

    try {
      // 搜尋商品（使用簡化格式）
      const productsRes = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&format=simple`)
      let products: ProductResult[] = []
      
      if (productsRes.ok) {
        const productData = await productsRes.json()
        products = productData.products || []
      } else {
        console.error('商品搜尋失敗:', await productsRes.text())
      }

      // 搜尋部落格文章
      const blogsRes = await fetch(`/api/blogs/search?q=${encodeURIComponent(query)}`)
      let blogs: BlogResult[] = []
      
      if (blogsRes.ok) {
        const blogData = await blogsRes.json()
        blogs = blogData.posts || []
      } else {
        console.error('部落格文章搜尋失敗:', await blogsRes.text())
      }

      setResults({
        products,
        blogs,
        isLoading: false
      })
    } catch (error) {
      console.error('搜尋錯誤:', error)
      setResults({
        products: [],
        blogs: [],
        isLoading: false
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value)
    if (e.target.value.trim().length >= 2) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  const handleInputFocus = () => {
    if (localQuery.trim().length >= 2 && results.products.length > 0) {
      setShowDropdown(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowDropdown(false)
    // 使用正確的本地化路由
    router.push(`/tw/search?q=${encodeURIComponent(localQuery)}`)
    onClose()
  }

  const handleProductClick = (handle: string) => {
    router.push(`/tw/products/${handle}`)
    onClose()
  }

  const handleBlogClick = (slug: string) => {
    router.push(`/tw/blog/${slug}`)
    onClose()
  }

  if (!isOpen) return null

  const { products, blogs, isLoading } = results
  const hasResults = products.length > 0 || blogs.length > 0
  const noResults = !isLoading && localQuery.trim().length >= 2 && !hasResults

  return (
    <div className="w-full relative">
      <div className="relative w-full">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            ref={inputRef}
            type="search"
            value={localQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="搜尋商品、Blog文章"
            className="w-full px-4 py-2 text-lg border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
            autoFocus
          />
          <button 
            type="submit"
            className="absolute right-12 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            搜尋
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </form>

        {/* 搜尋提示 */}
        {localQuery.trim().length >= 1 && localQuery.trim().length < 2 && (
          <div className="text-xs text-gray-500 mt-1 px-4">
            請至少輸入2個字元開始搜尋
          </div>
        )}

        {/* 搜尋下拉菜單 */}
        {showDropdown && localQuery.trim().length >= 2 && (
          <div 
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full bg-white border shadow-lg rounded-b-lg max-h-[70vh] overflow-y-auto z-[100] mt-1"
          >
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            )}

            {noResults && (
              <div className="text-center py-4 text-gray-500">
                找不到符合「{localQuery}」的結果
              </div>
            )}

            {/* 搜尋下拉菜單商品結果 */}
            {products.length > 0 && (
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">商品</h3>
                {products.map(product => (
                  <div 
                    key={product.id} 
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleProductClick(product.handle)}
                  >
                    {product.thumbnail ? (
                      <div className="w-10 h-10 relative mr-3 flex-shrink-0">
                        <Image 
                          src={product.thumbnail} 
                          alt={product.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 mr-3 rounded flex-shrink-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.title}</p>
                      {product.price && (
                        <p className="text-xs text-gray-700">{product.price.calculated_price}</p>
                      )}
                    </div>
                  </div>
                ))}
                {products.length > 10 && (
                  <div 
                    className="text-center mt-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                    onClick={() => {
                      onSearchSubmit(localQuery)
                      setShowDropdown(false)
                    }}
                  >
                    查看全部 {products.length} 個商品結果 →
                  </div>
                )}
              </div>
            )}

            {/* 搜尋下拉菜單部落格結果 */}
            {blogs.length > 0 && (
              <div className="p-3 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">部落格文章</h3>
                {blogs.map(blog => (
                  <div 
                    key={blog.id} 
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleBlogClick(blog.slug)}
                  >
                    {blog.image ? (
                      <div className="w-10 h-10 relative mr-3 flex-shrink-0">
                        <Image 
                          src={blog.image} 
                          alt={blog.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 mr-3 rounded flex-shrink-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{blog.title}</p>
                      {blog.publishedAt && (
                        <p className="text-xs text-gray-500">
                          {new Date(blog.publishedAt).toLocaleDateString('zh-TW')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {blogs.length > 10 && (
                  <div 
                    className="text-center mt-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer"
                    onClick={() => {
                      onSearchSubmit(localQuery)
                      setShowDropdown(false)
                    }}
                  >
                    查看全部 {blogs.length} 篇文章結果 →
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchModal

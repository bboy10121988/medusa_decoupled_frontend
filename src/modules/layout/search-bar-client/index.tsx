'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

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
  excerpt?: string
  bodyText?: string  // 添加 bodyText 屬性
  categories?: string[]
}

type SearchResults = {
  products: ProductResult[]
  blogs: BlogResult[]
  isLoading: boolean
}

const SearchBarClient = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({
    products: [],
    blogs: [],
    isLoading: false
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || 'tw'

  // 當使用者輸入變化時立即執行搜尋
  useEffect(() => {
    // 如果輸入長度小於1，不執行搜尋
    if (searchQuery.trim().length < 1) {
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
      performSearch(searchQuery)
      setShowDropdown(true)
    }, 300)  // 300毫秒延遲
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 點擊外部關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果點擊的不是搜尋框且不是下拉菜單，則關閉下拉菜單
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

  // 按ESC關閉下拉菜單
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDropdown) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('keydown', handleEsc)
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [showDropdown])

  // 監聽鍵盤快捷鍵 (按下 / 鍵聚焦搜尋框)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && 
          !(e.target instanceof HTMLInputElement) && 
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // 檢查字符串是否包含中文字符
  const isChinese = (str: string): boolean => {
    return /[\u4e00-\u9fa5]/.test(str);
  };

  // 添加一個將關鍵字高亮的輔助函數 - 統一處理中英文與混合情況
  const highlightMatches = (text: string, query: string, type: 'title' | 'content' = 'title'): JSX.Element => {
    if (!text || !query || query.trim() === '') return <>{text}</>;
    
    // 統一的高亮樣式 - 標題使用粗體，內容使用中等粗細
    const highlightClass = type === 'title' ? "text-red-600 font-extrabold text-xl" : "text-red-600 text-sm";
    
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // 統一處理不同語言的查詢詞
    // 1. 檢測是否包含中文，如果是則按字符拆分
    // 2. 如果是英文則按空格拆分為單詞
    // 3. 如果是混合語言，則同時處理
    const hasChinese = isChinese(query);
    
    // 創建查詢單元：中文按字符拆分，英文按單詞拆分
    let queryUnits: string[] = [];
    
    if (hasChinese) {
      // 中文字符拆分
      Array.from(lowerQuery).forEach(char => {
        if (char.trim() !== '') {
          queryUnits.push(char);
        }
      });
      
      // 處理可能的混合情況（中英文混合）
      if (lowerQuery.match(/[a-z0-9]+/g)) {
        const englishWords = lowerQuery.match(/[a-z0-9]+/g) || [];
        queryUnits = [...queryUnits, ...englishWords];
      }
    } else {
      // 純英文按空格拆分
      queryUnits = lowerQuery.split(/\s+/).filter(word => word.length > 0);
    }
    
    // 如果沒有有效的查詢單元，直接返回原文本
    if (queryUnits.length === 0) {
      return <>{text}</>;
    }
    
    // 構建統一的正則表達式模式來匹配所有查詢單元
    const patterns = queryUnits.map(unit => 
      unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    
    // 建立一個能匹配所有查詢單元的正則表達式
    const regex = new RegExp(`(${patterns.join('|')})`, 'gi');
    
    // 分割文本並標記匹配部分
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, index) => {
          // 檢查部分是否匹配任何查詢單元（不區分大小寫）
          const isMatch = queryUnits.some(unit => 
            part.toLowerCase() === unit.toLowerCase()
          );
          
          return isMatch ? (
            <span key={index} className={highlightClass}>{part}</span>
          ) : (
            <span key={index} className={type === 'title' ? "text-xl" : "text-sm"}>{part}</span>
          );
        })}
      </>
    );
  };

  // 執行搜尋
  const performSearch = async (query: string) => {
    if (!query || query.trim().length < 1) return

    setResults(prev => ({ ...prev, isLoading: true }))

    try {
      // 搜尋商品 - 使用簡化格式
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
    setSearchQuery(e.target.value)
  }

  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 1) {
      setShowDropdown(true)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 1) {
      router.push(`/${countryCode}/search?q=${encodeURIComponent(searchQuery)}`)
      setShowDropdown(false)
    }
  }

  const handleProductClick = (handle: string) => {
    router.push(`/${countryCode}/products/${handle}`)
    setShowDropdown(false)
  }

  const handleBlogClick = (slug: string) => {
    router.push(`/${countryCode}/blog/${slug}`)
    setShowDropdown(false)
  }

  const handleClickSearch = () => {
    if (searchQuery.trim().length >= 1) {
      router.push(`/${countryCode}/search?q=${encodeURIComponent(searchQuery)}`)
      setShowDropdown(false)
    } else if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const { products, blogs, isLoading } = results
  const hasResults = products.length > 0 || blogs.length > 0
  const noResults = !isLoading && searchQuery.trim().length >= 1 && !hasResults

  return (
    <div className="relative group">
      <div className="flex items-center w-full">
        <div className="relative w-full border-b border-transparent group-hover:border-gray-200">
          <form onSubmit={handleFormSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="搜尋商品、Blog文章"
              className="w-[300px] py-1 pr-8 text-base bg-transparent focus:outline-none"
              aria-label="輸入關鍵字搜尋，例如：洗"
            />
          </form>
          <button 
            onClick={handleClickSearch}
            className="absolute right-0 top-1/2 -translate-y-1/2"
            aria-label="搜尋"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              className="transition-transform duration-200 transform group-hover:scale-110"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* 搜尋下拉菜單 */}
      {showDropdown && searchQuery.trim().length >= 1 && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-lg max-h-[75vh] overflow-y-auto z-[100] w-[450px]"
        >
          {isLoading && (
            <div className="flex justify-center py-5">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          )}

          {noResults && (
            <div className="text-center py-6 px-4 text-gray-500">
              找不到符合「<span className="text-gray-800 font-medium">{searchQuery}</span>」的結果
            </div>
          )}

          {/* 搜尋下拉菜單商品結果 */}
          {products.length > 0 && (
            <div className="p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">商品</h3>
              <div>
                {products.map(product => (
                  <div 
                    key={product.id} 
                    className="flex items-center p-2.5 my-1 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-150"
                    onClick={() => handleProductClick(product.handle)}
                  >
                    {product.thumbnail ? (
                      <div className="w-10 h-10 relative mr-3 flex-shrink-0 border border-gray-100 rounded overflow-hidden">
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
                      <p className="text-xl font-extrabold text-gray-900">{highlightMatches(product.title, searchQuery, 'title')}</p>
                      {product.price && (
                        <p className="text-sm font-medium text-gray-700 mt-1">
                          {product.price.original_price && product.price.original_price !== product.price.calculated_price && (
                            <span className="line-through text-gray-500 mr-2">{product.price.original_price}</span>
                          )}
                          {product.price.calculated_price}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {products.length > 10 && (
                <div 
                  className="text-center mt-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer hover:bg-gray-50 rounded"
                  onClick={() => {
                    router.push(`/${countryCode}/search?q=${encodeURIComponent(searchQuery)}&type=products`)
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
            <div className="p-4 border-t border-gray-100">
              <h3 className="text-base font-semibold text-gray-800 mb-3">部落格文章</h3>
              <div>
                {blogs.map(blog => (
                  <div 
                    key={blog.id} 
                    className="flex p-2.5 my-1 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-150"
                    onClick={() => handleBlogClick(blog.slug)}
                  >
                    {blog.image ? (
                      <div className="w-10 h-10 relative mr-3 flex-shrink-0 border border-gray-100 rounded overflow-hidden">
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
                    <div className="flex-1">
                      <p className="text-xl font-extrabold text-gray-900">{highlightMatches(blog.title, searchQuery, 'title')}</p>
                      
                      {/* 顯示文章摘要 */}
                      {(blog.excerpt || blog.bodyText) && (
                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {highlightMatches((blog.excerpt || blog.bodyText?.substring(0, 150)) || '', searchQuery, 'content')}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        {/* 顯示發布日期 */}
                        {blog.publishedAt && (
                          <p className="text-xs text-gray-500">
                            {new Date(blog.publishedAt).toLocaleDateString('zh-TW')}
                          </p>
                        )}
                        
                        {/* 顯示分類標籤 */}
                        {blog.categories && blog.categories.length > 0 && (
                          <div className="flex gap-1">
                            {blog.categories.slice(0, 2).map((category, index) => (
                              <span key={`${blog.id}-cat-${index}`} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {category}
                              </span>
                            ))}
                            {blog.categories.length > 2 && (
                              <span className="text-xs text-gray-500">+{blog.categories.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {blogs.length > 10 && (
                <div 
                  className="text-center mt-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer hover:bg-gray-50 rounded"
                  onClick={() => {
                    router.push(`/${countryCode}/search?q=${encodeURIComponent(searchQuery)}&type=blogs`)
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
  )
}

export default SearchBarClient

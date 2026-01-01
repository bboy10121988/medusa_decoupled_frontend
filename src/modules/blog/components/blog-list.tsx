'use client'

import { useState, useEffect } from "react"
import clsx from "clsx"
import BlogCard, { BlogPost } from "./blog-card"

interface Category {
  _id: string
  title: string
}

interface BlogSettings {
  postsPerPage?: number
  gridColumns?: number
  mobileColumns?: number
  layout?: string
  cardStyle?: string
  showExcerpt?: boolean
  excerptLength?: number
  showReadMore?: boolean
  showPublishDate?: boolean
  showAuthor?: boolean
  showCategoryTags?: boolean
  categoryTagLimit?: number
  enablePagination?: boolean
}

interface BlogListProps {
  initialPosts: BlogPost[]
  categories: Category[]
  countryCode?: string
  blogSettings?: BlogSettings
}

const DEFAULT_POSTS_PER_PAGE = 9

export default function BlogList({
  initialPosts,
  countryCode = "tw",
  blogSettings
}: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const postsPerPage = blogSettings?.postsPerPage || DEFAULT_POSTS_PER_PAGE
  const enablePagination = blogSettings?.enablePagination !== false

  useEffect(() => {
    if (Array.isArray(initialPosts)) {
      setPosts(initialPosts)
      setCurrentPage(1)
    }
  }, [initialPosts])

  const totalPages = Math.ceil(posts.length / postsPerPage)
  const currentPosts = enablePagination
    ? posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
    : posts

  if (!Array.isArray(posts) || posts.length === 0) {
    return null
  }

  // 根據 gridColumns 和 mobileColumns 設定決定網格樣式
  // 根據 gridColumns 和 mobileColumns 設定決定網格樣式
  const getGridCols = () => {
    const desktopCols = blogSettings?.gridColumns || 3
    const mobileCols = blogSettings?.mobileColumns || 2

    // 手機版列數
    const mobileClass = mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'

    // 桌面版列數 (LG) - 使用 switch 或條件判斷以確保 Tailwind 能抓到類名
    let desktopClass = 'lg:grid-cols-3' // default
    if (desktopCols === 1) desktopClass = 'lg:grid-cols-1'
    if (desktopCols === 2) desktopClass = 'lg:grid-cols-2'
    if (desktopCols === 4) desktopClass = 'lg:grid-cols-4'

    // 超大螢幕響應式設定 - 直接寫死以符合使用者需求，並確保 Tailwind 能掃描到
    // 使用 min-[] 語法以確保優先級和明確性
    // XL (1280px+) -> 4欄
    // 2XL (1536px+) -> 6欄
    const responsiveClass = 'min-[1280px]:grid-cols-4 min-[1536px]:grid-cols-6'

    return `${mobileClass} ${desktopClass} ${responsiveClass}`
  }

  return (
    <div className="bg-white">
      {/* 文章列表 */}
      <ul className={`grid ${getGridCols()} gap-3 md:gap-4 lg:gap-0`}>
        {currentPosts.map((post) => (
          <BlogCard
            key={post._id}
            post={post}
            countryCode={countryCode}
            {...(blogSettings && { blogSettings })}
          />
        ))}
      </ul>

      {/* 分頁導航 - 根據 enablePagination 設定顯示 */}
      {enablePagination && totalPages > 1 && (
        <div className="mt-8 flex justify-center px-4">
          <nav className="flex items-center gap-1 md:gap-2" aria-label="文章分頁">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={clsx(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              )}
            >
              上一頁
            </button>

            {/* 手機版簡化分頁顯示 */}
            <div className="flex items-center gap-1">
              {totalPages <= 7 ? (
                // 頁數少時顯示全部
                Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={clsx(
                      "w-10 h-10 text-sm font-medium rounded-md transition-colors",
                      pageNum === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    )}
                  >
                    {pageNum}
                  </button>
                ))
              ) : (
                // 頁數多時智能顯示
                <>
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="w-10 h-10 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        1
                      </button>
                      {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
                    </>
                  )}

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={clsx(
                          "w-10 h-10 text-sm font-medium rounded-md transition-colors",
                          pageNum === currentPage
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10 h-10 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={clsx(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              )}
            >
              下一頁
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

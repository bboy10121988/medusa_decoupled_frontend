'use client'

import { useState, useEffect } from "react"
import clsx from "clsx"
import BlogCard, { BlogPost } from "./blog-card"

interface Category {
  _id: string
  title: string
}

interface BlogListProps {
  initialPosts: BlogPost[]
  categories: Category[]
  countryCode?: string
}

const POSTS_PER_PAGE = 9

export default function BlogList({ initialPosts, categories, countryCode = "tw" }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  
  useEffect(() => {
    if (Array.isArray(initialPosts)) {
      setPosts(initialPosts)
      setCurrentPage(1)
    }
  }, [initialPosts])

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const currentPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  if (!Array.isArray(posts) || posts.length === 0) {
    return null
  }

  return (
    <div>
      {/* 文章列表 */}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
        {currentPosts.map((post) => (
          <BlogCard key={post._id} post={post} countryCode={countryCode} />
        ))}
      </ul>

      {/* 分頁導航 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-2" aria-label="文章分頁">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={clsx(
                "px-3 py-1 text-body-small font-medium",
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              上一頁
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={clsx(
                  "px-3 py-1 text-body-small font-medium",
                  pageNum === currentPage
                    ? "bg-primary-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={clsx(
                "px-3 py-1 text-body-small font-medium",
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
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

import Link from "next/link"
import Image from "next/image"
import { getTranslation } from "../../../lib/translations"

export type BlogPost = {
  _id: string
  title: string
  slug?: { current?: string }
  mainImage?: { asset?: { url?: string } }
  publishedAt?: string
  _createdAt?: string
  excerpt?: string
  categories?: { title?: string }[]
  status?: string
  body?: unknown
}

interface BlogSettings {
  showExcerpt?: boolean
  excerptLength?: number
  showReadMore?: boolean
  readMoreText?: string
  showPublishDate?: boolean
  showAuthor?: boolean
  showCategoryTags?: boolean
  categoryTagLimit?: number
}

export default function BlogCard({
  post,
  countryCode = "tw",
  blogSettings
}: {
  post: BlogPost
  countryCode?: string
  blogSettings?: BlogSettings
}) {
  const t = getTranslation(countryCode)
  // 如果文章沒有標題或ID，不渲染
  if (!post?.title || !post?._id) {
    // console.warn('⚠️ BlogCard: 文章缺少必要資訊，跳過渲染', { title: post?.title, id: post?._id })
    return null
  }

  // 從設定中取得配置,如果沒有則使用預設值
  const showExcerpt = blogSettings?.showExcerpt !== false
  const excerptLength = blogSettings?.excerptLength || 80
  const showReadMore = blogSettings?.showReadMore !== false
  const showPublishDate = blogSettings?.showPublishDate !== false
  const showCategoryTags = blogSettings?.showCategoryTags !== false
  const categoryTagLimit = blogSettings?.categoryTagLimit || 2

  // 從 Portable Text body 提取純文字內容
  const extractTextFromBody = (body: any): string => {
    if (!body) return ''

    try {
      if (Array.isArray(body)) {
        return body
          .filter(block => block._type === 'block' && block.children)
          .map(block =>
            block.children
              .filter((child: any) => child._type === 'span' && child.text)
              .map((child: any) => child.text)
              .join('')
          )
          .join(' ')
          .trim()
      }
      return ''
    } catch (error) {
      // console.warn('⚠️ 提取文章內容失敗:', error)
      return ''
    }
  }

  // 截取指定長度的文字
  const getExcerpt = (text: string, maxLength: number): string => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  // 創建一個安全的slug
  const createSlug = (title: string, id: string) => {
    if (!title || !id) return 'no-slug'

    // 將中文標題轉換為拼音或使用ID
    const safeTitle = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .slice(0, 30)

    const shortId = id.replace(/-/g, '').slice(0, 8)
    return safeTitle || `post-${shortId}`
  }

  // 使用slug.current，如果沒有則根據標題和ID創建slug
  const slug = post?.slug?.current || createSlug(post?.title || '', post?._id || '')
  const href = `/${countryCode}/blog/${slug}`
  const imageUrl = post?.mainImage?.asset?.url
  const date = post?.publishedAt || post?._createdAt

  // 獲取內文預覽
  const bodyText = post.excerpt || extractTextFromBody(post.body)
  const excerpt = getExcerpt(bodyText, excerptLength)

  return (
    <li className="group bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm transition-all duration-700 hover:-translate-y-2 hover:shadow-xl">
      <Link href={href} className="block transition-colors">
        <div className="flex flex-col h-full">
          {imageUrl && (
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
              <Image
                src={imageUrl}
                alt={post.title || (countryCode === 'tw' ? "文章封面" : "Article Cover")}
                fill
                className="object-cover group-hover:scale-105 transition-all duration-1000"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 50vw"
              />
              {/* 簡約漸層覆蓋層 */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </div>
          )}

          <div className="p-3 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-stone-800 transition-colors duration-300 leading-tight">{post.title}</h3>

            {/* 內文預覽 - 根據 showExcerpt 設定顯示 */}
            {showExcerpt && excerpt && (
              <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed hidden sm:block">
                {excerpt}
              </p>
            )}

            {/* 分類標籤 - 根據 showCategoryTags 設定顯示 */}
            {showCategoryTags && post?.categories?.length ? (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {post.categories
                    .filter(c => c && c.title) // 過濾掉 null 或沒有 title 的分類
                    .slice(0, categoryTagLimit) // 根據設定限制顯示數量
                    .map((c, index) => (
                      <span key={index} className="inline-block text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {c.title}
                      </span>
                    ))}
                </div>
              </div>
            ) : null}

            {/* 日期與閱讀更多 */}
            <div className="mt-auto pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-gray-100">
              {showPublishDate && date && (
                <time className="text-xs text-gray-500">
                  {new Date(date).toLocaleDateString(countryCode === 'tw' ? "zh-TW" : "en-US", {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                  })}
                </time>
              )}

              {showReadMore && (
                <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-1 transition-colors">
                  {blogSettings?.readMoreText || t.readMore}
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}

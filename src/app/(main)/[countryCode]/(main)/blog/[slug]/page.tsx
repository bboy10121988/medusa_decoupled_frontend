import client, { getPostBySlug } from "@lib/sanity"
import SanityContent from "../components/sanity-content"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Category {
  _id: string
  title: string
}

// 取得所有分類
async function getCategories() {
  try {
    const query = `*[_type == "category"] | order(title asc) {
      _id,
      title
    }`
    const categories = await client.fetch<Category[]>(query)
    
    if (!categories) return []
    
    // 確保分類是唯一的（以標題為基準）
    return Array.from(
      new Map(categories.map(cat => [cat.title, cat])).values()
    )
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

// 取得最新文章
async function getLatestPosts(excludeSlug?: string) {
  try {
    const query = `*[_type == "post" ${excludeSlug ? `&& slug.current != "${excludeSlug}"` : ''}] | order(publishedAt desc)[0...4] {
      _id,
      title,
      slug {
        current
      },
      publishedAt,
      mainImage {
        asset->{
          url
        }
      }
    }`
    const posts = await client.fetch(query)
    return posts || []
  } catch (error) {
    console.error("Error fetching latest posts:", error)
    return []
  }
}

export default async function BlogPost({ 
  params 
}: { 
  params: Promise<{ slug: string; countryCode: string }> 
}) {
  try {
    const { slug, countryCode } = await params
    const [post, categories, latestPosts] = await Promise.all([
      getPostBySlug(slug),
      getCategories(),
      getLatestPosts(slug)
    ])

    if (!post) {
      notFound()
    }

  return (
    <div className="bg-white min-h-screen mt-[72px]">
      <div className="mx-auto">
        <div className="grid grid-cols-12 gap-0">
          {/* 左側分類側邊欄 */}
          <aside className="col-span-12 md:col-span-3">
            <nav className="bg-white px-6 md:px-12 xl:px-16 2xl:px-20 py-6 sticky top-[96px] shadow-sm border-r border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">
                文章分類
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href={`/${countryCode}/blog`}
                    className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 block w-full py-2 px-3 rounded-lg transition-all duration-200"
                  >
                    ← 返回部落格
                  </Link>
                </li>
                <li className="border-t border-gray-100 pt-2 mt-3">
                  <Link 
                    href={`/${countryCode}/blog`}
                    className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 block w-full py-2 px-3 rounded-lg transition-all duration-200"
                  >
                    全部文章
                  </Link>
                </li>
                {categories.map((cat: Category) => (
                  <li key={cat._id}>
                    <Link 
                      href={`/${countryCode}/blog?category=${encodeURIComponent(cat.title)}`}
                      className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 block w-full py-2 px-3 rounded-lg transition-all duration-200"
                    >
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* 相關文章快速導航 */}
              {post.categories && post.categories.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    本文分類
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((cat: any) => (
                      <Link
                        key={cat.title}
                        href={`/${countryCode}/blog?category=${encodeURIComponent(cat.title)}`}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors duration-200"
                      >
                        {cat.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 最新文章四則 */}
              {latestPosts && latestPosts.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    最新文章
                  </h3>
                  <div className="space-y-3">
                    {latestPosts.map((article: any) => (
                      <Link
                        key={article._id}
                        href={`/${countryCode}/blog/${article.slug?.current}`}
                        className="block group hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
                      >
                        <div className="flex space-x-4">
                          {article.mainImage?.asset?.url && (
                            <div className="w-12 h-12 relative flex-shrink-0">
                              <Image
                                src={article.mainImage.asset.url}
                                alt={article.title}
                                fill
                                className="object-cover rounded"
                                sizes="48px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-tight">
                              {article.title}
                            </h4>
                            {article.publishedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(article.publishedAt).toLocaleDateString("zh-TW")}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </aside>

          {/* 右側主要內容區 */}
          <main className="col-span-12 md:col-span-9">
            <article className="bg-white">
              <div className="max-w-4xl mx-auto px-4 md:px-8 xl:px-12 2xl:px-16 py-8 md:py-12">
                {post.mainImage?.asset?.url && (
                  <div className="aspect-[4/3] relative mb-10 rounded-xl overflow-hidden shadow-lg">
                    <Image 
                      src={post.mainImage.asset.url} 
                      alt={post.title || "文章封面圖片"}
                      fill
                      priority
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                      quality={95}
                    />
                  </div>
                )}
                
                <header className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {post.publishedAt && (
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString("zh-TW")}
                        </span>
                      </span>
                    )}
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <div className="flex flex-wrap gap-1">
                          {post.categories.map((cat: any) => (
                            <span key={cat.title} className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                              {cat.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </header>

                {post.body && (
                  <div className="prose prose-lg max-w-none space-y-6">
                    <SanityContent content={post.body} />
                  </div>
                )}
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  )
  } catch (error) {
    console.error("Error in BlogPost:", error)
    return (
      <div className="bg-gray-50 min-h-screen mt-[72px]">
        <div className="mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">載入發生錯誤</h1>
          <p className="mt-4 text-gray-600">請稍後再試</p>
        </div>
      </div>
    )
  }
}

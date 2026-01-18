import { unstable_noStore as noStore } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import {
  getAllPosts,
  getCategories,
  getSiteInfo,
  getBlogPageSettings
} from "@lib/sanity"
import { mapCountryToLanguage } from "../../../../../lib/sanity-utils"
import { getTranslation } from "@lib/translations"
import BlogList from "@modules/blog/components/blog-list"

// Define interfaces if not imported, or import them. 
// BlogPost is imported from types/global in sanity.ts, but here we might need to cast or use it.
// Let's rely on inference or import types if possible. 
// However, for this refactor I will try to keep it simple and rely on what `getAllPosts` returns.

export async function generateMetadata() {
  const [siteInfo, blogSettings] = await Promise.all([
    getSiteInfo(),
    getBlogPageSettings()
  ])

  return {
    title: blogSettings.seoTitle || `部落格 | ${siteInfo.seoTitle || 'Fantasy World Barber Shop'}`,
    description: blogSettings.seoDescription || siteInfo.seoDescription || '最新消息與文章',
    keywords: blogSettings.seoKeywords,
    openGraph: blogSettings.ogImage?.asset?.url ? {
      images: [{ url: blogSettings.ogImage.asset.url }]
    } : undefined
  }
}

export default async function BlogListPage({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ category?: string }>
}) {
  try {
    const { countryCode } = await params
    const { category } = await searchParams
    const language = mapCountryToLanguage(countryCode)
    const t = getTranslation(countryCode)

    // Using Promise.all to fetch data in parallel
    // getAllPosts from sanity.ts takes (category, limit, language)
    // We use a high limit (100) to emulate the previous behavior of fetching many posts
    const [posts, categories, , latestPosts, blogSettings] = await Promise.all([
      getAllPosts(category, 100, language),
      getCategories(language),
      getSiteInfo(language),
      getAllPosts(undefined, 4, language), // Used for latest posts sidebar
      getBlogPageSettings()
    ])

    return (
      <div className="bg-white min-h-[80vh] mt-[72px]">
        <div className="mx-auto">
          {/* 頁面標題區 - 根據 blogSettings 顯示 */}
          {(blogSettings.showTitle || blogSettings.showSubtitle) && (
            <div className="px-4 pt-6 pb-4 md:px-6 lg:px-12 xl:px-16 2xl:px-20">
              {blogSettings.showTitle && (
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {blogSettings.title || '部落格文章'}
                </h1>
              )}
              {blogSettings.showSubtitle && (
                <p className="text-gray-600 text-lg">
                  {blogSettings.subtitle || '探索我們的最新消息與文章'}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col md:grid md:grid-cols-12">
            {/* 左側分類側邊欄 - 根據 blogSettings.showSidebar 和 showCategories 控制 */}
            {(blogSettings.showSidebar !== false && blogSettings.showCategories !== false) && (
              <aside className="col-span-12 md:col-span-3 order-2 md:order-1">
                <nav className="bg-white px-4 py-4 md:pl-6 md:pr-6 lg:pl-12 lg:pr-6 xl:pl-16 xl:pr-6 2xl:pl-20 2xl:pr-6 md:py-6 md:sticky md:top-[96px]">
                  {/* 手機版分類選單 */}
                  <div className="block md:hidden mb-4">
                    <h2 className="text-lg font-semibold mb-3">{t.categories}</h2>
                    <div className="flex overflow-x-auto pb-2 space-x-3">
                      <a
                        href={`/${countryCode}/blog`}
                        className={`flex-shrink-0 px-4 py-2 text-sm rounded-full border transition-colors duration-200 ${!category
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                          }`}
                      >
                        {(language === 'zh-TW' ? blogSettings.allCategoriesLabel : undefined) || t.allArticles}
                      </a>
                      {categories.map((cat) => (
                        <a
                          key={cat._id}
                          href={`/${countryCode}/blog?category=${encodeURIComponent(cat.title)}`}
                          className={`flex-shrink-0 px-4 py-2 text-sm rounded-full border transition-colors duration-200 ${category === cat.title
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                            }`}
                        >
                          {cat.title}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* 桌面版分類選單 */}
                  <div className="hidden md:block">
                    <h2 className="text-xl font-semibold border-b pb-2">{t.categories}</h2>
                    <ul className="space-y-3 mt-4">
                      <li>
                        <a
                          href={`/${countryCode}/blog`}
                          className={`text-sm hover:text-blue-600 block w-full py-1 transition-colors duration-200 ${!category ? 'text-blue-600 font-medium' : 'text-gray-500'
                            }`}
                        >
                          {(language === 'zh-TW' ? blogSettings.allCategoriesLabel : undefined) || t.allArticles}
                        </a>
                      </li>
                      {categories.map((cat) => (
                        <li key={cat._id}>
                          <a
                            href={`/${countryCode}/blog?category=${encodeURIComponent(cat.title)}`}
                            className={`text-sm hover:text-blue-600 block w-full py-1 transition-colors duration-200 ${category === cat.title ? 'text-blue-600 font-medium' : 'text-gray-500'
                              }`}
                          >
                            {cat.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 最新文章四則 */}
                  {blogSettings.showLatestPosts !== false && latestPosts && latestPosts.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        {t.latestPosts}
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
                                <h4 className="text-xs font-medium text-gray-900 group-hover:text-blue-600 leading-tight overflow-hidden"
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}>
                                  {article.title}
                                </h4>
                                {article.publishedAt && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(article.publishedAt).toLocaleDateString(language === 'zh-TW' ? "zh-TW" : "en-US")}
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
            )}

            {/* 右側主要內容區 */}
            <main className={`col-span-12 order-1 md:order-2 px-4 md:pr-6 lg:pr-12 xl:pr-16 2xl:pr-20 ${(blogSettings.showSidebar !== false && blogSettings.showCategories !== false) ? 'md:col-span-9' : 'md:col-span-12'
              }`}>
              {/* 文章列表 */}
              <section className="bg-white">
                {Array.isArray(posts) && posts.length > 0 ? (
                  <BlogList
                    initialPosts={posts}
                    categories={categories}
                    countryCode={countryCode}
                    blogSettings={blogSettings}
                  />
                ) : (
                  <div className="text-center py-12 bg-white">
                    <p className="text-gray-500">
                      {category
                        ? t.noPostsInCat
                        : t.noPosts}
                    </p>
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    // console.error("Error in BlogListPage:", error)
    return (
      <div className="py-12 bg-white min-h-[80vh]">
        <div className="mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">載入發生錯誤</h1>
          <p className="mt-4 text-gray-600">請稍後再試</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          >
            重新整理
          </button>
        </div>
      </div>
    )
  }
}

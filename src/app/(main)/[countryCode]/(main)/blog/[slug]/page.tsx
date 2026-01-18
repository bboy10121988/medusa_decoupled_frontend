import client, { getPostBySlug } from "@lib/sanity"
import { Metadata } from "next"
import SanityContent from "../components/sanity-content"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslation } from "@lib/translations"

import { getAllPosts, getCategories } from "@lib/sanity"
import { Category } from "../../../../../../types/sanity"
import { Breadcrumb } from "@/components/seo/Breadcrumb"
import { ArticleSchema } from "@/components/seo/StructuredData"

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; countryCode: string }>
}): Promise<Metadata> {
  const { slug, countryCode: _countryCode } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "文章不存在",
      description: "找不到您要查看的文章"
    }
  }

  const title = `${post.title} | Tim's Fantasy World`
  const description = post.excerpt || `閱讀更多關於 ${post.title} 的內容。Tim's Fantasy World 提供專業美髮知識與流行趨勢。`
  const imageUrl = post.mainImage?.asset?.url
    ? `${post.mainImage.asset.url}?w=1200&h=630&fit=crop`
    : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      locale: "zh_TW",
      siteName: "Tim's Fantasy World",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    }
  }
}

// 引入 mapCountryToLanguage
import { mapCountryToLanguage } from "../../../../../../lib/sanity-utils"

export default async function BlogPost({
  params
}: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  try {
    const { slug, countryCode } = await params
    const language = mapCountryToLanguage(countryCode)
    const t = getTranslation(countryCode)

    // console.log(`📖 [BlogPost] 正在載入文章頁面: ${slug}`)

    const [post, categories, latestPosts] = await Promise.all([
      getPostBySlug(slug, language),
      getCategories(language),
      getAllPosts(undefined, 4, language)
    ])

    if (!post) {
      // console.log(`❌ [BlogPost] 文章不存在，返回 404: ${slug}`)
      notFound()
    }

    // console.log(`✅ [BlogPost] 成功載入文章: ${post.title}`)

    return (
      <div className="bg-white min-h-screen mt-[72px]">
        <div className="mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0">
            {/* 左側分類側邊欄 - 手機版隱藏，桌面版顯示 */}
            <aside className="hidden lg:block col-span-12 lg:col-span-3 order-2 lg:order-1">
              <nav className="bg-white px-6 md:px-12 xl:px-16 2xl:px-20 py-6 sticky top-[96px] shadow-sm border-r border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">
                  {t.categories}
                </h2>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href={`/${countryCode}/blog`}
                      className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 block w-full py-2 px-3 rounded-lg transition-all duration-200"
                    >
                      ← {t.viewMore}
                    </Link>
                  </li>
                  <li className="border-t border-gray-100 pt-2 mt-3">
                    <Link
                      href={`/${countryCode}/blog`}
                      className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 block w-full py-2 px-3 rounded-lg transition-all duration-200"
                    >
                      {t.latestPosts}
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

            {/* 主要內容區 */}
            <main className="col-span-12 lg:col-span-9 order-1 lg:order-2">
              {/* 手機版返回按鈕 */}
              <div className="block lg:hidden bg-white border-b border-gray-200 px-4 py-3">
                <Link
                  href={`/${countryCode}/blog`}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回部落格
                </Link>
              </div>

              <article className="bg-white">
                <div className="max-w-4xl mx-auto px-4 md:px-8 xl:px-12 2xl:px-16 py-6 md:py-8 lg:py-12">
                  <header className="mb-6 md:mb-8">
                    {/* 麵包屑導航 */}
                    <div className="mb-4">
                      <Breadcrumb
                        items={[
                          { name: (t as any).home || '首頁', url: `/${countryCode}` },
                          { name: (t as any).blog || '部落格', url: `/${countryCode}/blog` },
                          { name: post.title, url: `/${countryCode}/blog/${slug}` }
                        ]}
                      />
                      <ArticleSchema
                        headline={post.title}
                        description={post.excerpt || post.title}
                        image={post.mainImage?.asset?.url || ''}
                        datePublished={post.publishedAt || new Date().toISOString()}
                        author={{ name: "Tim's Fantasy World" }}
                        publisher={{
                          name: "Tim's Fantasy World",
                          logo: "https://timsfantasyworld.com/logo.png"
                        }}
                      />
                    </div>

                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {post.title}
                    </h1>

                    {/* 手機版分類標籤 */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories
                          .filter((cat: any) => cat && cat.title) // 過濾掉 null 或沒有 title 的分類
                          .map((cat: any) => (
                            <Link
                              key={cat.title}
                              href={`/${countryCode}/blog?category=${encodeURIComponent(cat.title)}`}
                              className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors duration-200"
                            >
                              {cat.title}
                            </Link>
                          ))}
                      </div>
                    )}
                  </header>

                  {post.mainImage?.asset?.url && (
                    <div className="aspect-[4/3] md:aspect-[16/9] relative mb-6 md:mb-10 rounded-lg md:rounded-xl overflow-hidden shadow-sm md:shadow-lg">
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

                  {/* 發布日期資訊 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8">
                    {post.publishedAt && (
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString("zh-TW", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* 文章內容 */}
                  {post.body && (
                    <div className="prose prose-gray prose-lg md:prose-xl max-w-none">
                      <SanityContent content={post.body} />
                    </div>
                  )}

                  {/* 手機版返回按鈕 */}
                  <div className="block lg:hidden mt-8 pt-8 border-t border-gray-200">
                    <Link
                      href={`/${countryCode}/blog`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      返回部落格列表
                    </Link>
                  </div>
                </div>
              </article>
            </main>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    // console.error("Error in BlogPost:", error)
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

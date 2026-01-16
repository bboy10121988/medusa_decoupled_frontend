import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getPageBySlug } from '@/lib/sanity'
import HeroSection from "@modules/home/components/hero-section"
import BlogPosts from "@modules/blog/components/blog-posts"
import FeaturedProducts from "@modules/home/components/featured-products"
import ImageTextBlock from "@modules/home/components/image-text-block"
import YoutubeSection from "@modules/home/components/youtube-section"
import ServiceCardsSection from "@modules/home/components/service-cards-section"
import ContentSection from "@modules/home/components/content-section"
import { getRegion } from "@lib/data/regions"
import { listCollections } from "@lib/data/collections"
import type { MainBanner } from '@lib/types/page-sections'
import type { ImageTextBlock as ImageTextBlockType } from '@lib/types/page-sections'
import type { FeaturedProductsSection } from '@lib/types/page-sections'
import type { BlogSection } from '@lib/types/page-sections'
import type { YoutubeSection as YoutubeSectionType } from '@lib/types/page-sections'
import type { ServiceCards } from '@lib/types/service-cards'
import type { ContentSection as ContentSectionType } from '@lib/types/sections'

// 系統保留路由
const SYSTEM_ROUTES = [
  'account', 'cart', 'checkout', 'login', 'register',
  'store', 'api', 'admin', 'cms', '_next', 'sitemap.xml', 'robots.txt', 'blog'
]

interface PageProps {
  params: Promise<{
    countryCode: string
    slug: string[]
  }>
}

// 動態生成頁面元數據
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const slugString = slug.join('/')

  try {
    const page = await getPageBySlug(slugString)

    if (!page) {
      return {
        title: '頁面未找到',
        description: '請求的頁面不存在'
      }
    }

    return {
      title: page.title || '動態頁面',
      description: page.seoDescription || '',
      keywords: page.additionalKeywords?.join(', ') || '',
      robots: {
        index: !page.noIndex,
        follow: true,
      },
      alternates: page.canonicalUrl ? {
        canonical: page.canonicalUrl
      } : undefined,

      openGraph: {
        title: page.ogTitle || page.title || '動態頁面',
        description: page.ogDescription || page.seoDescription || '',
        type: 'website',
        locale: 'zh_TW',
        ...(page.ogImage?.asset?.url && {
          images: [{
            url: `${page.ogImage.asset.url}?w=1200&h=630&fit=crop&crop=center`,
            width: 1200,
            height: 630,
            alt: page.ogImage.alt || page.title || '動態頁面'
          }]
        })
      },

      twitter: {
        card: (page.twitterCard as 'summary' | 'summary_large_image' | 'player' | 'app') || 'summary_large_image',
        title: page.ogTitle || page.title || '動態頁面',
        description: page.ogDescription || page.seoDescription || '',
        ...(page.ogImage?.asset?.url && {
          images: [`${page.ogImage.asset.url}?w=1200&h=630&fit=crop&crop=center`]
        })
      }
    }
  } catch (error) {
    // console.error('生成元數據時出錯:', error)
    return {
      title: '頁面未找到',
      description: '請求的頁面不存在'
    }
  }
}

// 頁面組件
export default async function DynamicPage({ params }: PageProps) {
  const { slug, countryCode } = await params
  const slugString = slug.join('/')

  // 檢查是否為系統保留路由
  const firstSegment = slug[0]
  if (SYSTEM_ROUTES.includes(firstSegment)) {
    notFound()
  }

  try {
    // 使用 getPageBySlug 獲取頁面數據
    const page = await getPageBySlug(slugString)

    if (!page) {
      // console.log(`頁面未找到: /${countryCode}/${slugString}`)
      notFound()
    }

    // console.log(`載入動態頁面: /${countryCode}/${slugString}`, {
    // title: page.title,
    // sectionsCount: page.mainSections?.length || 0
    // })

    // 獲取 region 和 collections 數據供 FeaturedProducts 使用
    const region = await getRegion(countryCode)
    const { collections } = await listCollections()

    // 渲染頁面區塊
    return (
      <>
        {page.mainSections && page.mainSections.length > 0 ? (
          page.mainSections
            .filter((section: any) => section?.isActive !== false)
            .map((section: any, index: number) => {
              try {
                const sectionType = section._type

                switch (sectionType) {
                  case "mainBanner": {
                    const bannerSection = section as MainBanner
                    return (
                      <HeroSection
                        key={index}
                        banner={bannerSection}
                      />
                    )
                  }
                  case "imageTextBlock": {
                    const imageBlock = section as ImageTextBlockType
                    const props: any = {
                      key: index,
                      heading: imageBlock.heading,
                      content: imageBlock.content,
                      image: imageBlock.image,
                      layout: imageBlock.layout,
                      hideTitle: imageBlock.hideTitle,
                      paddingX: imageBlock.paddingX,
                      paddingTop: imageBlock.paddingTop,
                      paddingBottom: imageBlock.paddingBottom
                    }
                    if (imageBlock.leftImage) props.leftImage = imageBlock.leftImage
                    if (imageBlock.rightImage) props.rightImage = imageBlock.rightImage
                    if (imageBlock.leftContent) props.leftContent = imageBlock.leftContent
                    if (imageBlock.rightContent) props.rightContent = imageBlock.rightContent

                    return <ImageTextBlock {...props} />
                  }
                  case "featuredProducts": {
                    if (!region) return null

                    const featuredBlock = section as FeaturedProductsSection
                    let targetCollection = null;

                    // 1. 嘗試通過 ID 匹配
                    if (featuredBlock.collection_id) {
                      targetCollection = collections?.find((c: any) => c.id === featuredBlock.collection_id);
                    }

                    // 2. 如果 ID 匹配失敗，嘗試通過 handle 或 title 匹配 (Fallback 機制)
                    if (!targetCollection && collections) {
                      targetCollection = collections.find((c: any) =>
                        c.handle === 'featured' ||
                        c.handle === 'featuerd' ||
                        c.title === '精選商品'
                      );
                    }

                    if (!targetCollection) return null;

                    return (
                      <FeaturedProducts
                        key={index}
                        region={region}
                        collections={[targetCollection]}
                        settings={section}
                        countryCode={countryCode}
                      />
                    )
                  }
                  case "serviceCardSection": {
                    const serviceSection = section as ServiceCards
                    return (
                      <ServiceCardsSection
                        key={index}
                        heading={serviceSection.heading || ""}
                        cards={serviceSection.cards}
                        cardsPerRow={serviceSection.cardsPerRow}
                      />
                    )
                  }
                  case "blogSection": {
                    const blogSection = section as BlogSection
                    const props: any = {
                      key: index,
                      limit: blogSection.limit || 4,
                      postsPerRow: blogSection.postsPerRow || 3,
                      showTitle: true
                    }
                    if (blogSection.title) props.title = blogSection.title
                    if (blogSection.category) props.category = blogSection.category

                    return <BlogPosts {...props} />
                  }
                  case "youtubeSection": {
                    const youtubeBlock = section as YoutubeSectionType
                    const hasVideo = youtubeBlock.videoSettings?.desktopVideoUrl ||
                      youtubeBlock.videoSettings?.mobileVideoUrl ||
                      youtubeBlock.videoUrl

                    if (!hasVideo) {
                      // console.error("Invalid YouTube section (missing video URL):", youtubeBlock)
                      return null
                    }

                    const youtubeProps: any = {
                      key: index,
                      _type: "youtubeSection" as const,
                      isActive: true,
                      heading: youtubeBlock.heading || "",
                      fullWidth: youtubeBlock.fullWidth,
                      paddingX: youtubeBlock.paddingX,
                      paddingTop: youtubeBlock.paddingTop,
                      paddingBottom: youtubeBlock.paddingBottom
                    }
                    if (youtubeBlock.description) youtubeProps.description = youtubeBlock.description
                    if (youtubeBlock.videoUrl) youtubeProps.videoUrl = youtubeBlock.videoUrl
                    if (youtubeBlock.videoMode) youtubeProps.videoMode = youtubeBlock.videoMode
                    if (youtubeBlock.youtubeSettings) youtubeProps.youtubeSettings = youtubeBlock.youtubeSettings
                    if (youtubeBlock.uploadSettings) youtubeProps.uploadSettings = youtubeBlock.uploadSettings
                    if (youtubeBlock.videoSettings) youtubeProps.videoSettings = youtubeBlock.videoSettings

                    return <YoutubeSection {...youtubeProps} />
                  }
                  case "contentSection": {
                    const contentBlock = section as ContentSectionType
                    return (
                      <ContentSection
                        key={index}
                        heading={contentBlock.heading || ""}
                        content={contentBlock.content}
                      />
                    )
                  }
                  case "textBlock": {
                    // dynamicPage 使用的 textBlock 類型
                    const textBlock = section as any
                    return (
                      <ContentSection
                        key={index}
                        heading={textBlock.title || ""}
                        content={textBlock.content || []}
                      />
                    )
                  }
                  case "googleMapsSection": {
                    const mapsSection = section as any
                    return (
                      <div key={index} className="w-full py-12">
                        {mapsSection.heading && (
                          <div className="container mx-auto px-4 mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">{mapsSection.heading}</h2>
                            {mapsSection.description && (
                              <p className="text-gray-600 mt-2">{mapsSection.description}</p>
                            )}
                          </div>
                        )}
                        {mapsSection.googleMapsUrl && (
                          <iframe
                            src={mapsSection.googleMapsUrl}
                            width="100%"
                            height={mapsSection.mapHeight || 450}
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        )}
                      </div>
                    )
                  }
                  case "imageBlock": {
                    const imgBlock = section as any
                    return (
                      <div key={index} className={`py-12 ${imgBlock.layout === 'full' ? 'w-full' : 'container mx-auto px-4'}`}>
                        {imgBlock.title && <h2 className="text-3xl font-bold mb-6">{imgBlock.title}</h2>}
                        {imgBlock.image?.url && (
                          <div className={`${imgBlock.layout === 'center' ? 'text-center' : ''}`}>
                            <img
                              src={imgBlock.image.url}
                              alt={imgBlock.alt || imgBlock.image.alt || imgBlock.title || ''}
                              className={`${imgBlock.layout === 'full' ? 'w-full' : 'max-w-full h-auto'}`}
                            />
                            {imgBlock.caption && <p className="text-gray-600 mt-2 text-sm">{imgBlock.caption}</p>}
                          </div>
                        )}
                      </div>
                    )
                  }
                  case "videoBlock": {
                    const vidBlock = section as any
                    return (
                      <div key={index} className="container mx-auto px-4 py-12">
                        {vidBlock.title && <h2 className="text-3xl font-bold mb-6">{vidBlock.title}</h2>}
                        {vidBlock.videoUrl && (
                          <div className="aspect-video">
                            <iframe
                              src={vidBlock.videoUrl}
                              width="100%"
                              height="100%"
                              allowFullScreen
                              className="rounded-lg"
                            />
                          </div>
                        )}
                        {vidBlock.description && <p className="text-gray-600 mt-4">{vidBlock.description}</p>}
                      </div>
                    )
                  }
                  case "ctaBlock": {
                    const ctaBlock = section as any
                    const alignmentClass = ctaBlock.alignment === 'center' ? 'text-center' :
                      ctaBlock.alignment === 'right' ? 'text-right' : 'text-left'
                    return (
                      <div key={index} className={`container mx-auto px-4 py-12 ${alignmentClass}`}>
                        {ctaBlock.title && <h2 className="text-3xl font-bold mb-6">{ctaBlock.title}</h2>}
                        {ctaBlock.buttonText && ctaBlock.buttonUrl && (
                          <a
                            href={ctaBlock.buttonUrl}
                            className={`inline-block px-8 py-3 rounded-lg font-semibold transition-colors ${ctaBlock.buttonStyle === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :
                                ctaBlock.buttonStyle === 'outline' ? 'border-2 border-primary text-primary hover:bg-primary hover:text-white' :
                                  'bg-primary text-white hover:bg-primary-dark'
                              }`}
                          >
                            {ctaBlock.buttonText}
                          </a>
                        )}
                      </div>
                    )
                  }
                  default:
                    // console.error("Unknown section type:", sectionType)
                    return null
                }
              } catch (error) {
                // console.error("Error rendering section:", section._type, error)
                return null
              }
            })
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{page.title}</h1>
            <p className="text-gray-600">此頁面尚未添加任何內容區塊</p>
          </div>
        )}
      </>
    )
  } catch (error) {
    // console.error('載入頁面失敗:', error)
    notFound()
  }
}
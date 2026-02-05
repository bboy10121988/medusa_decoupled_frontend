import { Metadata } from "next"

import HeroSection from "@modules/home/components/hero-section"
import BlogPosts from "@modules/blog/components/blog-posts"
import FeaturedProducts from "@modules/home/components/featured-products"
import ImageTextBlock from "@modules/home/components/image-text-block"
import YoutubeSection from "@modules/home/components/youtube-section"
import ServiceCardsSection from "@modules/home/components/service-cards-section"
import ContentSection from "@modules/home/components/content-section"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getHomePage, mapCountryToLanguage } from "@lib/sanity-utils/index"; // 使用 getHomePage 並移除 getServiceSection
import { getTranslation } from "@lib/translations"
import type { MainBanner } from '@lib/types/page-sections'
import type { ImageTextBlock as ImageTextBlockType } from '@lib/types/page-sections'
import type { FeaturedProductsSection } from '@lib/types/page-sections'
import type { BlogSection } from '@lib/types/page-sections'
import type { YoutubeSection as YoutubeSectionType } from '@lib/types/page-sections'
import type { ServiceCards } from '@lib/types/service-cards'
import type { ContentSection as ContentSectionType } from '@lib/types/sections'
import { getStoreName } from "@lib/store-name"

// 生成 JSON-LD 結構化資料 (從 googleMapsSection 動態讀取)
function generateJsonLd(homepageData: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://timsfantasyworld.com"

  // 從 mainSections 中尋找 googleMapsSection
  const googleMapsSection = homepageData?.mainSections?.find(
    (section: any) => section._type === 'googleMapsSection'
  )

  // 如果沒有 googleMapsSection 或資料不完整,使用預設值
  const businessName = googleMapsSection?.businessName || "Tim's fantasy World 男士理髮廳"
  const telephone = googleMapsSection?.telephone || "+886-2-2755-8828"
  const streetAddress = googleMapsSection?.streetAddress || "信義路四段265巷12弄14號"
  const addressLocality = googleMapsSection?.addressLocality || "台北市"
  const addressRegion = googleMapsSection?.addressRegion || "大安區"
  const postalCode = googleMapsSection?.postalCode || "106"
  const latitude = googleMapsSection?.latitude || 25.030775
  const longitude = googleMapsSection?.longitude || 121.527158
  const priceRange = googleMapsSection?.priceRange || "$$"

  // 處理營業時間
  const openingHours = googleMapsSection?.openingHours?.map((schedule: any) => ({
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": schedule.days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": schedule.opens || "11:00",
    "closes": schedule.closes || "20:00"
  })) || [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "11:00",
        "closes": "20:00"
      }
    ]

  // HairSalon schema - 從 CMS 動態讀取資料
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "name": businessName,
    "description": homepageData?.seoDescription || "專業男士理髮服務，提供剪髮、染髮、燙髮等專業美髮服務。銷售優質美髮造型產品。",
    "url": baseUrl,
    "telephone": telephone,
    "priceRange": priceRange,
    "image": homepageData?.ogImage?.asset?.url || `${baseUrl}/images/store.jpg`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": streetAddress,
      "addressLocality": addressLocality,
      "addressRegion": addressRegion,
      "postalCode": postalCode,
      "addressCountry": "TW"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": latitude,
      "longitude": longitude
    },
    "openingHoursSpecification": openingHours,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  }
}


export async function generateMetadata({ params }: { params: Promise<{ countryCode: string }> }): Promise<Metadata> {
  try {
    const { countryCode } = await params
    const language = mapCountryToLanguage(countryCode)
    const homepageData = await getHomePage(language)
    const storeName = await getStoreName()

    // 從Sanity獲取SEO資料
    const pageTitle = homepageData?.seoTitle || homepageData?.title || `${storeName} - 專業美髮沙龍與造型產品`
    const pageDescription = homepageData?.seoDescription || '專業美髮沙龍服務，提供剪髮、染髮、燙髮等服務。銷售優質美髮產品，包含洗髮精、護髮乳、造型產品等。Tim\'s Fantasy World 為您打造完美髮型。'
    const ogTitle = homepageData?.ogTitle || pageTitle
    const ogDescription = homepageData?.ogDescription || pageDescription

    // 使用 Sanity 的關鍵字設定，如果沒有則使用預設值
    const defaultKeywords = [
      '美髮沙龍', '剪髮', '染髮', '燙髮', '造型',
      '洗髮精', '護髮乳', '造型產品', '美髮用品',
      'Tim\'s Fantasy World', '專業美髮', '髮型設計'
    ]
    const keywords = homepageData?.seoKeywords && homepageData.seoKeywords.length > 0
      ? homepageData.seoKeywords
      : defaultKeywords

    return {
      title: pageTitle,
      description: pageDescription,
      keywords: keywords.join(', '),
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: 'website',
        locale: language === 'zh-TW' ? 'zh_TW' : 'en_US',
        siteName: storeName,
        images: homepageData?.ogImage?.asset?.url ? [{
          url: homepageData.ogImage.asset.url,
          alt: homepageData.ogImage.alt || pageTitle
        }] : undefined
      },
      twitter: {
        card: (homepageData?.twitterCard as 'summary' | 'summary_large_image' | 'app' | 'player') || 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        images: homepageData?.ogImage?.asset?.url ? [homepageData.ogImage.asset.url] : undefined
      },
      robots: {
        index: !homepageData?.noIndex,
        follow: !homepageData?.noFollow,
        googleBot: {
          index: !homepageData?.noIndex,
          follow: !homepageData?.noFollow,
        }
      },
      alternates: {
        canonical: homepageData?.canonicalUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "https://timsfantasyworld.com"}/${countryCode}`,
        languages: {
          'zh-TW': `${process.env.NEXT_PUBLIC_BASE_URL || "https://timsfantasyworld.com"}/tw`,
          'en-US': `${process.env.NEXT_PUBLIC_BASE_URL || "https://timsfantasyworld.com"}/us`,
          'ja-JP': `${process.env.NEXT_PUBLIC_BASE_URL || "https://timsfantasyworld.com"}/jp`,
          'en-MY': `${process.env.NEXT_PUBLIC_BASE_URL || "https://timsfantasyworld.com"}/my`,
        }
      }
    }
  } catch (error) {
    // console.error('生成metadata時發生錯誤:', error)
    const storeName = await getStoreName()

    return {
      title: `${storeName} - 專業美髮沙龍與造型產品`,
      description: '專業美髮沙龍服務，提供剪髮、染髮、燙髮等服務。銷售優質美髮產品，包含洗髮精、護髮乳、造型產品等。Tim\'s Fantasy World 為您打造完美髮型。',
      openGraph: {
        title: `${storeName} - 專業美髮沙龍與造型產品`,
        description: '專業美髮沙龍服務，提供剪髮、染髮、燙髮等服務。銷售優質美髮產品，包含洗髮精、護髮乳、造型產品等。',
      }
    }
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params

  // 並行獲取數據以提升性能，添加超時控制
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('請求超時')), 5000);
  });

  const [collectionsData, region] = await Promise.allSettled([
    Promise.race([listCollections({}), timeoutPromise]).catch(() => {
      // console.warn('獲取商品集合時出錯:', err.message);
      return null;
    }),
    Promise.race([getRegion(countryCode), timeoutPromise]).catch(() => {
      // console.warn('獲取地區資訊時出錯:', err.message);
      return null;
    })
  ])

  // 處理數據獲取結果並確保類型正確
  const collections = (collectionsData.status === 'fulfilled' && collectionsData.value) ?
    collectionsData.value : { collections: [], count: 0 } as any
  const regionData = (region.status === 'fulfilled' && region.value) ?
    region.value : null as any

  // 添加調試資訊
  // if (process.env.NODE_ENV === 'development') console.log('🔍 Data fetch results:', {
  // countryCode,
  // collectionsCount: collections?.collections?.length || 0,
  // regionId: regionData?.id,
  // regionName: regionData?.name,
  // collectionsStatus: collectionsData.status,
  // regionStatus: region.status
  // })

  // 獲取首頁內容，並添加錯誤處理
  let homepageData
  try {
    const language = mapCountryToLanguage(countryCode)
    // if (process.env.NODE_ENV === 'development') console.log('🔍 Fetching homepage data from Sanity...')
    homepageData = await getHomePage(language)
    // console.log('✅ Homepage data fetched:', {
    // title: homepageData?.title,
    // sectionsCount: homepageData?.mainSections?.length,
    // hasValidData: !!(homepageData?.mainSections && homepageData.mainSections.length > 0)
    // })
  } catch (error) {
    // console.error('❌ Failed to fetch homepage data:', error)
    homepageData = null
  }

  // 檢查是否有有效的Sanity數據
  const hasSanityData = homepageData?.mainSections && homepageData.mainSections.length > 0

  // console.log('🎯 Data check result:', {
  // homepageData: !!homepageData,
  // mainSections: homepageData?.mainSections?.length || 0,
  // hasSanityData,
  // willUseFallback: !hasSanityData
  // })

  // 如果沒有數據或數據無效，顯示備用內容
  if (!hasSanityData) {
    // console.warn('⚠️ No valid Sanity data found, showing fallback content')

    const t = getTranslation(countryCode)
    return (
      <>
        <div className="mt-16">
          <a
            href="https://page.line.me/timsfantasyworld?fbclid=PARlRTSAMmHoRleHRuA2FlbQIxMAABp_nJitfDUH8W4pRlcRgKeusvIELFdTvXpbu791GiXgPIOarBh8LO2Hg2YJrV_aem_9pdT5ans7oJyF7F17iQPHw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors"
          >
            {t.lineConsult}
          </a>
        </div>

        {/* 精選商品區塊 */}
        {regionData && (
          <FeaturedProducts
            region={regionData}
            collections={collections?.collections || []}
            countryCode={countryCode}
          />
        )}
      </>
    )
  }

  // 如果有有效的Sanity數據，使用它
  if (hasSanityData && homepageData) {
    const { mainSections } = homepageData

    if (!region) {
      return null
    }

    // console.log("🎨 Rendering Sanity content - mainSections:", JSON.stringify(mainSections, null, 2))

    // 生成 JSON-LD 結構化資料
    const jsonLd = generateJsonLd(homepageData)

    return (
      <>
        {/* JSON-LD 結構化資料 */}
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}

        {/* 動態區塊（如果存在） */}
        {mainSections && mainSections.length > 0 ? (
          mainSections
            .filter((section: any) => {
              // 過濾掉空物件或無效的 section
              if (!section || typeof section !== "object" || !("_type" in section) || !section._type) {
                // console.warn(`Filtering out invalid section at index ${index}:`, section);
                return false;
              }
              // 過濾掉非作用中的 section
              if (section.isActive === false) {
                return false;
              }
              return true;
            })
            .map((section: any, index: number) => {
              const sectionType = section._type;
              try {
                // console.log(`🎯 Rendering section ${index}: ${sectionType}`, { isActive: section.isActive })

                switch (sectionType) {
                  case "serviceCardSection": {
                    const serviceSection = section as ServiceCards;

                    // 檢查是否被停用
                    if (serviceSection.isActive === false) {
                      // console.log("❌ ServiceCardSection 已被停用，跳過渲染");
                      return null;
                    }

                    // 直接渲染從 Sanity 獲取的資料
                    return (
                      <ServiceCardsSection
                        key={`service-${index}`}
                        heading={serviceSection.heading || ""}
                        cardsPerRow={serviceSection.cardsPerRow}
                        cards={serviceSection.cards}
                      />
                    );
                  }
                  case "mainBanner": {
                    const bannerSection = section as MainBanner
                    if (!bannerSection.slides || !Array.isArray(bannerSection.slides)) {
                      // console.error("Invalid mainBanner section:", bannerSection)
                      return null
                    }
                    return (
                      <HeroSection
                        key={index}
                        banner={bannerSection}
                      />
                    )
                  }
                  case "imageTextBlock": {
                    const imageBlock = section as ImageTextBlockType
                    // 只傳遞存在的屬性,避免 undefined
                    const props: any = {
                      heading: imageBlock.heading,
                      content: imageBlock.content,
                      image: imageBlock.image,
                      layout: imageBlock.layout,
                      hideTitle: imageBlock.hideTitle,
                      paddingX: imageBlock.paddingX,
                      paddingTop: imageBlock.paddingTop,
                      paddingBottom: imageBlock.paddingBottom,
                      showSpacing: imageBlock.showSpacing
                    }
                    if (imageBlock.leftImage) props.leftImage = imageBlock.leftImage
                    if (imageBlock.rightImage) props.rightImage = imageBlock.rightImage
                    if (imageBlock.leftContent) props.leftContent = imageBlock.leftContent
                    if (imageBlock.rightContent) props.rightContent = imageBlock.rightContent

                    return <ImageTextBlock key={index} {...props} />
                  }
                  case "featuredProducts": {
                    const featuredBlock = section as FeaturedProductsSection
                    // console.log("🎯 Processing featuredProducts section:", featuredBlock)

                    // 安全檢查 collections
                    if (!collections?.collections || !Array.isArray(collections.collections)) {
                      // console.warn("Featured products skipped - backend unavailable")
                      return null  // 安靜地跳過，不阻塞其他區塊
                    }

                    let targetCollection = null;

                    // 1. 嘗試通過 ID 匹配
                    if (featuredBlock.collection_id) {
                      targetCollection = collections.collections.find((c: any) => c.id === featuredBlock.collection_id);
                    }

                    // 2. 如果 ID 匹配失敗，嘗試通過 handle 或 title 匹配 (Fallback 機制)
                    if (!targetCollection) {
                      // console.warn(`Collection ID ${featuredBlock.collection_id} not found. Trying fallback...`);
                      targetCollection = collections.collections.find((c: any) =>
                        c.handle === 'featured' ||
                        c.handle === 'featuerd' || // Handle typo
                        c.title === '精選商品'
                      );
                    }

                    if (!targetCollection) {
                      // console.log("No matching collection found for featured products")
                      return null
                    }

                    // console.log("✅ Rendering FeaturedProducts with collection:", targetCollection.title)

                    // 構造一個包含單個 collection 的數組
                    const featuredCollections = [targetCollection];

                    return (
                      <FeaturedProducts
                        key={index}
                        collections={featuredCollections}
                        region={regionData!}
                        settings={featuredBlock}
                        countryCode={countryCode}
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
                    props.countryCode = countryCode

                    return <BlogPosts {...props} />
                  }
                  case "youtubeSection": {
                    const youtubeBlock = section as YoutubeSectionType
                    // 檢查是否有響應式設定或舊的 videoUrl
                    const hasVideo = youtubeBlock.videoSettings?.desktopVideoUrl ||
                      youtubeBlock.videoSettings?.mobileVideoUrl ||
                      youtubeBlock.videoUrl

                    // console.log('🏠 Homepage YouTube section data:', {
                    // hasVideo,
                    // videoUrl: youtubeBlock.videoUrl,
                    // videoSettings: youtubeBlock.videoSettings,
                    // desktopUrl: youtubeBlock.videoSettings?.desktopVideoUrl,
                    // mobileUrl: youtubeBlock.videoSettings?.mobileVideoUrl,
                    // useSameVideo: youtubeBlock.videoSettings?.useSameVideo
                    // })

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
                  case "googleMapsSection": {
                    // 地圖區塊在 Sanity 中可用但不在前端顯示
                    // console.log("🗺️ GoogleMapsSection found but skipped for frontend display")
                    return null
                  }
                  default:
                    // console.error("Unknown section type:", sectionType)
                    return null
                }
              } catch (error) {
                // console.error("Error rendering section:", sectionType, error)
                return null
              }
            })
        ) : null}

        {/* 硬編碼的地圖已移除 - 現在地圖功能通過 Sanity 管理但不在前端顯示 */}
      </>
    )
  }

  // 如果沒有有效數據，返回null或空內容
  return null
}

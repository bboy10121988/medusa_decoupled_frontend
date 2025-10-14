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
import { getHomepage } from "@lib/sanity"; // 使用 getHomepage 並移除 getServiceSection
import type { MainBanner } from '@lib/types/page-sections'
import type { ImageTextBlock as ImageTextBlockType } from '@lib/types/page-sections'
import type { FeaturedProductsSection } from '@lib/types/page-sections'
import type { BlogSection } from '@lib/types/page-sections'
import type { YoutubeSection as YoutubeSectionType } from '@lib/types/page-sections'
import type { ServiceCards } from '@lib/types/service-cards'
import type { ContentSection as ContentSectionType } from '@lib/types/sections'
import { getStoreName } from "@lib/store-name"


export async function generateMetadata(): Promise<Metadata> {
  try {
    const homepageData = await getHomepage()
    const storeName = await getStoreName()
    
    // 從Sanity獲取SEO資料
    const pageTitle = homepageData?.seoTitle || homepageData?.title || `${storeName} - 專業美髮沙龍與造型產品`
    const pageDescription = homepageData?.seoDescription || '專業美髮沙龍服務，提供剪髮、染髮、燙髮等服務。銷售優質美髮產品，包含洗髮精、護髮乳、造型產品等。Tim\'s Fantasy World 為您打造完美髮型。'
    const ogTitle = homepageData?.ogTitle || pageTitle
    const ogDescription = homepageData?.ogDescription || pageDescription
    
    return {
      title: pageTitle,
      description: pageDescription,
      keywords: [
        '美髮沙龍', '剪髮', '染髮', '燙髮', '造型', 
        '洗髮精', '護髮乳', '造型產品', '美髮用品',
        'Tim\'s Fantasy World', '專業美髮', '髮型設計'
      ].join(', '),
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: 'website',
        locale: 'zh_TW',
        siteName: storeName,
        images: homepageData?.ogImage?.asset?.url ? [{
          url: homepageData.ogImage.asset.url,
          alt: homepageData.ogImage.alt || pageTitle
        }] : undefined
      },
      twitter: {
        card: 'summary_large_image',
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
        canonical: homepageData?.canonicalUrl
      }
    }
  } catch (error) {
    console.error('生成metadata時發生錯誤:', error)
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
    Promise.race([listCollections({}), timeoutPromise]).catch(err => {
      console.warn('獲取商品集合時出錯:', err.message);
      return null;
    }),
    Promise.race([getRegion(countryCode), timeoutPromise]).catch(err => {
      console.warn('獲取地區資訊時出錯:', err.message);
      return null;
    })
  ])

  // 處理數據獲取結果
  const collections = collectionsData.status === 'fulfilled' && collectionsData.value ? 
    collectionsData.value : { collections: [], count: 0 }
  const regionData = region.status === 'fulfilled' && region.value ? 
    region.value : null

  // 添加調試資訊
  if (process.env.NODE_ENV === 'development') console.log('🔍 Data fetch results:', {
    countryCode,
    collectionsCount: collections?.collections?.length || 0,
    regionId: regionData?.id,
    regionName: regionData?.name,
    collectionsStatus: collectionsData.status,
    regionStatus: region.status
  })

  // 獲取首頁內容，並添加錯誤處理
  let homepageData
  try {
    if (process.env.NODE_ENV === 'development') console.log('🔍 Fetching homepage data from Sanity...')
    homepageData = await getHomepage()
    console.log('✅ Homepage data fetched:', { 
      title: homepageData?.title, 
      sectionsCount: homepageData?.mainSections?.length,
      hasValidData: !!(homepageData?.mainSections && homepageData.mainSections.length > 0)
    })
  } catch (error) {
    console.error('❌ Failed to fetch homepage data:', error)
    homepageData = null
  }

  // 檢查是否有有效的Sanity數據
  const hasSanityData = homepageData?.mainSections && homepageData.mainSections.length > 0

  console.log('🎯 Data check result:', {
    homepageData: !!homepageData,
    mainSections: homepageData?.mainSections?.length || 0,
    hasSanityData,
    willUseFallback: !hasSanityData
  })

  // 如果沒有數據或數據無效，顯示備用內容
  if (!hasSanityData) {
    console.warn('⚠️ No valid Sanity data found, showing fallback content')
    
    return (
      <>
        <div className="mt-16">
          <a 
            href="https://page.line.me/timsfantasyworld?fbclid=PARlRTSAMmHoRleHRuA2FlbQIxMAABp_nJitfDUH8W4pRlcRgKeusvIELFdTvXpbu791GiXgPIOarBh8LO2Hg2YJrV_aem_9pdT5ans7oJyF7F17iQPHw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors"
          >
            立即預約 LINE 諮詢
          </a>
        </div>
        
        {/* 精選商品區塊 */}
        {regionData && (
          <FeaturedProducts
            region={regionData}
            collections={collections?.collections || []}
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

    console.log("🎨 Rendering Sanity content - mainSections:", JSON.stringify(mainSections, null, 2))

    return (
      <>
        {/* 動態區塊（如果存在） */}
        {mainSections && mainSections.length > 0 ? (
          mainSections
            .filter((section: any, index: number) => {
              // 過濾掉空物件或無效的 section
              if (!section || typeof section !== "object" || !("_type" in section) || !section._type) {
                console.warn(`Filtering out invalid section at index ${index}:`, section);
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
                console.log(`🎯 Rendering section ${index}: ${sectionType}`, { isActive: section.isActive })
                
                switch (sectionType) {
                  case "serviceCardSection": {
                    const serviceSection = section as ServiceCards;
                    
                    // 檢查是否被停用
                    if (serviceSection.isActive === false) {
                      console.log("❌ ServiceCardSection 已被停用，跳過渲染");
                      return null;
                    }
                    
                    // 直接渲染從 Sanity 獲取的資料
                    return (
                      <ServiceCardsSection
                        key={`service-${index}`}
                        heading={serviceSection.heading}
                        cardsPerRow={serviceSection.cardsPerRow}
                        cards={serviceSection.cards}
                      />
                    );
                  }
                  case "mainBanner": {
                    const bannerSection = section as MainBanner
                    if (!bannerSection.slides || !Array.isArray(bannerSection.slides)) {
                      console.error("Invalid mainBanner section:", bannerSection)
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
                    return (
                      <ImageTextBlock
                        key={index}
                        heading={imageBlock.heading}
                        content={imageBlock.content}
                        image={imageBlock.image}
                        layout={imageBlock.layout}
                        leftImage={imageBlock.leftImage}
                        rightImage={imageBlock.rightImage}
                        leftContent={imageBlock.leftContent}
                        rightContent={imageBlock.rightContent}
                        hideTitle={imageBlock.hideTitle}
                      />
                    )
                  }
                  case "featuredProducts": {
                    const featuredBlock = section as FeaturedProductsSection
                    console.log("🎯 Processing featuredProducts section:", featuredBlock)
                    
                    if (!featuredBlock.collection_id) {
                      console.error("Invalid featuredProducts section:", featuredBlock)
                      return null
                    }

                    // 安全檢查 collections
                    if (!collections?.collections || !Array.isArray(collections.collections)) {
                      console.warn("Featured products skipped - backend unavailable")
                      return null  // 安靜地跳過，不阻塞其他區塊
                    }

                    console.log("🔍 Looking for collection:", featuredBlock.collection_id, "in collections:", collections.collections.map((c: any) => c.id))

                    try {
                      const featuredCollections = collections.collections.filter((c: any) =>
                        featuredBlock.collection_id === c.id
                      )

                      console.log("📦 Filtered collections:", featuredCollections.length, featuredCollections.map((c: any) => c.id))

                      if (featuredCollections.length === 0) {
                        console.log("No matching collection found for featured products")
                        return null
                      }

                      console.log("✅ Rendering FeaturedProducts with collections:", featuredCollections.length)
                      return (
                        <FeaturedProducts
                          key={index}
                          collections={featuredCollections}
                          region={regionData!}
                          settings={featuredBlock}
                        />
                      )
                    } catch (error) {
                      console.error("Featured products rendering error:", error)
                      return null  // 安靜地跳過，不阻塞其他區塊
                    }
                  }
                  case "blogSection": {
                    const blogSection = section as BlogSection
                    return (
                      <BlogPosts 
                        key={index}
                        title={blogSection.title}
                        category={blogSection.category}
                        limit={blogSection.limit || 2}
                        postsPerRow={blogSection.postsPerRow || 3}
                        showTitle={!!blogSection.title}
                      />
                    )
                  }
                  case "youtubeSection": {
                    const youtubeBlock = section as YoutubeSectionType
                    // 檢查是否有響應式設定或舊的 videoUrl
                    const hasVideo = youtubeBlock.videoSettings?.desktopVideoUrl || 
                                   youtubeBlock.videoSettings?.mobileVideoUrl || 
                                   youtubeBlock.videoUrl
                    
                    console.log('🏠 Homepage YouTube section data:', {
                      hasVideo,
                      videoUrl: youtubeBlock.videoUrl,
                      videoSettings: youtubeBlock.videoSettings,
                      desktopUrl: youtubeBlock.videoSettings?.desktopVideoUrl,
                      mobileUrl: youtubeBlock.videoSettings?.mobileVideoUrl,
                      useSameVideo: youtubeBlock.videoSettings?.useSameVideo
                    })
                    
                    if (!hasVideo) {
                      console.error("Invalid YouTube section (missing video URL):", youtubeBlock)
                      return null
                    }
                    return (
                      <YoutubeSection
                        key={index}
                        _type="youtubeSection"
                        isActive={true}
                        heading={youtubeBlock.heading}
                        description={youtubeBlock.description}
                        videoUrl={youtubeBlock.videoUrl}
                        videoMode={youtubeBlock.videoMode}
                        youtubeSettings={youtubeBlock.youtubeSettings}
                        uploadSettings={youtubeBlock.uploadSettings}
                        videoSettings={youtubeBlock.videoSettings}
                        fullWidth={youtubeBlock.fullWidth}
                      />
                    )
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
                    console.log("🗺️ GoogleMapsSection found but skipped for frontend display")
                    return null
                  }
                  default:
                    console.error("Unknown section type:", sectionType)
                    return null
                }
              } catch (error) {
                console.error("Error rendering section:", sectionType, error)
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

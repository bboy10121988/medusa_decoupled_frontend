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
  const { title } = await getHomepage() // 使用 getHomepage
  const storeName = await getStoreName()
  
  return {
    title: title || storeName,
    description: '專業美髮沙龍與高級美髮產品',
    openGraph: {
      title: title || storeName,
      description: '專業美髮沙龍與高級美髮產品',
    }
  }
}

export default async function Home({
  params,
}: {
  params: { countryCode: string }
}) {
  const { countryCode } = await params
  const collectionsData = await listCollections({})
  const region = await getRegion(countryCode)

  // 添加調試資訊
  if (process.env.NODE_ENV === 'development') console.log('🔍 Data fetch results:', {
    countryCode,
    collectionsCount: collectionsData?.collections?.length || 0,
    regionId: region?.id,
    regionName: region?.name
  })

  // 獲取首頁內容，並添加錯誤處理
  let homepageData
  try {
    if (process.env.NODE_ENV === 'development') console.log('🔍 Fetching homepage data from Sanity...')
    homepageData = await getHomepage()
    console.log('✅ Homepage data fetched:', { 
      title: homepageData?.title, 
      sectionsCount: homepageData?.mainSections?.length,
      hasValidData: !!(homepageData && homepageData.mainSections && homepageData.mainSections.length > 0)
    })
  } catch (error) {
    console.error('❌ Failed to fetch homepage data:', error)
    homepageData = null
  }

  // 檢查是否有有效的Sanity數據
  const hasSanityData = homepageData && homepageData.mainSections && homepageData.mainSections.length > 0

  console.log('🎯 Data check result:', {
    homepageData: !!homepageData,
    mainSections: homepageData?.mainSections?.length || 0,
    hasSanityData,
    willUseFallback: !hasSanityData
  })

  // 如果沒有數據或數據無效，顯示備用內容
  if (!hasSanityData) {
    console.warn('⚠️ No valid Sanity data found, showing fallback content')
    
    // 確保 region 存在再渲染組件
    if (!region) {
      return <div>Loading...</div>
    }
    
    return (
      <>
        {/* 簡單的歡迎區塊 */}
        <div className="min-h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              歡迎來到 Tim's Fantasy World
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              專業美髮沙龍與高級美髮產品
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              我們座落於繁華永康商圈，提供專業男士理髮和染髮、燙髮服務。
              秉持著專業熱忱，讓 barber 精神融入男士們的日常、創造自己的風格。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  ✂️
                </div>
                <h3 className="text-xl font-semibold mb-2">專業剪髮</h3>
                <p className="text-gray-600">資深設計師親自為您打造完美髮型</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  🎨
                </div>
                <h3 className="text-xl font-semibold mb-2">染髮服務</h3>
                <p className="text-gray-600">多元化染髮選擇，展現個人風格</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  🌊
                </div>
                <h3 className="text-xl font-semibold mb-2">燙髮造型</h3>
                <p className="text-gray-600">各式燙髮技術，創造層次感</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  💆
                </div>
                <h3 className="text-xl font-semibold mb-2">頭皮護理</h3>
                <p className="text-gray-600">深層清潔與滋養，維持頭皮健康</p>
              </div>
            </div>
            <div className="mt-16">
              <a 
                href="https://page.line.me/timsfantasyworld" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors"
              >
                立即預約 LINE 諮詢
              </a>
            </div>
          </div>
        </div>
        
        {/* 精選商品區塊 */}
        <FeaturedProducts
          region={region}
          collections={collectionsData?.collections || []}
        />
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
                    // 直接渲染從 Sanity 獲取的資料
                    return (
                      <ServiceCardsSection
                        key={index}
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

                    // 安全檢查 collectionsData
                    if (!collectionsData || !collectionsData.collections || !Array.isArray(collectionsData.collections)) {
                      console.warn("Featured products skipped - backend unavailable")
                      return null  // 安靜地跳過，不阻塞其他區塊
                    }

                    console.log("🔍 Looking for collection:", featuredBlock.collection_id, "in collections:", collectionsData.collections.map(c => c.id))

                    try {
                      const featuredCollections = collectionsData.collections.filter((c: any) =>
                        featuredBlock.collection_id === c.id
                      )

                      console.log("📦 Filtered collections:", featuredCollections.length, featuredCollections.map(c => c.id))

                      if (featuredCollections.length === 0) {
                        console.log("No matching collection found for featured products")
                        return null
                      }

                      console.log("✅ Rendering FeaturedProducts with collections:", featuredCollections.length)
                      return (
                        <FeaturedProducts
                          key={index}
                          collections={featuredCollections}
                          region={region}
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
                    if (!youtubeBlock.videoUrl) {
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

        {/* 添加 Google Maps iframe */}
        <div style={{ marginTop: "0" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9025.597972804986!2d121.51735723134998!3d25.031793426603716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a9446e13fa69%3A0x3e9b9e89bc90f145!2zVGlt4oCZcyBmYW50YXN5IFdvcmxkIOeUt-Wjq-eQhumrruW7sw!5e0!3m2!1szh-TW!2stw!4v1749469703866!5m2!1szh-TW!2stw"
            width="100%"
            height="450"
            style={{ border: "0" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </>
    )
  }

  // 如果沒有有效數據，返回null或空內容
  return null
}

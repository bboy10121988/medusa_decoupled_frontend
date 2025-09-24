import { notFound } from 'next/navigation'
import { client } from '@/sanity-client'
import { Metadata } from 'next'
import SimplePageRenderer from '@/components/grapesjs/SimplePageRenderer'
import { urlForImage } from '@lib/sanity-utils/image'

// 導入模組組件
import HeroSection from "@modules/home/components/hero-section"
import ServiceCardsSection from "@modules/home/components/service-cards-section"
import ImageTextBlock from "@modules/home/components/image-text-block"
import FeaturedProducts from "@modules/home/components/featured-products"
import BlogPosts from "@modules/blog/components/blog-posts"
import YoutubeSection from "@modules/home/components/youtube-section"

// 導入類型
import type { 
  MainBanner
} from '@/types/sanity'
import type { YoutubeSection as YoutubeSectionType } from '@lib/types/page-sections'
import { listCollections } from '@lib/data/collections'
import { getRegion } from '@lib/data/regions'
import type { HttpTypes } from '@medusajs/types'

// 已知的系統路由，這些路由不應該被 GrapesJS 頁面處理
const SYSTEM_ROUTES = [
  'account',
  'affiliate',
  'affiliate-admin', 
  'blog',
  'cart',
  'categories',
  'collections',
  'login-affiliate',
  'order',
  'products',
  'regitster-affiliate',
  'store',
  'test-footer',
  // 管理相關路由
  'pages-manager',
  'cms',
  // 其他系統路由
  'checkout',
  'admin',
  'api'
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
  
  // 將 slug 數組轉換為字符串，處理多層路由
  const slugString = slug.join('/')
  
  try {
    const page = await client.fetch(
      `*[_type == "grapesJSPageV2" && slug.current == $slug][0] {
        title,
        status,
        seoTitle,
        seoDescription,
        seoKeywords
      }`,
      { slug: slugString }
    )

    if (!page || page.status !== 'published') {
      return {
        title: '頁面未找到',
        description: '請求的頁面不存在'
      }
    }

    return {
      title: page.seoTitle || page.title || '頁面',
      description: page.seoDescription || '使用 GrapesJS 編輯器創建的頁面',
      keywords: page.seoKeywords ? page.seoKeywords.join(', ') : undefined,
    }
  } catch (error) {
    console.error('生成頁面元數據失敗:', error)
    return {
      title: '頁面',
      description: '頁面內容'
    }
  }
}

// 主頁面組件
export default async function CountryCodeCatchAllPage({ params }: PageProps) {
  const { countryCode, slug } = await params
  
  // 將 slug 數組轉換為字符串
  const slugString = slug.join('/')
  
  // 檢查第一個路由段是否為系統路由
  const firstSegment = slug[0]
  if (SYSTEM_ROUTES.includes(firstSegment)) {
    notFound()
  }
  
  try {
    // 從 Sanity 獲取頁面數據
    const page = await client.fetch(
      `*[_type == "grapesJSPageV2" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        status,
        grapesHtml,
        grapesCss,
        grapesComponents,
        grapesStyles,
        "homeModules": homeModules[] {
          _type,
          moduleType,
          isActive,
          order,
          _type == "mainBannerModule" => {
            _type,
            moduleType,
            isActive,
            order,
            "slides": settings.slides[] {
              heading,
              subheading,
              "desktopImage": desktopImage.asset->url,
              "desktopImageAlt": desktopImage.alt,
              "mobileImage": mobileImage.asset->url,
              "mobileImageAlt": mobileImage.alt,
              buttonText,
              buttonLink
            },
            "bannerSettings": settings.settings {
              autoplay,
              autoplaySpeed,
              showArrows,
              showDots
            }
          },
          _type != "mainBannerModule" => {
            settings
          }
        },
        createdAt,
        updatedAt
      }`,
      { slug: slugString }
    )

    if (!page) {
      console.log(`頁面未找到: /${countryCode}/${slugString}`)
      notFound()
    }

    // 檢查頁面發布狀態 - 只有已發布的頁面可以在前端顯示
    if (page.status !== 'published') {
      console.log(`頁面未發布，靜默返回404: /${countryCode}/${slugString}`, { 
        pageId: page._id, 
        status: page.status,
        title: page.title 
      })
      // 使用 notFound() 是 Next.js 的標準做法，錯誤信息是正常的內部機制
      notFound()
    }

    console.log(`載入頁面: /${countryCode}/${slugString}`, { 
      pageId: page._id, 
      title: page.title,
      status: page.status,
      hasHomeModules: !!page.homeModules?.length,
      hasGrapesHtml: !!page.grapesHtml 
    })

    // 檢查是否有模組配置
    const hasModules = page.homeModules && Array.isArray(page.homeModules) && page.homeModules.length > 0
    
    // 如果有模組配置，需要獲取額外的數據
    let collections: HttpTypes.StoreCollection[] | null = null
    let region: HttpTypes.StoreRegion | null = null
    
    if (hasModules) {
      // 檢查是否需要商品收藏數據
      const needsCollections = page.homeModules.some((module: any) => 
        module.moduleType === 'featuredProducts'
      )
      
      if (needsCollections) {
        try {
          const collectionsData = await listCollections()
          collections = collectionsData.collections
          region = await getRegion(countryCode) || null
        } catch (error) {
          console.error('獲取商品數據失敗:', error)
        }
      }
    }

    // 渲染頁面內容
    return (
      <div>
        {/* 渲染模組設定 */}
        {hasModules && (
          <div className="space-y-8">
            {page.homeModules
              .filter((module: any) => module.isActive !== false)
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((module: any, index: number) => renderModule(module, index, collections, region))}
          </div>
        )}
        
        {/* 渲染 GrapesJS HTML 內容 */}
        {page.grapesHtml && (
          <SimplePageRenderer 
            htmlContent={page.grapesHtml} 
            cssContent={page.grapesCss}
          />
        )}
        
        {/* 如果沒有任何內容 */}
        {!hasModules && !page.grapesHtml && (
          <div className="container mx-auto px-4 py-8">
            <p>頁面內容為空</p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('載入頁面失敗:', error)
    notFound()
  }
}

// 渲染模組的函數
function renderModule(
  module: any, 
  index: number, 
  collections: HttpTypes.StoreCollection[] | null,
  region: HttpTypes.StoreRegion | null
) {
  if (!module || module.isActive === false) return null

  const settings = module.settings || {}
  const moduleType = module.moduleType

  try {
    console.log(`🎯 Rendering module ${index}: ${moduleType}`, { isActive: module.isActive })
    
    switch (moduleType) {
      case "mainBanner": {
        // mainBanner 的數據結構：module.slides 和 module.bannerSettings 是平級的
        const slides = module.slides || []
        const bannerSettings = module.bannerSettings || {}
        
        console.log('🎯 MainBanner data:', { 
          slides, 
          bannerSettings, 
          moduleData: module,
          moduleType: module._type,
          rawModuleType: module.moduleType 
        })
        
        if (!slides || !Array.isArray(slides) || slides.length === 0) {
          console.error("Invalid mainBanner module - no slides:", module)
          return null
        }
        
        // 構建正確的 MainBanner 對象
        const banner: MainBanner = {
          _type: "mainBanner",
          isActive: true,
          slides: slides.map((slide: any, slideIndex: number) => {
            console.log(`🎯 處理 slide ${slideIndex}:`, {
              heading: slide.heading,
              desktopImage: slide.desktopImage,
              mobileImage: slide.mobileImage,
              desktopImageAlt: slide.desktopImageAlt,
              mobileImageAlt: slide.mobileImageAlt,
              hasDesktopImage: !!slide.desktopImage,
              hasMobileImage: !!slide.mobileImage
            })
            
            return {
              heading: slide.heading || '',
              subheading: slide.subheading || '',
              desktopImage: slide.desktopImage || '',
              desktopImageAlt: slide.desktopImageAlt || '',
              mobileImage: slide.mobileImage || '',
              mobileImageAlt: slide.mobileImageAlt || '',
              imageLink: slide.imageLink || ''
            }
          }),
          settings: {
            autoplay: bannerSettings.autoplay ?? true,
            autoplaySpeed: bannerSettings.autoplaySpeed ?? 5,
            showArrows: bannerSettings.showArrows ?? true,
            showDots: bannerSettings.showDots ?? true
          }
        }
        
        return (
          <HeroSection
            key={`module-banner-${index}`}
            banner={banner}
          />
        )
      }
      
      case "serviceCardSection": {
        const serviceSettings = settings as any
        const processedCards = serviceSettings.cards?.map((card: any) => ({
          ...card,
          stylists: card.stylists?.map((stylist: any) => ({
            ...stylist,
            cardImage: stylist.cardImage ? {
              url: urlForImage(stylist.cardImage) || '',
              alt: stylist.cardImage?.alt || ''
            } : undefined
          }))
        })) || []
        
        return (
          <ServiceCardsSection
            key={`module-service-${index}`}
            heading={serviceSettings.heading || ''}
            cardsPerRow={serviceSettings.cardsPerRow || 3}
            cards={processedCards}
          />
        )
      }
      
      case "imageTextBlock": {
        const imageSettings = settings as any
        return (
          <ImageTextBlock
            key={`module-image-${index}`}
            heading={imageSettings.heading || ''}
            content={imageSettings.content || ''}
            image={imageSettings.image ? {
              url: urlForImage(imageSettings.image) || '',
              alt: imageSettings.image?.alt || ''
            } : undefined}
            layout={imageSettings.layout || 'left'}
            leftImage={imageSettings.leftImage ? {
              url: urlForImage(imageSettings.leftImage) || '',
              alt: imageSettings.leftImage?.alt || ''
            } : undefined}
            rightImage={imageSettings.rightImage ? {
              url: urlForImage(imageSettings.rightImage) || '',
              alt: imageSettings.rightImage?.alt || ''
            } : undefined}
            leftContent={imageSettings.leftContent || ''}
            rightContent={imageSettings.rightContent || ''}
            hideTitle={imageSettings.hideTitle || false}
          />
        )
      }
      
      case "featuredProducts": {
        const featuredSettings = settings as any
        
        if (!featuredSettings.collection_id) {
          console.error("Invalid featuredProducts module:", featuredSettings)
          return null
        }

        // 安全檢查 collections
        if (!collections || !Array.isArray(collections)) {
          console.warn("Featured products skipped - collections not available")
          return null
        }

        try {
          const featuredCollections = collections.filter((c: any) =>
            featuredSettings.collection_id === c.id
          )

          if (featuredCollections.length === 0) {
            console.log("No matching collection found for featured products")
            return null
          }

          return (
            <FeaturedProducts
              key={`module-featured-${index}`}
              collections={featuredCollections}
              region={region!}
              settings={featuredSettings}
            />
          )
        } catch (error) {
          console.error("Featured products rendering error:", error)
          return null
        }
      }
      
      case "blogSection": {
        const blogSettings = settings as any
        return (
          <BlogPosts 
            key={`module-blog-${index}`}
            title={blogSettings.title || ''}
            category={blogSettings.category || ''}
            limit={blogSettings.limit || 2}
            postsPerRow={blogSettings.postsPerRow || 3}
          />
        )
      }
      
      case "youtubeSection": {
        const youtubeSettings = settings as YoutubeSectionType
        return (
          <YoutubeSection
            key={`module-youtube-${index}`}
            _type="youtubeSection"
            isActive={true}
            heading={youtubeSettings.heading}
            description={youtubeSettings.description}
            videoUrl={youtubeSettings.videoUrl}
            fullWidth={youtubeSettings.fullWidth ?? true}
          />
        )
      }
      
      default:
        console.warn(`Unknown module type: ${moduleType}`)
        return null
    }
  } catch (error) {
    console.error(`Error rendering module ${moduleType}:`, error)
    return null
  }
}

// 生成靜態路徑（可選，用於預渲染）
// 移除預產生的靜態參數，避免影響其他動態路由的建置
// export async function generateStaticParams() { /* removed to force dynamic */ }

import { notFound } from 'next/navigation'
import { client } from '@/sanity-client'
import { Metadata } from 'next'
import Nav from '@modules/layout/templates/nav'
import Footer from '@modules/layout/templates/footer'
import HeroSection from '@modules/home/components/hero-section'
import ServiceCardsSection from '@modules/home/components/service-cards-section'
import ImageTextBlock from '@modules/home/components/image-text-block'
import FeaturedProducts from '@modules/home/components/featured-products'
import BlogPosts from '@modules/blog/components/blog-posts'
import YoutubeSection from '@modules/home/components/youtube-section'
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
  'studio',
  'grapesjs-pages',
  'pages-manager',
  // 其他系統路由
  'checkout',
  'admin',
  'api'
]

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// 動態生成頁面元數據
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const page = await client.fetch(
      `*[_type == "grapesJSPageV2" && slug.current == $slug][0] {
        title,
        seoTitle,
        seoDescription,
        seoKeywords
      }`,
      { slug }
    )

    if (!page) {
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
type HomeModule = {
  moduleType: string
  isActive?: boolean
  order?: number
  settings?: any
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || ''

const resolveSanityImageUrl = (image: any): string => {
  if (!image) return ''
  if (typeof image === 'string') return image
  if (typeof image === 'object') {
    if (typeof image.url === 'string') return image.url
    const asset = image.asset || image
    if (asset && typeof asset._ref === 'string' && projectId && dataset) {
      const parts = asset._ref.split('-')
      if (parts.length >= 4) {
        const [, id, dimension, format] = parts
        if (id && dimension && format) {
          return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimension}.${format}`
        }
      }
    }
  }
  return ''
}

const resolveSanityImageAlt = (image: any, fallback = ''): string => {
  if (!image) return fallback
  if (typeof image === 'object') {
    if (typeof image.alt === 'string') return image.alt
    if (image.asset && typeof image.asset.alt === 'string') return image.asset.alt
  }
  return fallback
}

const mergeSettings = (raw: any = {}) => {
  if (!raw || typeof raw !== 'object') return {}
  const nested = typeof raw.settings === 'object' ? raw.settings : {}
  return { ...raw, ...nested }
}

const sanitizeRenderedHtml = (html: string) => {
  if (typeof html !== 'string') return html
  return html
    .replace(/<div[^>]*class=["'][^"']*module-preview[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class=["'][^"']*module-config-hint[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
}

const normalizeSlides = (slides: any[] = []) =>
  slides
    .map((slide) => ({
      heading: slide?.heading || '',
      subheading: slide?.subheading || '',
      backgroundImage: resolveSanityImageUrl(slide?.backgroundImage || slide?.image),
      backgroundImageAlt: resolveSanityImageAlt(slide?.backgroundImage || slide?.image, slide?.backgroundImageAlt || ''),
      buttonText: slide?.buttonText || '',
      buttonLink: slide?.buttonLink || ''
    }))
    .filter((slide) => slide.heading || slide.subheading || slide.backgroundImage)

const normalizeServiceCards = (cards: any[] = []) =>
  cards.map((card) => ({
    title: card?.title || '',
    englishTitle: card?.englishTitle || '',
    stylists: Array.isArray(card?.stylists)
      ? card.stylists.map((stylist) => ({
          levelName: stylist?.levelName || '',
          price: stylist?.price ?? 0,
          priceType: stylist?.priceType || 'up',
          stylistName: stylist?.stylistName || '',
          stylistInstagramUrl: stylist?.stylistInstagramUrl || '',
          isDefault: stylist?.isDefault ?? false,
          cardImage: (() => {
            const url = resolveSanityImageUrl(stylist?.cardImage)
            if (!url) return undefined
            return {
              url,
              alt: resolveSanityImageAlt(stylist?.cardImage, stylist?.cardImageAlt || '')
            }
          })()
        }))
      : []
  }))

const renderContentSection = (module: HomeModule) => {
  const settings = mergeSettings(module.settings)
  if (!settings.content && !settings.heading) return null
  return (
    <section key={`content-${module.order}`} className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        {settings.hideTitle !== true && settings.heading && (
          <h2 className="h2 text-center mb-6">{settings.heading}</h2>
        )}
        {settings.content && (
          <div className="prose max-w-none mx-auto" dangerouslySetInnerHTML={{ __html: settings.content }} />
        )}
      </div>
    </section>
  )
}

const renderModule = (
  module: HomeModule,
  index: number,
  collections: HttpTypes.StoreCollection[] | null,
  region: HttpTypes.StoreRegion | null
) => {
  if (!module || module.isActive === false) return null

  const orderKey = module.order ?? index
  const rawSettings = module.settings || {}
  const mergedSettings = mergeSettings(rawSettings)

  switch (module.moduleType) {
    case 'mainBanner': {
      const slidesSource = Array.isArray(rawSettings.slides)
        ? rawSettings.slides
        : Array.isArray(mergedSettings.slides)
          ? mergedSettings.slides
          : []
      const slides = normalizeSlides(slidesSource)
      if (slides.length === 0) return null
      return (
        <HeroSection
          key={`module-hero-${orderKey}`}
          banner={{
            _type: 'mainBanner',
            isActive: true,
            slides,
            settings: {
              autoplay: mergedSettings.autoplay ?? true,
              autoplaySpeed: mergedSettings.autoplaySpeed ?? 5,
              showArrows: mergedSettings.showArrows ?? true,
              showDots: mergedSettings.showDots ?? true
            }
          }}
        />
      )
    }
    case 'serviceCardSection': {
      const cardsSource = Array.isArray(rawSettings.cards)
        ? rawSettings.cards
        : Array.isArray(mergedSettings.cards)
          ? mergedSettings.cards
          : []
      const cards = normalizeServiceCards(cardsSource)
      if (cards.length === 0) return null
      return (
        <ServiceCardsSection
          key={`module-service-${orderKey}`}
          heading={mergedSettings.heading || ''}
          cardsPerRow={Number(mergedSettings.cardsPerRow) || 3}
          cards={cards}
        />
      )
    }
    case 'imageTextBlock': {
      return (
        <ImageTextBlock
          key={`module-image-text-${orderKey}`}
          heading={mergedSettings.heading || ''}
          content={mergedSettings.content || ''}
          layout={mergedSettings.layout || 'imageLeft'}
          image={mergedSettings.image ? {
            url: resolveSanityImageUrl(mergedSettings.image),
            alt: resolveSanityImageAlt(mergedSettings.image, mergedSettings.image?.alt || '')
          } : undefined}
          leftImage={mergedSettings.leftImage ? {
            url: resolveSanityImageUrl(mergedSettings.leftImage),
            alt: resolveSanityImageAlt(mergedSettings.leftImage, mergedSettings.leftImage?.alt || '')
          } : undefined}
          rightImage={mergedSettings.rightImage ? {
            url: resolveSanityImageUrl(mergedSettings.rightImage),
            alt: resolveSanityImageAlt(mergedSettings.rightImage, mergedSettings.rightImage?.alt || '')
          } : undefined}
          leftContent={mergedSettings.leftContent || ''}
          rightContent={mergedSettings.rightContent || ''}
          hideTitle={mergedSettings.hideTitle}
        />
      )
    }
    case 'featuredProducts': {
      if (!collections || !region) return null
      const targetCollections = collections.filter((collection) => collection.id === mergedSettings.collection_id)
      if (targetCollections.length === 0) return null
      return (
        <FeaturedProducts
          key={`module-featured-${orderKey}`}
          collections={targetCollections}
          region={region}
          settings={{
            _type: 'featuredProducts',
            heading: mergedSettings.heading || '',
            showHeading: mergedSettings.showHeading ?? true,
            showSubheading: mergedSettings.showSubheading ?? true,
            collection_id: mergedSettings.collection_id || '',
            isActive: true
          }}
        />
      )
    }
    case 'blogSection': {
      return (
        <BlogPosts
          key={`module-blog-${orderKey}`}
          title={mergedSettings.title || ''}
          category={mergedSettings.category || ''}
          limit={Number(mergedSettings.limit) || 6}
          postsPerRow={Number(mergedSettings.postsPerRow) || 3}
          showTitle={Boolean(mergedSettings.title)}
        />
      )
    }
    case 'youtubeSection': {
      if (!mergedSettings.videoUrl) return null
      return (
        <YoutubeSection
          key={`module-youtube-${orderKey}`}
          _type="youtubeSection"
          isActive={true}
          heading={mergedSettings.heading}
          description={mergedSettings.description}
          videoUrl={mergedSettings.videoUrl}
          fullWidth={mergedSettings.fullWidth ?? true}
        />
      )
    }
    case 'contentSection':
      return renderContentSection({ ...module, settings: mergedSettings })
    default:
      return null
  }
}

export default async function DynamicPageV2({ params }: PageProps) {
  const { slug } = await params
  
  // 如果是系統路由，則調用 notFound() 讓其他路由處理
  if (SYSTEM_ROUTES.includes(slug)) {
    notFound()
  }
  
  try {
    // 從 Sanity 獲取頁面數據（包含草稿頁面用於測試）
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
        homeModules,
        createdAt,
        updatedAt
      }`,
      { slug }
    )

    if (!page) {
      notFound()
    }

    // 返回渲染的 HTML 內容
    const homeModulesRaw: any[] = Array.isArray(page.homeModules) ? page.homeModules : []
    const sortedModules = [...homeModulesRaw].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0)) as HomeModule[]

    const needsCollections = sortedModules.some((module) => module.moduleType === 'featuredProducts')
    let collections: HttpTypes.StoreCollection[] | null = null
    let region: HttpTypes.StoreRegion | null = null

    if (needsCollections) {
      const [collectionsResult, regionResult] = await Promise.allSettled([
        listCollections({}),
        getRegion('tw')
      ])

      if (collectionsResult.status === 'fulfilled') {
        collections = collectionsResult.value?.collections || null
      }
      if (regionResult.status === 'fulfilled') {
        region = regionResult.value || null
      }
    }

    const hasModules = sortedModules.length > 0

    return (
      <>
        <Nav />
        <main className="dynamic-page">
          {/* 先注入 GrapesJS 的 CSS，讓下方模組樣式可覆寫它，避免被全域規則影響 */}
          {page.grapesCss && (
            <style dangerouslySetInnerHTML={{ __html: page.grapesCss }} />
          )}

          {(page.status === 'preview' || page.status === 'draft') && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              background: page.status === 'draft' ? '#dc2626' : '#ff9500',
              color: '#fff',
              padding: '8px',
              textAlign: 'center',
              fontSize: '14px',
              zIndex: 1000
            }}>
              {page.status === 'draft' ? '草稿模式 - 此頁面正在開發中' : '預覽模式 - 此頁面尚未發布'}
            </div>
          )}

          {hasModules && (
            <div className="space-y-8">
              {sortedModules.map((module, index) => renderModule(module, index, collections, region))}
            </div>
          )}

          {page.grapesHtml && (
            <div
              className="mt-8 grapes-content"
              dangerouslySetInnerHTML={{
                __html: sanitizeRenderedHtml(page.grapesHtml)
              }}
            />
          )}
        </main>
        <Footer />
      </>
    )
  } catch (error) {
    console.error('載入頁面失敗:', error)
    notFound()
  }
}

// 生成靜態路徑（可選，用於預渲染）
// export async function generateStaticParams() { /* removed */ }


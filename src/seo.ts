import { Metadata } from "next"

interface SanitySEOMeta {
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
  seoKeywords?: string[]
  canonicalUrl?: string
  noIndex?: boolean
  noFollow?: boolean
  ogTitle?: string
  ogDescription?: string
  ogImage?: {
    asset: {
      url: string
    }
    alt: string
  }
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  priority?: number
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  structuredDataType?: string
  articleType?: string
  customJsonLd?: string
}

interface ProductKeywordsConfig {
  presetKeywords: Record<string, string[]>
  extractFields: string[]
}

// Google Search Essentials 關鍵字配置
const defaultKeywordConfig: ProductKeywordsConfig = {
  presetKeywords: {
    'shampoo': ['洗髮精', '去屑', '頭皮護理', '深層清潔', '髮質改善'],
    'conditioner': ['潤髮乳', '護髮素', '修護', '滋潤', '柔順'],
    'hair_styling': ['造型', '髮蠟', '髮膠', '定型', '蓬鬆'],
    'hair_treatment': ['護髮', '修護', '營養', '強韌', '防斷'],
    'scalp_care': ['頭皮護理', '控油', '舒緩', '去角質', '保濕']
  },
  extractFields: ['title', 'subtitle', 'description', 'tags', 'collection', 'category']
}

export function generateProductKeywords(
  product: any,
  config: ProductKeywordsConfig = defaultKeywordConfig
): string[] {
  const extracted = config.extractFields.flatMap(field => {
    const value = product[field]
    return typeof value === 'string' ? 
      value.split(/[,，、\s]+/).filter(Boolean) : 
      Array.isArray(value) ? value.flat().filter(Boolean) : []
  })

  const preset = product.type ? 
    (config.presetKeywords[product.type] || []) : 
    []

  // 合併並去重，保持順序
  const keywordSet = new Set([...extracted, ...preset])
  const allKeywords = Array.from(keywordSet)
  
  // 過濾掉太短或無意義的關鍵字
  return allKeywords.filter(keyword => 
    keyword && 
    keyword.length > 1 && 
    !['的', '是', '在', '和', '與', 'and', 'or', 'the', 'a', 'an'].includes(keyword.toLowerCase())
  ).slice(0, 15) // 限制最多15個關鍵字
}

// 生成結構化資料 JSON-LD
export function generateStructuredData(
  pageData: any,
  seoMeta?: SanitySEOMeta,
  pageType: 'homepage' | 'product' | 'article' | 'page' = 'page'
): string | null {
  if (!seoMeta?.structuredDataType || seoMeta.structuredDataType === 'none') {
    if (seoMeta?.customJsonLd) {
      try {
        JSON.parse(seoMeta.customJsonLd) // 驗證 JSON 格式
        return seoMeta.customJsonLd
      } catch {
        console.error('無效的自訂 JSON-LD 格式')
        return null
      }
    }
    return null
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tims-hair-salon.com'
  const siteName = process.env.NEXT_PUBLIC_STORE_NAME || '我的商店'

  let structuredData: any = {
    '@context': 'https://schema.org'
  }

  switch (seoMeta.structuredDataType) {
    case 'article':
      structuredData = {
        ...structuredData,
        '@type': seoMeta.articleType === 'news' ? 'NewsArticle' : 
                 seoMeta.articleType === 'tech' ? 'TechArticle' : 'BlogPosting',
        headline: seoMeta.seoTitle || pageData.title,
        description: seoMeta.seoDescription,
        datePublished: pageData.publishedAt || new Date().toISOString(),
        dateModified: pageData.updatedAt || pageData.publishedAt || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: pageData.author?.name || '網站管理員'
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/favicon.ico`
          }
        }
      }
      
      if (seoMeta.ogImage) {
        structuredData.image = {
          '@type': 'ImageObject',
          url: seoMeta.ogImage.asset.url,
          alt: seoMeta.ogImage.alt
        }
      }
      break

    case 'product':
      structuredData = {
        ...structuredData,
        '@type': 'Product',
        name: seoMeta.seoTitle || pageData.title,
        description: seoMeta.seoDescription,
        brand: {
          '@type': 'Brand',
          name: siteName
        }
      }
      
      if (seoMeta.ogImage) {
        structuredData.image = seoMeta.ogImage.asset.url
      }
      
      if (pageData.price) {
        structuredData.offers = {
          '@type': 'Offer',
          price: pageData.price,
          priceCurrency: 'TWD',
          availability: 'https://schema.org/InStock'
        }
      }
      break

    case 'local_business':
      structuredData = {
        ...structuredData,
        '@type': 'LocalBusiness',
        name: siteName,
        description: seoMeta.seoDescription,
        url: baseUrl
      }
      break

    case 'breadcrumb':
      if (pageData.breadcrumbs) {
        structuredData = {
          ...structuredData,
          '@type': 'BreadcrumbList',
          itemListElement: pageData.breadcrumbs.map((crumb: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url
          }))
        }
      }
      break
  }

  return JSON.stringify(structuredData, null, 2)
}

type OGImage = {
  url: string
  alt?: string
}

export const getDefaultSEOSettings = async (): Promise<Metadata> => {
  try {
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || ''
    
    return {
      title: {
        absolute: storeName,
        template: storeName ? `%s | ${storeName}` : '%s',
      },
      icons: {
        icon: [{ url: '/favicon.ico' }],
        shortcut: [{ url: '/favicon.ico' }],
        apple: [{ url: '/favicon.ico' }],
      },
      openGraph: {
        type: "website",
        siteName: storeName,
        images: [
          {
            url: '/default-og-image.jpg',
            alt: storeName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        images: ['/default-twitter-image.jpg']
      },
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tims-hair-salon.com'),
    }
  } catch (error) {
    console.error('獲取 SEO 設定時發生錯誤:', error)
    return {
      title: '我的商店',
      description: undefined,
      icons: undefined,
    }
  }
}

export const mergeSEOMetadata = (
  metadata: Metadata, 
  defaultMetadata?: Metadata,
  sanityMeta?: SanitySEOMeta
): Metadata => {
  // 標題優先順序：metadata.title -> sanityMeta.seoTitle -> defaultMetadata.title
  const title = (metadata.title ? String(metadata.title) : null) 
    || sanityMeta?.seoTitle 
    || (defaultMetadata?.title ? String(defaultMetadata.title) : null)
    || undefined

  // 描述優先順序：metadata.description -> sanityMeta.seoDescription -> defaultMetadata.description
  const description = metadata.description 
    || sanityMeta?.seoDescription 
    || defaultMetadata?.description 
    || undefined

  // 合併關鍵字
  let keywords: string[] = []
  
  if (Array.isArray(metadata.keywords)) {
    keywords = [...keywords, ...metadata.keywords]
  }
  
  if (sanityMeta?.focusKeyword) {
    keywords.unshift(sanityMeta.focusKeyword) // 目標關鍵字放最前面
  }
  
  if (Array.isArray(sanityMeta?.seoKeywords)) {
    keywords = [...keywords, ...sanityMeta.seoKeywords]
  }
  
  if (Array.isArray(defaultMetadata?.keywords)) {
    keywords = [...keywords, ...defaultMetadata.keywords]
  }

  // 去除重複關鍵字
  keywords = Array.from(new Set(keywords)).filter(Boolean)

  // Open Graph 設定
  const ogTitle = sanityMeta?.ogTitle || (metadata.openGraph?.title as string) || title
  const ogDescription = sanityMeta?.ogDescription || metadata.openGraph?.description || description
  
  let ogImages: OGImage[] = []
  if (sanityMeta?.ogImage) {
    ogImages = [{
      url: sanityMeta.ogImage.asset.url,
      alt: sanityMeta.ogImage.alt
    }]
  } else if (metadata.openGraph?.images) {
    ogImages = Array.isArray(metadata.openGraph.images) 
      ? metadata.openGraph.images as OGImage[]
      : [metadata.openGraph.images as OGImage]
  } else if (defaultMetadata?.openGraph?.images) {
    ogImages = Array.isArray(defaultMetadata.openGraph.images)
      ? defaultMetadata.openGraph.images as OGImage[]
      : [defaultMetadata.openGraph.images as OGImage]
  }

  // Twitter 卡片設定
  const twitterCard = sanityMeta?.twitterCard || 'summary_large_image'

  // Robots 設定 - 符合 Google Search Essentials
  let robotsDirectives: string[] = []
  
  if (sanityMeta?.noIndex) {
    robotsDirectives.push('noindex')
  }
  
  if (sanityMeta?.noFollow) {
    robotsDirectives.push('nofollow')
  }
  
  const robots = robotsDirectives.length > 0 
    ? robotsDirectives.join(', ')
    : (metadata.robots || undefined)

  // 其他 meta 標籤
  const otherMeta: Record<string, string> = {
    ...(metadata.other as Record<string, string> || {}),
    ...(ogTitle ? { 'og:title': ogTitle } : {}),
    ...(ogDescription ? { 'og:description': ogDescription } : {}),
    ...(sanityMeta?.focusKeyword ? { 'focus-keyword': sanityMeta.focusKeyword } : {})
  }

  if (ogImages.length > 0) {
    otherMeta['og:image'] = ogImages[0].url
    if (ogImages[0].alt) {
      otherMeta['og:image:alt'] = ogImages[0].alt
    }
  }

  // 網站驗證和結構化資料可通過 other meta 添加
  if (sanityMeta?.canonicalUrl) {
    otherMeta['canonical'] = sanityMeta.canonicalUrl
  }

  const finalMetadata: Metadata = {
    ...defaultMetadata,
    ...metadata,
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tims-hair-salon.com'),
    alternates: {
      ...defaultMetadata?.alternates,
      ...metadata.alternates,
      canonical: sanityMeta?.canonicalUrl || metadata.alternates?.canonical
    },
    robots,
    openGraph: {
      ...defaultMetadata?.openGraph,
      ...metadata.openGraph,
      title: ogTitle,
      description: ogDescription,
      images: ogImages.length > 0 ? ogImages : undefined,
      url: sanityMeta?.canonicalUrl || metadata.openGraph?.url,
      siteName: process.env.NEXT_PUBLIC_STORE_NAME || defaultMetadata?.openGraph?.siteName
    },
    twitter: {
      ...defaultMetadata?.twitter,
      ...metadata.twitter,
      card: twitterCard,
      title: ogTitle,
      description: ogDescription,
      images: ogImages.length > 0 ? ogImages.map(img => img.url) : undefined
    },
    other: otherMeta
  }

  return finalMetadata
}

// 驗證 Core Web Vitals 的輔助函數
export function validateCoreWebVitals(metrics: {
  lcp?: number // Largest Contentful Paint (ms)
  inp?: number // Interaction to Next Paint (ms) 
  cls?: number // Cumulative Layout Shift
}) {
  const issues: string[] = []
  
  if (metrics.lcp && metrics.lcp > 2500) {
    issues.push(`LCP (${metrics.lcp}ms) 超過建議值 2.5 秒`)
  }
  
  if (metrics.inp && metrics.inp > 200) {
    issues.push(`INP (${metrics.inp}ms) 超過建議值 200ms`)
  }
  
  if (metrics.cls && metrics.cls > 0.1) {
    issues.push(`CLS (${metrics.cls}) 超過建議值 0.1`)
  }
  
  return {
    passed: issues.length === 0,
    issues
  }
}

// 生成 robots.txt 內容
export function generateRobotsTxt(options?: {
  sitemap?: string
  disallowPaths?: string[]
  allowPaths?: string[]
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tims-hair-salon.com'
  const disallow = options?.disallowPaths || ['/api/*', '/admin/*', '/_next/*', '/checkout/']
  const allow = options?.allowPaths || ['/']
  const sitemap = options?.sitemap || `${baseUrl}/sitemap.xml`

  return `User-agent: *
${allow.map(path => `Allow: ${path}`).join('\n')}
${disallow.map(path => `Disallow: ${path}`).join('\n')}

# 防止過度抓取
Crawl-delay: 1

Sitemap: ${sitemap}
`
}

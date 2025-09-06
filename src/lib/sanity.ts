import { createClient } from "@sanity/client"
import { requestDeduplicator } from "./request-deduplicator"
import type { Footer } from './types/footer'
import type { BlogPost, FeaturedProduct } from '../types/global'
import type { MainSection } from './types/page-sections'
import type { PageData } from './types/pages'
import type { Category } from '../types/sanity'
import type { ServiceCards } from './types/service-cards'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2022-03-25",
  useCdn: true,
  // 啟用 HTTP 快取
  requestTagPrefix: 'sanity',
  // 設定重試機制
  maxRetries: 3,
  retryDelay: (attemptNumber) => Math.min(300 * attemptNumber, 2000),
  // 移除無效的 token，只讀取公開數據
})

// Helper to handle AbortError / user-abort gracefully for sanity fetches
const isDev = process.env.NODE_ENV === 'development'
async function safeFetch<T = any>(query: string, params: any = {}, options: any = {}, fallback: T | null = null): Promise<any> {
  try {
    return await client.fetch(query, params, options)
  } catch (error: any) {
    const msg = String(error?.message || error)
    if (error?.name === 'AbortError' || msg.includes('The user aborted a request') || msg.includes('signal is aborted')) {
      if (isDev) console.warn('Sanity fetch aborted (handled):', msg)
      return fallback
    }
    throw error
  }
}

// 建立快取實例
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5分鐘
const MAX_CACHE_SIZE = 50 // 最大快取項目數

// 定期清理快取
let cleanupInterval: NodeJS.Timeout | null = null
if (typeof window === 'undefined') {
  // 僅在服務端設定清理
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    cache.forEach((entry, key) => {
      if (now - entry.timestamp > CACHE_TTL * 2) {
        cache.delete(key)
      }
    })
    
    // 如果快取太大，移除最舊的項目
    if (cache.size > MAX_CACHE_SIZE) {
      const entries: [string, any][] = []
      cache.forEach((entry, key) => {
        entries.push([key, entry])
      })
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const toRemove = entries.slice(0, cache.size - MAX_CACHE_SIZE)
      toRemove.forEach(([key]) => cache.delete(key))
    }
  }, 60000) // 每分鐘清理一次
}

// 快取包裝函數 - 優化版，加入去重功能
function withCache<T>(key: string, fn: () => Promise<T>, ttl: number = CACHE_TTL): Promise<T> {
  return requestDeduplicator.dedupe(key, async () => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }

    try {
      const data = await fn()
      cache.set(key, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      // 如果有快取資料但已過期，在錯誤時仍返回舊資料
      if (cached) {
        if (isDev) console.warn(`API 調用失敗，使用快取資料: ${key}`, error)
        return cached.data
      }
      throw error
    }
  })
}

export async function getHomepage_old(): Promise<{ title: string; mainSections: MainSection[] }> {
  const query = `*[_type == "homePage"][0] {
    title,
    mainSections
  }`
  
  const result: any = await safeFetch(query, {}, { 
    next: { revalidate: 300 } // 5 分鐘緩存
  }, null)
  
  // 過濾掉未知類型的 sections 並記錄警告
  if (result && result.mainSections) {
    result.mainSections = result.mainSections.filter((section: any) => {
      if (section?.isUnknownType) {
        if (isDev) console.warn("Unknown section type detected and filtered:", section._type)
        return false
      }
      return section?._type // 只保留有 _type 的 sections
    })
  }
  
  return result as { title: string; mainSections: MainSection[] }
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const query = `*[_type == "featuredProducts" && isActive == true]{
    title,
    handle,
    collection_id,
    description,
    isActive
  }`
  return (await safeFetch(query, {}, { 
    next: { revalidate: 300 } // 5 分鐘緩存
  }, [])) as FeaturedProduct[]
}

export async function getHeader() {
  const query = `*[_type == "header"][0]{
    logo{
      "url": asset->url,
      alt
    },
    storeName,
    logoHeight,
    logoSize{
      desktop,
      mobile
    },
    navigation[]{
      name,
      href
    },
    marquee {
      enabled,
      text1 {
        enabled,
        content
      },
    text2 {
      enabled,
      content
    },
    text3 {
      enabled,
      content
    },
    linkUrl,
    pauseOnHover
  }
}`
  return await safeFetch(query, {}, { 
    next: { revalidate: 300 } // 5 分鐘緩存
  }, null)
}

export async function getPageBySlug(slug: string): Promise<PageData | null> {
  try {
    const query = `*[_type == "pages" && slug.current == $slug][0]{
      _type,
      title,
      "slug": slug.current,
      isActive,
      seo {
        metaTitle,
        metaDescription,
        canonicalUrl
      },
      mainSections[] {
        _type,
        ...select(
          _type == "mainBanner" => {
            isActive,
            "slides": slides[] {
              heading,
              "backgroundImage": backgroundImage.asset->url,
              "backgroundImageAlt": backgroundImage.alt,
              buttonText,
              buttonLink
            },
            "settings": settings {
              autoplay,
              autoplaySpeed,
              showArrows,
              showDots
            }
          },
          _type == "imageTextBlock" => {
            isActive,
            heading,
            hideTitle,
            content,
            "image": image {
              "url": asset->url,
              "alt": alt
            },
            layout,
            "leftImage": leftImage {
              "url": asset->url,
              "alt": alt
            },
            "rightImage": rightImage {
              "url": asset->url,
              "alt": alt
            },
            leftContent,
            rightContent
          },
          _type == "featuredProducts" => {
            isActive,
            heading,
            showHeading,
            showSubheading,
            collection_id
          },
          _type == "blogSection" => {
            isActive,
            title,
            category,
            limit
          },
          _type == "youtubeSection" => {
            isActive,
            videoUrl,
            heading,
            description,
            fullWidth
          },
          _type == "contentSection" => {
            isActive,
            title,
            content[] {
              ...,
              // 如果內容區塊包含參考類型，也展開它們
              _type == "image" => {
                "url": asset->url,
                "altText": alt
              }
            }
          },
          _type == "serviceCardSection" => {
            isActive,
            heading,
            cardsPerRow,
            "cards": cards[] {
              title,
              englishTitle,
              "stylists": stylists[] {
                levelName,
                price,
                priceType,
                stylistName,
                isDefault,
                "cardImage": cardImage {
                  "url": asset->url,
                  "alt": alt
                }
              },
              link
            }
          },
          _type == "contactSection" => {
            isActive,
            title,
            address,
            phone,
            email,
            businessHours[]{
              days,
              hours
            },
            socialLinks[]{
              platform,
              url
            },
            googleMapsUrl
          }
        )
      }
    }`

  const page = await safeFetch(query, { slug }, {}, null)
  return page
  } catch (error) {
    if (isDev) console.error('獲取頁面資料失敗:', error)
    return null
  }
}

export async function getAllPosts(category?: string, limit: number = 50): Promise<BlogPost[]> {
  try {
    // 建立基本查詢
    const baseQuery = `*[_type == "post"`
    const categoryFilter = category ? ` && "${category}" in categories[]->title` : ""
    const query = `${baseQuery}${categoryFilter}] | order(publishedAt desc) [0...${limit}] {
      _id,
      _type,
      title,
      slug,
      mainImage {
        asset->{
          url
        }
      },
      publishedAt,
      excerpt,
      categories[]->{
        _id,
        title
      },
      author->{
        name,
        image
      },
      status,
      body // 添加內文欄位
    }`

  const posts = await safeFetch<BlogPost[]>(query, {}, { next: { revalidate: 300 } }, [])
  return posts || []
  } catch (error) {
    if (isDev) console.error('[getAllPosts] 從 Sanity 獲取部落格文章時發生錯誤:', error)
    return []
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const query = `*[_type == "category"] {
      _id,
      _type,
      title
    }`
    
  const categories = await safeFetch<Category[]>(query, {}, {}, [])
  return categories || []
  } catch (error) {
    if (isDev) console.error('[getCategories] 從 Sanity 獲取分類時發生錯誤:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {    
  // 先嘗試用slug.current查詢
  let query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug {
      current
    },
    publishedAt,
    body,
    "author": author->{name, bio, "image": image.asset->url},
    mainImage {
      asset-> {
        url
      }
    },
    "categories": categories[]->{title}
  }`
  
  let result = await safeFetch(query, { slug }, {}, null)
  
  // 如果用slug沒找到，嘗試根據標題匹配
  if (!result) {
    query = `*[_type == "post" && title match "*" + $title + "*" || _id match $slug + "*"][0]{
      _id,
      title,
      slug {
        current
      },
      publishedAt,
      body,
      "author": author->{name, bio, "image": image.asset->url},
      mainImage {
        asset-> {
          url
        }
      },
      "categories": categories[]->{title}
    }`
    
    // 嘗試從slug反推標題或使用ID
    const searchTerm = slug.includes('post-') ? slug.split('post-')[1] : slug.replace(/-/g, ' ')
    result = await safeFetch(query, { slug, title: searchTerm }, {}, null)
  }
  
  return result
}
export async function getAllPages(): Promise<PageData[]> {
  try {
    const query = `*[_type == "pages" && isActive == true] {
      _type,
      title,
      "slug": slug.current,
      isActive,
      seo {
        metaTitle,
        metaDescription,
        canonicalUrl
      },
      mainSections[] {
        _type,
        ...select(
          _type == "mainBanner" => {
            isActive,
            "slides": slides[] {
              heading,
              "backgroundImage": backgroundImage.asset->url,
              "backgroundImageAlt": backgroundImage.alt,
              buttonText,
              buttonLink
            },
            "settings": settings {
              autoplay,
              autoplaySpeed,
              showArrows,
              showDots
            }
          },
          _type == "imageTextBlock" => {
            isActive,
            heading,
            hideTitle,
            content,
            content,
            "image": image {
              "url": asset->url,
              "alt": alt
            },
            layout,
            "leftImage": leftImage {
              "url": asset->url,
              "alt": alt
            },
            "rightImage": rightImage {
              "url": asset->url,
              "alt": alt
            },
            leftContent,
            rightContent
          },
          _type == "featuredProducts" => {
            isActive,
            heading,
            showHeading,
            showSubheading,
            collection_id
          },
          _type == "blogSection" => {
            isActive,
            title,
            "category": category->title,
            limit,
            postsPerRow
          },
          _type == "youtubeSection" => {
            isActive,
            videoUrl,
            heading,
            description,
            fullWidth
          },
          _type == "contentSection" => {
            isActive,
            title,
            content[] {
              ...,
              _type == "image" => {
                "url": asset->url,
                "altText": alt
              }
            }
          },
          _type == "serviceCardSection" => {
            isActive,
            heading,
            cardsPerRow,
            "cards": cards[] {
              title,
              englishTitle,
              "stylists": stylists[] {
                levelName,
                price,
                priceType,
                stylistName,
                isDefault,
                "cardImage": cardImage {
                  "url": asset->url,
                  "alt": alt
                }
              },
              link
            }
          },
              link {
                text,
                url
              }
            }
          },
          _type == "contactSection" => {
            isActive,
            title,
            address,
            phone,
            email,
            businessHours[]{
              days,
              hours
            },
            socialLinks[]{
              platform,
              url
            },
            googleMapsUrl
          }
        )
      }
    }`

  const pages = await safeFetch<PageData[]>(query, {}, {}, [])
  return pages || []
  } catch (error) {
    console.error('[getAllPages] 從 Sanity 獲取頁面時發生錯誤:', error)
    return []
  }
}


export async function getHomepage(): Promise<{ title: string; mainSections: MainSection[] }> {
  if (isDev) console.log('🔍 Starting getHomepage request to Sanity...')
  
  const query = `*[_type == "homePage"][0] {
    title,
    "mainSections": mainSections[] {
      ...select(
        _type == "mainBanner" => {
          _type,
          isActive,
          "slides": slides[] {
            heading,
            "backgroundImage": backgroundImage.asset->url,
            "backgroundImageAlt": backgroundImage.alt,
            buttonText,
            buttonLink
          },
          "settings": settings {
            autoplay,
            autoplaySpeed,
            showArrows,
            showDots
          }
        },
        _type == "imageTextBlock" => {
          _type,
          isActive,
          heading,
          hideTitle,
          content,
          "image": image {
            "url": asset->url,
            "alt": alt
          },
          layout,
          "leftImage": leftImage {
            "url": asset->url,
            "alt": alt
          },
          "rightImage": rightImage {
            "url": asset->url,
            "alt": alt
          },
          leftContent,
          rightContent
        },
        _type == "featuredProducts" => {
          _type,
          heading,
          showHeading,
          showSubheading,
          collection_id,
          isActive
        },
        _type == "blogSection" => {
          _type,
          isActive,
          title,
          "category": category->title,
          limit,
          postsPerRow
        },
        _type == "youtubeSection" => {
          _type,
          isActive,
          heading,
          description,
          videoUrl,
          fullWidth
        },
        _type == "serviceCardSection" => {
          _type,
          isActive,
          heading,
          cardsPerRow,
          "cards": cards[] {
            title,
            englishTitle,
            "stylists": stylists[] {
              levelName,
              price,
              priceType,
              stylistName,
              isDefault,
              "cardImage": cardImage {
                "url": asset->url,
                "alt": alt
              }
            },
            link
          }
        },
        _type == "contentSection" => {
          _type,
          isActive,
          heading,
          "content": content[]{
            ...,
            markDefs[]{
              ...,
              _type == "internalLink" => {
                "slug": @.reference->slug.current
              }
            }
          }
        },
        // Default case - 包含 _type 以便識別未處理的 section 類型
        {
          _type,
          "isUnknownType": true
        }
      )
    }
  }`

  try {
    const result = await safeFetch(query, {}, { 
      next: { revalidate: 300 } // 5 分鐘緩存
    }, { title: '', mainSections: [] })
    
    if (isDev) console.log('✅ Sanity response received:', {
      hasResult: !!result,
      title: result?.title,
      sectionsCount: result?.mainSections?.length || 0,
      sections: result?.mainSections?.map((s: any) => ({ type: s._type, isActive: s.isActive })) || []
    })
    
    // 過濾掉未知類型的 sections 並記錄警告
    if (result?.mainSections) {
      result.mainSections = result.mainSections.filter((section: any) => {
        if (section?.isUnknownType) {
          if (isDev) console.warn("Unknown section type detected and filtered:", section._type)
          return false
        }
        return section?._type // 只保留有 _type 的 sections
      })
    }
    
    return result as { title: string; mainSections: MainSection[] }
  } catch (error) {
    if (isDev) console.error('❌ Error fetching homepage from Sanity:', error)
    return { title: '', mainSections: [] }
  }
}


export async function getServiceSection(): Promise<ServiceCards | null> {
  try {
    const query = `*[_type == "homePage"][0].mainSections[_type == "serviceCardSection" && isActive == true][0] {
      _type,
      isActive,
      heading,
      cardsPerRow,
      "cards": cards[] {
        title,
        englishTitle,
        "stylists": stylists[] {
          levelName,
          price,
          priceType,
          stylistName,
          isDefault,
          "cardImage": cardImage {
            "url": asset->url,
            "alt": alt
          }
        }
      }
    }`

  const result = await safeFetch(query, {}, {}, null)
    
    // 添加 _type 如果不存在
    if (result && !result._type) {
      result._type = "serviceCardSection"
    }
    
    if (isDev) console.log('[getServiceSection] 查詢結果:', result)
    return result || null
  } catch (error) {
    if (isDev) console.error('[getServiceSection] 從 Sanity 獲取服務區塊時發生錯誤:', error)
    return null
  }
}

export async function getFooter(): Promise<Footer | null> {
  // 只獲取已發布的最新頁尾版本
  const query = `*[_type == "footer" && !(_id in path('drafts.**'))] | order(_updatedAt desc)[0] {
    title,
    logo {
      "url": asset->url,
      alt
    },
    logoWidth,
    contactInfo {
      phone,
      email,
      address
    },
    sections[] {
      title,
      links[] {
        text,
        url
      },
      customInfo {
        phone,
        email,
        text
      }
    },
    socialMedia {
      facebook {
        enabled,
        url
      },
      instagram {
        enabled,
        url
      },
      line {
        enabled,
        url
      },
      youtube {
        enabled,
        url
      },
      twitter {
        enabled,
        url
      }
    },
    copyright
  }`
  
  return await safeFetch(query, {}, {}, null)
}

export async function getAllFooters(): Promise<Footer[]> {
  // 獲取所有已發布的頁尾版本
  const query = `*[_type == "footer" && !(_id in path('drafts.**'))] | order(_updatedAt desc) {
    title,
    _id,
    _updatedAt,
    _createdAt
  }`
  
  return await safeFetch(query, {}, {}, [])
}

export { client }
export default client

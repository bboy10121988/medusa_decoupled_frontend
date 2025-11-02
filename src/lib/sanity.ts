import { createClient } from "@sanity/client"
import type { Footer } from './types/footer'
import type { BlogPost, FeaturedProduct } from '../types/global'
import type { MainSection } from './types/page-sections'
import type { PageData } from './types/pages'
import type { Category } from '../types/sanity'
import type { ServiceCards } from './types/service-cards'

// 確保環境變數有值
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

if (!projectId || !dataset) {
  throw new Error('Missing required Sanity environment variables: NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET')
}

const clientConfig: any = {
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2022-03-25",
  useCdn: true,
  // 啟用 HTTP 快取
  requestTagPrefix: 'sanity',
  // 設定重試機制
  maxRetries: 3,
  retryDelay: (attemptNumber: number) => Math.min(300 * attemptNumber, 2000),
}

// 只有在 token 存在時才添加
if (process.env.SANITY_API_TOKEN) {
  clientConfig.token = process.env.SANITY_API_TOKEN
}

const client = createClient(clientConfig)

// Helper to handle AbortError / user-abort gracefully for sanity fetches
async function safeFetch<T = any>(query: string, params: any = {}, options: any = {}, fallback: T | null = null): Promise<any> {
  try {
    if (!projectId) {
      // console.error("Missing Sanity Project ID in environment variables")
      return fallback
    }
    
    // 增加超時設定
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超時
    
    const mergedOptions = {
      ...options,
      signal: controller.signal,
    }
    
    const result = await client.fetch(query, params, mergedOptions)
    clearTimeout(timeoutId)
    return result
  } catch (error: any) {
    const msg = String(error?.message || error)
    // console.error("Sanity fetch error:", msg, "\nQuery:", query)
    
    if (error?.name === 'AbortError' || msg.includes('abort') || msg.includes('timeout')) {
      // if (isDev) console.warn('Sanity fetch aborted/timed out:', msg)
      return fallback
    }
    
    // if (isDev) console.error('Sanity fetch error details:', error)
    return fallback // 在生產環境中總是返回備用值，避免應用崩潰
  }
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
  if (result?.mainSections) {
    result.mainSections = result.mainSections.filter((section: any) => {
      if (section?.isUnknownType) {
        // if (isDev) console.warn("Unknown section type detected and filtered:", section._type)
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

// 從首頁的 featuredProducts 區塊獲取標題配置
export async function getFeaturedProductsHeading(collectionId: string) {
  const query = `*[_type == "homePage"][0]{
    "featuredSection": mainSections[_type == "featuredProducts" && collection_id == $collectionId][0]{
      heading,
      showHeading
    }
  }.featuredSection`
  return await safeFetch(query, { collectionId }, { 
    next: { revalidate: 300 }
  }, null)
}

export async function getHeader() {
  const query = `*[_type == "header"][0]{
    logo{
      "url": asset->url,
      alt
    },
    favicon{
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
    // 動態頁面使用 dynamicPage type,狀態為 published
    const query = `*[_type == "dynamicPage" && slug.current == $slug && status == "published"][0]{
      _type,
      title,
      "slug": slug.current,
      seo {
        metaTitle,
        metaDescription,
        canonicalUrl
      },
      "mainSections": pageContent[] {
        _type,
        ...select(
          _type == "mainBanner" => {
            isActive,
            "slides": slides[] {
              heading,
              subheading,
              "desktopImage": desktopImage.asset->url,
              "desktopImageAlt": desktopImage.alt,
              "mobileImage": mobileImage.asset->url,
              "mobileImageAlt": mobileImage.alt,
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
              "alt": alt,
              "linkUrl": linkUrl
            },
            layout,
            "leftImage": leftImage {
              "url": asset->url,
              "alt": alt,
              "linkUrl": linkUrl
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
            fullWidth,
            videoMode,
            "youtubeSettings": youtubeSettings {
              desktopVideoUrl,
              mobileVideoUrl,
              useSameVideo,
              autoplay,
              loop,
              muted,
              showControls
            },
            "uploadSettings": uploadSettings {
              "desktopVideo": desktopVideo {
                "asset": asset-> {
                  _id,
                  url,
                  originalFilename,
                  mimeType
                }
              },
              "mobileVideo": mobileVideo {
                "asset": asset-> {
                  _id,
                  url,
                  originalFilename,
                  mimeType
                }
              },
              useSameVideo,
              autoplay,
              loop,
              muted,
              showControls
            },
            "videoSettings": videoSettings {
              desktopVideoUrl,
              mobileVideoUrl,
              useSameVideo
            }
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
          },
          _type == "googleMapsSection" => {
            isActive,
            heading,
            description,
            googleMapsUrl,
            mapHeight,
            showDirections
          },
          _type == "textBlock" => {
            title,
            content[] {
              ...,
              _type == "image" => {
                "url": asset->url,
                "altText": alt
              }
            }
          },
          _type == "imageBlock" => {
            title,
            "image": image {
              "url": asset->url,
              "alt": alt
            },
            alt,
            caption,
            layout
          },
          _type == "videoBlock" => {
            title,
            videoUrl,
            "thumbnail": thumbnail {
              "url": asset->url
            },
            description
          },
          _type == "ctaBlock" => {
            title,
            buttonText,
            buttonUrl,
            buttonStyle,
            alignment
          }
        )
      }
    }`

    return await safeFetch(query, { slug }, {}, null)
  } catch (error) {
    // if (isDev) console.error('獲取頁面資料失敗:', error)
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
    // if (isDev) console.error('[getAllPosts] 從 Sanity 獲取部落格文章時發生錯誤:', error)
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
    // if (isDev) console.error('[getCategories] 從 Sanity 獲取分類時發生錯誤:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // console.log(`🔍 [getPostBySlug] 正在查詢文章: ${slug}`)
    
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
    
    if (result) {
      // console.log(`✅ [getPostBySlug] 找到文章: ${result.title}`)
      return result
    }
    
    // 如果用slug沒找到，嘗試根據標題匹配
    // console.log(`⚠️ [getPostBySlug] 使用 slug 沒找到，嘗試標題匹配: ${slug}`)
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
    
    if (result) {
      // console.log(`✅ [getPostBySlug] 透過標題匹配找到文章: ${result.title}`)
    } else {
      // console.log(`❌ [getPostBySlug] 找不到文章: ${slug}`)
    }
    
    return result
  } catch (error) {
    // console.error(`❌ [getPostBySlug] 查詢文章時發生錯誤: ${slug}`, error)
    return null
  }
}
export async function getAllPages(): Promise<PageData[]> {
  try {
    // 使用 dynamicPage type,狀態為 published
    const query = `*[_type == "dynamicPage" && status == "published"] | order(_createdAt desc) {
      _type,
      title,
      "slug": slug.current,
      status,
      seo {
        metaTitle,
        metaDescription,
        canonicalUrl
      },
      "mainSections": pageContent[] {
        _type,
        ...select(
          _type == "mainBanner" => {
            isActive,
            "slides": slides[] {
              heading,
              subheading,
              "desktopImage": desktopImage.asset->url,
              "desktopImageAlt": desktopImage.alt,
              "mobileImage": mobileImage.asset->url,
              "mobileImageAlt": mobileImage.alt,
              imageLink
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
              "alt": alt,
              "linkUrl": linkUrl
            },
            layout,
            "leftImage": leftImage {
              "url": asset->url,
              "alt": alt,
              "linkUrl": linkUrl
            },
            "rightImage": rightImage {
              "url": asset->url,
              "alt": alt,
              "linkUrl": linkUrl
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
            fullWidth,
            videoMode,
            "youtubeSettings": youtubeSettings {
              desktopVideoUrl,
              mobileVideoUrl,
              useSameVideo,
              autoplay,
              loop,
              muted,
              muted,
              showControls
            },
            "uploadSettings": uploadSettings {
              "desktopVideo": desktopVideo {
                "asset": asset-> {
                  _id,
                  url,
                  originalFilename,
                  mimeType
                }
              },
              "mobileVideo": mobileVideo {
                "asset": asset-> {
                  _id,
                  url,
                  originalFilename,
                  mimeType
                }
              },
              useSameVideo,
              autoplay,
              loop,
              muted,
              showControls
            },
            // 向後兼容
            "videoSettings": videoSettings {
              desktopVideoUrl,
              mobileVideoUrl,
              useSameVideo
            }
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
    // console.error('[getAllPages] 從 Sanity 獲取頁面時發生錯誤:', error)
    return []
  }
}


export async function getHomepage(): Promise<{ 
  title: string; 
  mainSections: MainSection[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: { asset: { url: string }; alt: string };
  twitterCard?: string;
}> {
  // if (isDev) console.log('🔍 Starting getHomepage request to Sanity...')
  
  const query = `*[_type == "homePage"][0] {
    title,
    seoTitle,
    seoDescription,
    seoKeywords,
    canonicalUrl,
    noIndex,
    noFollow,
    ogTitle,
    ogDescription,
    "ogImage": ogImage {
      "asset": asset->{url},
      alt
    },
    twitterCard,
    "mainSections": mainSections[] {
      ...select(
        _type == "mainBanner" => {
          _type,
          isActive,
          "slides": slides[] {
            heading,
            subheading,
            "desktopImage": desktopImage.asset->url,
            "desktopImageAlt": desktopImage.alt,
            "mobileImage": mobileImage.asset->url,
            "mobileImageAlt": mobileImage.alt,
            imageLink
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
            "alt": alt,
            "linkUrl": linkUrl
          },
          layout,
          "leftImage": leftImage {
            "url": asset->url,
            "alt": alt,
            "linkUrl": linkUrl
          },
          "rightImage": rightImage {
            "url": asset->url,
            "alt": alt,
            "linkUrl": linkUrl
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
          fullWidth,
          videoMode,
          "youtubeSettings": youtubeSettings {
            desktopVideoUrl,
            mobileVideoUrl,
            useSameVideo,
            autoplay,
            loop,
              muted,
            muted,
            showControls
          },
          "uploadSettings": uploadSettings {
            "desktopVideo": desktopVideo {
              "asset": asset-> {
                _id,
                url,
                originalFilename,
                mimeType
              }
            },
            "mobileVideo": mobileVideo {
              "asset": asset-> {
                _id,
                url,
                originalFilename,
                mimeType
              }
            },
            useSameVideo,
            autoplay,
            loop,
              muted,
            muted,
            showControls
          },
          // 向後兼容
          "videoSettings": videoSettings {
            desktopVideoUrl,
            mobileVideoUrl,
            useSameVideo
          }
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
        _type == "googleMapsSection" => {
          _type,
          isActive,
          heading,
          description,
          googleMapsUrl,
          mapHeight,
          businessName,
          telephone,
          streetAddress,
          addressLocality,
          addressRegion,
          postalCode,
          latitude,
          longitude,
          priceRange,
          "openingHours": openingHours[] {
            days,
            opens,
            closes
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
    
    // if (isDev) console.log('✅ Sanity response received:', {
      // hasResult: !!result,
      // title: result?.title,
      // sectionsCount: result?.mainSections?.length || 0,
      // sections: result?.mainSections?.map((s: any) => ({ type: s._type, isActive: s.isActive })) || []
    // })
    
    // 過濾掉未知類型的 sections 並記錄警告
    if (result?.mainSections) {
      result.mainSections = result.mainSections.filter((section: any) => {
        if (section?.isUnknownType) {
          // if (isDev) console.warn("Unknown section type detected and filtered:", section._type)
          return false
        }
        return section?._type // 只保留有 _type 的 sections
      })
    }
    
    return result as { title: string; mainSections: MainSection[] }
  } catch (error) {
    // if (isDev) console.error('❌ Error fetching homepage from Sanity:', error)
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
    
    // if (isDev) console.log('[getServiceSection] 查詢結果:', result)
    return result || null
  } catch (error) {
    // if (isDev) console.error('[getServiceSection] 從 Sanity 獲取服務區塊時發生錯誤:', error)
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
    sections[] {
      title,
      links[] {
        text,
        linkType,
        internalLink,
        externalUrl,
        // 處理各種可能的 URL 形式
        // 1. 如果有指定 linkType，根據類型使用對應的 URL
        // 2. 如果沒有指定類型，但有 url 字段，使用該字段
        // 3. 為了向後兼容，最後檢查是否有 href 字段
        // 4. 現在支援 tel: 和 mailto: 等協議
        "url": coalesce(
          select(
            linkType == "internal" => internalLink,
            linkType == "external" => externalUrl,
            url
          ),
          url,
          href
        )
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

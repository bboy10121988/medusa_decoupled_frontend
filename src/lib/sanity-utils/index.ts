import { createClient } from 'next-sanity'
import { PAGE_SECTIONS_PROJECTION } from '../sanity-queries'
import { BlogPostType, CategoryType } from './types'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
  apiVersion: "2024-01-01",
  useCdn: true,
  perspective: 'published',
  stega: {
    enabled: false
  }
})

// 預設語言
const DEFAULT_LANGUAGE = 'zh-TW'

/**
 * 將 countryCode 轉換為 Sanity language code
 */
export function mapCountryToLanguage(countryCode: string): string {
  switch (countryCode?.toLowerCase()) {
    case 'tw':
      return 'zh-TW'
    case 'jp':
      return 'ja-JP'
    case 'us':
    case 'my':
    case 'sg':
    case 'au':
    default:
      return 'en'
  }
}

export async function getAllPosts(category?: string, limit: number = 50, language?: string): Promise<BlogPostType[]> {
  try {
    const lang = language || DEFAULT_LANGUAGE
    // 建立基本查詢 - 加入語言過濾
    const baseQuery = `*[_type == "post" && language == $lang`
    const categoryFilter = category ? ` && "${category}" in categories[]->title` : ""
    const query = `${baseQuery}${categoryFilter}] | order(publishedAt desc) [0...${limit}] {
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
      _id,
      language
    }`

    const posts = await client.fetch<BlogPostType[]>(query, { lang })
    return posts || []
  } catch (error) {
    // console.error('[getAllPosts] 從 Sanity 獲取部落格文章時發生錯誤:', error)
    return []
  }
}

export async function getCategories(language?: string): Promise<CategoryType[]> {
  try {
    const lang = language || DEFAULT_LANGUAGE
    const query = `*[_type == "category" && language == $lang] {
      _id,
      title
    }`

    const categories = await client.fetch<CategoryType[]>(query, { lang })
    return categories || []
  } catch (error) {
    // console.error('[getCategories] 從 Sanity 獲取分類時發生錯誤:', error)
    return []
  }
}

// 添加 getFooter 導出
export async function getFooter(language?: string) {
  const query = `*[_type == "footer" && language == $lang][0] {
    _id,
    sections[]{
      title,
      links[]{
        text,
        linkType,
        internalLink,
        externalUrl,
        "url": coalesce(
          select(
            linkType == "internal" => internalLink,
            linkType == "external" => externalUrl
          ),
          internalLink, 
          externalUrl
        )
      }
    },
    logo {
      alt,
      "url": asset->url
    },
    logoWidth,
    socialMedia {
      facebook { enabled, url },
      instagram { enabled, url },
      line { enabled, url },
      youtube { enabled, url },
      twitter { enabled, url }
    },
    copyright
  }`

  // Fallback chain: requested lang -> 'zh-TW' (default)
  // We prioritize default language as fallback if specific language is missing
  const fallbackChain = [language || DEFAULT_LANGUAGE, 'zh-TW']
  // Filter duplicates
  const uniqueChain = Array.from(new Set(fallbackChain))

  for (const lang of uniqueChain) {
    try {
      const result = await client.fetch(query, { lang })
      if (result) {
        return result
      }
    } catch (error) {
      // console.error(`[getFooter] Error fetching footer for ${lang}:`, error)
    }
  }

  return null
}

// 添加 getHeader 導出  
export async function getHeader(language?: string) {
  const headerQuery = `*[_type == "header" && language == $lang][0] {
    _id,
    navigation[]{
      name,
      href,
      submenu[]{
        name,
        href
      }
    },
    logo {
      alt,
      "url": asset->url
    },
    favicon {
      alt,
      "url": asset->url
    },
    storeName,
    logoHeight,
    logoSize {
      desktop,
      mobile
    },
    announcement {
      enabled,
      text,
      url
    },
    marquee
  }`

  // Fallback chain: requested lang -> 'en' -> 'zh-TW'
  const fallbackChain = [language || DEFAULT_LANGUAGE, 'en', 'zh-TW']

  for (const lang of fallbackChain) {
    try {
      const result = await client.fetch(headerQuery, { lang })
      if (result && result.storeName) {
        return result
      }
    } catch (error) {
      // console.error(`[getHeader] Error fetching header for ${lang}:`, error)
    }
  }

  return null
}

// 新增：獲取商品內容
export async function getProduct(handle: string, language?: string) {
  try {
    const lang = language || DEFAULT_LANGUAGE
    const query = `*[_type == "product" && slug.current == $handle && language == $lang][0] {
      _id,
      title,
      slug,
      description,
      body,
      images[]{
        asset->{
          url
        }
      },
      medusaId,
      language
    }`

    return await client.fetch(query, { handle, lang })
  } catch (error) {
    // console.error('[getProduct] 從 Sanity 獲取商品資料時發生錯誤:', error)
    return null
  }
}

// 新增：獲取首頁內容
export async function getHomePage(language?: string) {
  try {
    const lang = language || DEFAULT_LANGUAGE
    const query = `*[_type == "homePage" && language == $lang][0] {
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
        ${PAGE_SECTIONS_PROJECTION}
      }
    }`

    return await client.fetch(query, { lang })
  } catch (error) {
    // console.error('[getHomePage] 從 Sanity 獲取首頁資料時發生錯誤:', error)
    return null
  }
}

// 新增：獲取動態頁面
export async function getDynamicPage(slug: string, language?: string) {
  try {
    const lang = language || DEFAULT_LANGUAGE
    const query = `*[_type == "dynamicPage" && slug.current == $slug && language == $lang][0]`

    return await client.fetch(query, { slug, lang })
  } catch (error) {
    // console.error('[getDynamicPage] 從 Sanity 獲取動態頁面資料時發生錯誤:', error)
    return null
  }
}

// 新增：批量獲取商品內容
export async function getProductsByHandles(handles: string[], language?: string) {
  try {
    const lang = language || DEFAULT_LANGUAGE
    const query = `*[_type == "product" && slug.current in $handles && language == $lang] {
      _id,
      title,
      slug,
      description,
      body,
      images[]{
        asset->{
          url
        },
        alt
      },
      medusaId,
      language
    }`

    return await client.fetch(query, { handles, lang })
  } catch (error) {
    // console.error('[getProductsByHandles] 從 Sanity 批量獲取商品資料時發生錯誤:', error)
    return []
  }
}

import { createClient } from "@sanity/client"
import type { FeaturedProduct, BlogPost, Category } from './types/sanity'
import type { MainSection } from './types/page-sections'
import type { PageData } from './types/pages'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
  // Never hardcode tokens in source; if needed for server-side, read from env
  token: process.env.SANITY_READ_TOKEN,
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

// Base query fragments
const mainBannerFragment = `
  _type == "mainBanner" => {
    isActive,
    "slides": slides[] {
      heading,

      "backgroundImage": backgroundImage.asset->url,
      buttonText,
      buttonLink
    },
    "settings": settings {
      autoplay,
      autoplaySpeed,
      showArrows,
      showDots
    }
  }
`

const imageTextBlockFragment = `
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
  }
`

const featuredProductsFragment = `
  _type == "featuredProducts" => {
    heading,
    showHeading,
    showSubheading,
    collection_id,
    isActive
  }
`

const youtubeSectionFragment = `
  _type == "youtubeSection" => {
    isActive,
    videoUrl,
    heading,
    description,
    fullWidth
  }
`

const serviceCardSectionFragment = `
  _type == "serviceCardSection" => {
    isActive,
    heading,
    cardsPerRow,
    "cards": cards[]-> {
      title,
      englishTitle,
      description,
      mainPrice,
      priceLabel,
      "cardImage": cardImage {
        "url": asset->url,
        "alt": alt,
        "caption": caption
      },
      link
    }
  }
`

const contentSectionFragment = `
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
  }
`

const contactSectionFragment = `
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
`

export async function getHomeBanners() {
  const query = `*[_type == "homePage"][0]{
    "mainSections": mainSections[] {
      _type,
      ...select(
        ${mainBannerFragment},
        ${imageTextBlockFragment},
        ${featuredProductsFragment},
        ${youtubeSectionFragment},
        ${serviceCardSectionFragment}
      )
    }
  }`

  const result: any = await safeFetch(query, {}, {}, null)
  return result as { mainSections: MainSection[] }
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const query = `*[_type == "featuredProducts" && isActive == true]{
    title,
    handle,
    collection_id,
    description,
    isActive
  }`
  return (await safeFetch(query, {}, {}, [])) as FeaturedProduct[]
}

export async function getHeader() {
  const query = `*[_type == "header"][0]{
    logo{
      "url": asset->url,
      alt
    },
    storeName,
    navigation[]{
      name,
      href
    }
  }`
  return await safeFetch(query, {}, {}, null)
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
          ${mainBannerFragment},
          ${imageTextBlockFragment},
          ${featuredProductsFragment},
          ${serviceCardSectionFragment},
          ${contentSectionFragment},
          ${contactSectionFragment}
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
      body
    }`

  const posts = await safeFetch(query, {}, {}, [])
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
    
  const categories = await safeFetch(query, {}, {}, [])
  return categories || []
  } catch (error) {
    if (isDev) console.error('[getCategories] 從 Sanity 獲取分類時發生錯誤:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    publishedAt,
    body,
    "author": author->{name, bio, "image": image.asset->url},
    "mainImage": mainImage.asset->url,
    "categories": categories[]->{title}
  }`
  
  return await safeFetch(query, { slug }, {}, null)
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
          ${mainBannerFragment},
          ${imageTextBlockFragment},
          ${featuredProductsFragment},
          ${serviceCardSectionFragment},
          ${contentSectionFragment},
          ${contactSectionFragment}
        )
      }
    }`

  const pages = await safeFetch<PageData[]>(query, {}, {}, [])
  return pages || []
  } catch (error) {
    if (isDev) console.error('[getAllPages] 從 Sanity 獲取頁面時發生錯誤:', error)
    return []
  }
}

export default client

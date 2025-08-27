import { createClient } from "@sanity/client"
import type { FeaturedProduct, BlogPost, Category } from './types/sanity'
import type { MainSection } from './types/page-sections'
import type { PageData } from './types/pages'

const client = createClient({
  projectId: "m7o2mv1n",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  token: "skxPHbtETeuof6qw2oYMoST8kD2UCmM1UTWEjAqw03YETyws2ZhLtUlUGoPieCQQ9Y4SkaoLWXHZ8mOs34ZUmqFMPnr7tnoqY1HuLVnMTwZ0SVhDV2mOuk336ICH1h7JuzUnEyyYOiJljwvERUlw7GEelitairKw8gRMHs8HABPpZZT1TWzZ"
})

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

  const result = await client.fetch(query)
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
  return client.fetch(query)
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
  return client.fetch(query)
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

    const page = await client.fetch(query, { slug })
    return page
  } catch (error) {
    console.error('獲取頁面資料失敗:', error)
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

    const posts = await client.fetch<BlogPost[]>(query)
    return posts || []
  } catch (error) {
    console.error('[getAllPosts] 從 Sanity 獲取部落格文章時發生錯誤:', error)
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
    
    const categories = await client.fetch<Category[]>(query)
    return categories || []
  } catch (error) {
    console.error('[getCategories] 從 Sanity 獲取分類時發生錯誤:', error)
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
  
  return client.fetch(query, { slug })
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

    const pages = await client.fetch<PageData[]>(query)
    return pages || []
  } catch (error) {
    console.error('[getAllPages] 從 Sanity 獲取頁面時發生錯誤:', error)
    return []
  }
}

export default client

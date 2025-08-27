import { StorePrice } from "@medusajs/types"

export type FeaturedProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string
}

export type VariantPrice = {
  calculated_price_number: number
  calculated_price: string
  original_price_number: number
  original_price: string
  currency_code: string
  price_type: string
  percentage_diff: string
}

export type StoreFreeShippingPrice = StorePrice & {
  target_reached: boolean
  target_remaining: number
  remaining_percentage: number
}

export type SanityHeader = {
  logo?: {
    url: string
    alt: string
  }
  storeName?: string
  logoHeight?: number // 向後兼容的舊欄位
  logoSize?: {
    desktop?: number
    mobile?: number
  }
  navigation?: {
    name: string
    href: string
  }[]
  marquee?: {
    enabled?: boolean
    text1?: {
      enabled?: boolean
      content?: string
    }
    text2?: {
      enabled?: boolean
      content?: string
    }
    text3?: {
      enabled?: boolean
      content?: string
    }
    linkUrl?: string
  pauseOnHover?: boolean
  }
}

export type SeoMeta = {
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  canonicalUrl?: string
  noIndex?: boolean
  ogTitle?: string
  ogDescription?: string
  ogImage?: {
    asset?: {
      url: string
    }
    alt?: string
    hotspot?: {
      x: number
      y: number
      height: number
      width: number
    }
  }
}

export type BlogPost = {
  _id: string
  _type: string
  title: string
  slug: string
  publishedAt: string
  body: any
  author: {
    name: string
    bio?: string
    image?: string
  }
  mainImage?: string
  categories?: Array<{
    title: string
  }>
}

// 添加 Cart 類型以修復 cart-context 錯誤
export interface Cart {
  id: string
  items: any[]
  total: number
  // 根據需要添加更多字段
}

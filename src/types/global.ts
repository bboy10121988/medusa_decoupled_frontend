// 全域型別定義
import { HttpTypes } from '@medusajs/types'

// Sanity 相關型別
export interface FeaturedProduct {
  id: string
  title: string
  handle: string
  thumbnail?: string
  price?: number
  currency_code?: string
}

export interface BlogPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  publishedAt: string
  _createdAt: string
  mainImage?: {
    asset: {
      url: string
    }
  }
  categories?: Array<{
    title: string
  }>
  body?: any[]
  status?: string
}

// Cart 型別
export interface Cart {
  id: string
  items: CartItem[]
  region?: HttpTypes.StoreRegion
  total: number
  subtotal: number
  tax_total?: number
  shipping_total?: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  title: string
  description?: string
  quantity: number
  unit_price: number
  total: number
  variant?: {
    id: string
    title: string
    sku?: string
  }
  thumbnail?: string
}

// 產品型別擴展
export interface ProductExtended {
  collection_id?: string
  tags?: HttpTypes.StoreProductTag[]
}

// 產品查詢參數擴展
export interface StoreProductParamsExtended extends HttpTypes.StoreProductParams {
  collection_id?: string[]
  tag_id?: string[]  // 修正為 string[] 類型
  is_giftcard?: boolean
  id?: string[]
}

// 地區轉換函數
export interface Region {
  id: string
  name: string
  currency_code: string
  countries: Array<{
    id: string
    iso_2: string
    display_name: string
  }>
}

// Sanity Header 型別
export interface SanityHeader {
  _id: string
  title?: string
  navigation?: NavigationItem[]
  logo?: SanityImage
  showSearch?: boolean
  storeName?: string
  logoWidth?: number
  logoHeight?: number
  logoSize?: {
    desktop?: number
    mobile?: number
  }
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

export interface NavigationItem {
  _key: string
  title: string
  name: string
  url?: string
  href: string
  submenu?: NavigationItem[]
}

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  hotspot?: any
  crop?: any
  url?: string
}

// 價格相關型別
export interface VariantPrice {
  currency_code: string
  amount: number
  calculated_amount?: number
  original_amount?: number
  calculated_price?: string
  original_price?: string
  calculated_price_number?: number
  original_price_number?: number
  price_type?: 'sale' | 'regular'
  percentage_diff?: string
}

export interface StoreFreeShippingPrice {
  amount: number
  currency_code: string
  target_reached?: boolean
  target_remaining?: number
  remaining_percentage?: number
}

// Footer 型別
export interface Footer {
  _id: string
  title?: string
  sections?: FooterSection[]
  contactInfo?: ContactInfo
  social?: SocialLink[]
  copyright?: string
}

export interface FooterSection {
  _key: string
  title: string
  links: FooterLink[]
}

export interface FooterLink {
  _key: string
  title: string
  url: string
}

export interface ContactInfo {
  phone?: string
  email?: string
  address?: string
}

export interface SocialLink {
  _key: string
  platform: string
  url: string
}
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
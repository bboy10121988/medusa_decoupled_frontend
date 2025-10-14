/**
 * Medusa 型別定義
 * 擴展和補充 @medusajs/types 的缺失型別定義
 */

import type { 
  StoreCart,
  StoreShippingOption,
  StoreProduct,
  StoreRegion,
  StoreCustomer,
  StoreOrder
} from "@medusajs/types"

declare module "@medusajs/types" {
  // 擴展 StoreCartShippingOption 缺失的屬性
  interface StoreCartShippingOption {
    service_zone?: {
      id: string
      name: string
      fulfillment_set_id: string
      type: string
      geo_zones: any[]
    }
    service_zone_id?: string
  }

  // 擴展 StoreCart 補充可能未定義的屬性
  interface StoreCart {
    shipping_methods?: StoreCartShippingOption[]
  }

  // 補充可能缺失的 Store 類型
  interface StoreShippingMethod {
    id: string
    name: string
    amount: number
    data?: Record<string, any>
    shipping_option?: StoreShippingOption
  }

  // 擴展 StoreProduct 補充 Sanity 整合屬性
  interface StoreProduct {
    sanity_product_id?: string
    description?: string
    thumbnail?: string
    collection_id?: string
    tag_id?: string[]
    is_giftcard?: boolean
    images?: Array<{
      id: string
      url: string
    }>
  }

  // 產品查詢參數類型
  interface StoreProductParams {
    collection_id?: string[]
    tag_id?: string[]
    is_giftcard?: boolean
  }

  // 價格相關類型
  interface VariantPrice {
    amount: number
    calculated_price?: string
    calculated_price_number?: number
    original_price?: string
    original_price_number?: number
    currency_code?: string
    price_type?: 'sale' | 'regular'
    percentage_diff?: string
  }

  // 免運費相關類型
  interface StoreFreeShippingPrice {
    target_reached?: boolean
    target_remaining?: number
    remaining_percentage?: number
  }

  // Collection 類型擴展
  interface StoreCollection {
    deleted_at?: string | null
  }

  // 補充 Store API 回應格式
  interface StoreResponse<T> {
    data: T
    message?: string
    status?: number
  }

  // 購物車相關補充型別
  interface StoreCartLineItem {
    id: string
    title: string
    description?: string
    thumbnail?: string
    quantity: number
    unit_price: number
    total: number
    variant?: {
      id: string
      title: string
      product: StoreProduct
    }
  }

  // 結帳相關補充型別  
  interface StoreCheckoutSession {
    id: string
    cart_id: string
    payment_status: string
    fulfillment_status: string
  }
}

// 全域 Medusa 客戶端型別
declare global {
  interface MedusaClient {
    regions: {
      list(): Promise<{ regions: StoreRegion[] }>
      retrieve(id: string): Promise<{ region: StoreRegion }>
    }
    carts: {
      create(data: any): Promise<{ cart: StoreCart }>
      retrieve(id: string): Promise<{ cart: StoreCart }>
      update(id: string, data: any): Promise<{ cart: StoreCart }>
      addLineItem(id: string, data: any): Promise<{ cart: StoreCart }>
      updateLineItem(cartId: string, lineId: string, data: any): Promise<{ cart: StoreCart }>
      deleteLineItem(cartId: string, lineId: string): Promise<{ cart: StoreCart }>
    }
    products: {
      list(params?: any): Promise<{ products: StoreProduct[] }>
      retrieve(id: string): Promise<{ product: StoreProduct }>
    }
    customers: {
      create(data: any): Promise<{ customer: StoreCustomer }>
      retrieve(): Promise<{ customer: StoreCustomer }>
      update(data: any): Promise<{ customer: StoreCustomer }>
    }
    orders: {
      list(): Promise<{ orders: StoreOrder[] }>
      retrieve(id: string): Promise<{ order: StoreOrder }>
    }
  }

  // Medusa 配置型別
  interface MedusaConfig {
    baseUrl: string
    publishableKey?: string
    debug?: boolean
  }
}

export {}

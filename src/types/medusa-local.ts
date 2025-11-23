// 本地 Medusa 類型定義
// 用於解決 @medusajs/types 在 devDependencies 中的問題

// 導入必要的基礎類型
interface BaseCalculatedPriceSet {
  id: string;
  is_calculated_price_price_list?: boolean;
  is_calculated_price_tax_inclusive?: boolean;
  calculated_amount: number | null;
  calculated_amount_with_tax?: number | null;
  calculated_amount_without_tax?: number | null;
  is_original_price_price_list?: boolean;
  is_original_price_tax_inclusive?: boolean;
  original_amount: number | null;
  original_amount_with_tax: number | null;
  original_amount_without_tax: number | null;
  currency_code: string | null;
  calculated_price?: {
    id: string | null;
    price_list_id: string | null;
    price_list_type: string | null;
    min_quantity: number | null;
    max_quantity: number | null;
  };
  original_price?: {
    id: string | null;
    price_list_id: string | null;
    price_list_type: string | null;
    min_quantity: number | null;
    max_quantity: number | null;
  };
}

export declare namespace LocalHttpTypes {
  // 基礎查詢參數類型
  export interface FindParams {
    expand?: string
    fields?: string
    offset?: number
    limit?: number
    order?: string
  }

  // Collection 相關類型
  export interface StoreCollectionListResponse {
    collections: StoreCollection[]
    count: number
    offset: number
    limit: number
  }

  export interface StoreProduct {
    id: string
    title: string
    subtitle?: string | null
    description?: string | null
    handle: string
    is_giftcard?: boolean
    status: "draft" | "proposed" | "published" | "rejected"
    thumbnail?: string | null
    weight: number | null
    length: number | null
    height: number | null
    width: number | null
    hs_code: string | null
    origin_country: string | null
    mid_code: string | null
    material: string | null
    collection_id?: string | null
    type_id: string | null
    discountable: boolean
    external_id: string | null
    created_at: string | null
    updated_at: string | null
    deleted_at: string | null
    metadata?: Record<string, unknown> | null
    images?: StoreProductImage[] | null
    options: StoreProductOption[] | null
    variants: StoreProductVariant[] | null
    categories?: StoreProductCategory[] | null
    tags?: StoreProductTag[] | null
    collection?: StoreCollection | null
    type?: StoreProductType | null
  }

  export interface StoreProductImage {
    id: string
    url: string
    rank: number
    metadata?: Record<string, unknown> | null
  }

  export interface StoreProductOption {
    id: string
    title: string
    values?: StoreProductOptionValue[]
    metadata?: Record<string, unknown> | null
  }

  export interface StoreProductOptionValue {
    id: string
    value: string
    option_id?: string | null
    metadata?: Record<string, unknown> | null
  }

  export interface StoreProductVariant {
    id: string
    title: string | null
    sku: string | null
    barcode: string | null
    ean: string | null
    upc: string | null
    variant_rank?: number | null
    inventory_quantity?: number
    allow_backorder?: boolean | null
    manage_inventory?: boolean | null
    hs_code: string | null
    origin_country: string | null
    mid_code: string | null
    material: string | null
    weight: number | null
    length: number | null
    height: number | null
    width: number | null
    metadata?: Record<string, any> | null
    prices?: StoreProductVariantPrice[] | null
    options: StoreProductOptionValue[] | null
    calculated_price?: BaseCalculatedPriceSet
    created_at: string
    updated_at: string
    deleted_at: string | null
  }

  export interface StoreProductVariantPrice {
    id: string
    currency_code: string
    amount: number
    min_quantity?: number
    max_quantity?: number
  }

  export interface StoreProductCategory {
    id: string
    name: string
    description: string
    handle: string
    is_active?: boolean
    is_internal?: boolean
    rank: number | null
    parent_category_id: string | null
    parent_category: StoreProductCategory | null
    category_children: StoreProductCategory[]
    created_at: string
    updated_at: string
    deleted_at: string | null
    metadata?: Record<string, any> | null
  }

  export interface StoreProductTag {
    id: string
    value: string
    created_at: string
    updated_at: string
  }

  export interface StoreCollection {
    id: string
    title: string
    handle: string
    created_at: string
    updated_at: string
    metadata: Record<string, unknown> | null
  }

  export interface StoreProductType {
    id: string
    value: string
    created_at: string
    updated_at: string
    metadata?: Record<string, any> | null
  }

  export interface StoreRegion {
    id: string
    name: string
    currency_code: string
    automatic_taxes: boolean
    tax_rate?: number
    tax_code?: string
    countries: StoreCountry[]
  }

  export interface StoreCountry {
    id: string
    iso_2: string
    iso_3: string
    num_code: string
    name: string
    display_name: string
  }

  // API 響應類型
  export interface StoreProductsResponse {
    products: StoreProduct[]
    count: number
    offset: number
    limit: number
  }

  export interface StoreProductParams {
    id?: string[]
    q?: string
    collection_id?: string[]
    category_id?: string[]
    tag_id?: string[]
    type_id?: string[]
    is_giftcard?: boolean
    created_at?: {
      lt?: string
      gt?: string
      lte?: string
      gte?: string
    }
    updated_at?: {
      lt?: string
      gt?: string
      lte?: string
      gte?: string
    }
    fields?: string
    expand?: string
    limit?: number
    offset?: number
    order?: string
  }
}

"use server"

import { sdk, MEDUSA_BACKEND_URL } from "../config"
import medusaError from "@shared/utilities/medusa-error"
import { getPublishableKeyForBackend } from "../medusa-publishable-key"
import { sortProducts } from "@shared/utilities/sort-products"
import { HttpTypes } from "@medusajs/types"
import type { SortOptions } from "../../modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

// 產品查詢快取配置
const PRODUCTS_CACHE_CONFIG = {
  revalidate: 300, // 5分鐘 server-side 快取
  tags: ['products', 'store-products']
}

// 優化的欄位選擇 - 只獲取必要欄位以提升效能
const ESSENTIAL_PRODUCT_FIELDS = [
  "id", "title", "handle", "description", "status", "thumbnail",
  "images", "options", "variants", "type", "collection", "tags",
  "metadata", "created_at", "updated_at"
].join(",")

const VARIANT_FIELDS = [
  "id", "title", "sku", "barcode", "inventory_quantity", 
  "allow_backorder", "manage_inventory", "prices", "options"
].join(",")

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam - 1) * limit

  const region = regionId
    ? await retrieveRegion(regionId)
    : countryCode
    ? await getRegion(countryCode)
    : null

  if (!region) {
    throw new Error("Could not find region")
  }

  // 優化查詢參數 - 只請求必要欄位
  const optimizedQuery = {
    ...queryParams,
    limit,
    offset,
    region_id: region.id,
    fields: `${ESSENTIAL_PRODUCT_FIELDS},*variants.${VARIANT_FIELDS}`,
    // 啟用後端快取
    // expand: "variants,variants.prices,options,options.values,collection,type", // 暫時移除 expand 參數以修復錯誤
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(`/store/products`, {
      method: "GET",
      query: optimizedQuery,
      headers: {
        "x-publishable-api-key": getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
        "Cache-Control": "public, max-age=300", // 5分鐘瀏覽器快取
      },
      next: { 
        revalidate: PRODUCTS_CACHE_CONFIG.revalidate,
        tags: PRODUCTS_CACHE_CONFIG.tags 
      },
      cache: "force-cache", // 改用快取優先策略
    })
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
    .catch((error) => {
      console.error("產品列表獲取失敗:", error)
      throw medusaError(error)
    })
}

/**
 * This will fetch 100 products and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 * No caching is used to ensure data is always fresh.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}

/**
 * 獲取單一產品的詳細資訊，並確保包含庫存資訊
 */
export const getProduct = async ({
  handle,
  countryCode,
  regionId,
}: {
  handle: string
  countryCode?: string
  regionId?: string
}): Promise<HttpTypes.StoreProduct> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const region = regionId
    ? await retrieveRegion(regionId)
    : countryCode
    ? await getRegion(countryCode)
    : null

  if (!region) {
    throw new Error("Could not find region")
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      method: "GET",
      query: {
        handle,
        region_id: region.id,
        fields: "*options.values,*variants.options.option,+variants.inventory_quantity,+metadata",
      },
      headers: {
        "x-publishable-api-key": getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
      },
      next: { revalidate: 0 },
      cache: "no-store",
    })
    .then(({ products }) => {
      if (products.length === 0) {
        throw new Error(`Product with handle: ${handle} was not found`);
      }
      return products[0];
    })
}

/**
 * 批量產品獲取 - 用於相關產品等場景
 */
export const getProductsByIds = async ({
  productIds,
  regionId,
  countryCode,
  limit = 50,
}: {
  productIds: string[]
  regionId?: string
  countryCode?: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  if (productIds.length === 0) {
    return []
  }

  const region = regionId
    ? await retrieveRegion(regionId)
    : countryCode
    ? await getRegion(countryCode)
    : null

  if (!region) {
    throw new Error("Could not find region")
  }

  // 批量查詢優化
  const batchQuery = {
    id: productIds.slice(0, limit), // 限制批量大小
    region_id: region.id,
    fields: ESSENTIAL_PRODUCT_FIELDS,
    limit,
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      method: "GET",
      query: batchQuery,
      headers: {
        "x-publishable-api-key": getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
        "Cache-Control": "public, max-age=300",
      },
      next: { 
        revalidate: 300,
        tags: ['products', 'batch-products'] 
      },
      cache: "force-cache",
    })
    .then(({ products }) => products)
    .catch((error) => {
      console.error("批量產品獲取失敗:", error)
      throw medusaError(error)
    })
}

"use server"

import { sdk, MEDUSA_BACKEND_URL } from "../config"
import medusaError from "../util/medusa-error"
import { getPublishableKeyForBackend } from "../medusa-publishable-key"
import { sortProducts } from "../util/sort-products"
import { HttpTypes } from "@medusajs/types"
import type { SortOptions } from "../../modules/store/components/refinement-list/sort-products"
import { getRegion, retrieveRegion } from "./regions"
import { getProductsByHandles, mapCountryToLanguage } from "../sanity-utils"
import { MANUAL_TRANSLATIONS } from "../manual-product-translations"

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
    .then(async ({ products, count }) => {
      const nextPage = count > offset + limit ? offset + limit : null

      // 嘗試從 Sanity 獲取本地化資料
      try {
        if (products.length > 0 && countryCode) {
          const handles = products.map(p => p.handle).filter(Boolean) as string[]
          const language = mapCountryToLanguage(countryCode)

          if (handles.length > 0) {
            const localizedProducts = await getProductsByHandles(handles, language)

            // 建立查表
            const localizedMap = new Map(
              localizedProducts.map((p: any) => [p.slug.current, p])
            )

            // 合併資料
            products = products.map(product => {
              const sanityData = localizedMap.get(product.handle) as any
              if (sanityData) {
                return {
                  ...product,
                  title: sanityData.title || product.title,
                  description: sanityData.description || product.description,
                }
              }
              // Manual translation override
              const manualData = MANUAL_TRANSLATIONS[product.handle]?.[language]
              if (manualData) {
                return {
                  ...product,
                  title: manualData.title || product.title,
                  description: manualData.description || product.description,
                }
              }
              return product
            })
          }
        }
      } catch (error) {
        console.warn('Failed to fetch localized products from Sanity:', error)
        // 失敗時保持原樣，不阻擋流程
      }

      return {
        response: {
          products,
          count,
        },
        nextPage,
        ...(queryParams ? { queryParams } : {}),
      }
    })
    .catch((error) => {
      // console.error("產品列表獲取失敗:", error)
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
    ...(queryParams ? { queryParams } : {}),
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
    .then(async ({ products }) => {
      if (products.length === 0) {
        throw new Error(`Product with handle: ${handle} was not found`);
      }

      let product = products[0];

      // 嘗試從 Sanity 獲取本地化資料
      try {
        if (countryCode) {
          const language = mapCountryToLanguage(countryCode)
          /* 
             注意：這裡我們可以用 getProduct(handle, language) from sanity-utils 
             但因為我們只需要部分欄位覆蓋，且 sanity-utils/index.ts 的 getProduct 
             是用來獲取完整頁面資料的（包含 body 等）。
             
             為了保持一致性，我們可以重用 getProductsByHandles 或是直接用 sanity-utils 的 getProduct 
             如果 sanity-utils 的 getProduct 返回符合 StoreProduct 結構或我們需要的欄位。
             
             sanity-utils 的 getProduct 返回的是:
             { _id, title, slug, description, body, images, medusaId, language }
             
             所以我們可以覆蓋 title, description.
          */
          // 這裡為了簡單，我們使用 getProductsByHandles，因為它已經定義好了 schema
          const localizedProducts = await getProductsByHandles([handle], language)
          if (localizedProducts && localizedProducts.length > 0) {
            const sanityData = localizedProducts[0] as any
            product = {
              ...product,
              title: sanityData.title || product.title,
              description: sanityData.description || product.description,
            }
          }
          // Manual translation override
          const manualData = MANUAL_TRANSLATIONS[handle]?.[language]
          if (manualData) {
            product = {
              ...product,
              title: manualData.title || product.title,
              description: manualData.description || product.description,
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch localized product from Sanity:', error)
      }

      return product;
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
    .then(async ({ products }) => {
      // 嘗試從 Sanity 獲取本地化資料
      try {
        if (products.length > 0 && countryCode) {
          const handles = products.map(p => p.handle).filter(Boolean) as string[]
          const language = mapCountryToLanguage(countryCode)

          if (handles.length > 0) {
            const localizedProducts = await getProductsByHandles(handles, language)

            // 建立查表
            const localizedMap = new Map(
              localizedProducts.map((p: any) => [p.slug.current, p])
            )

            // 合併資料
            products = products.map(product => {
              const sanityData = localizedMap.get(product.handle) as any
              if (sanityData) {
                return {
                  ...product,
                  title: sanityData.title || product.title,
                  description: sanityData.description || product.description,
                }
              }
              // Manual translation override
              const manualData = MANUAL_TRANSLATIONS[product.handle]?.[language]
              if (manualData) {
                return {
                  ...product,
                  title: manualData.title || product.title,
                  description: manualData.description || product.description,
                }
              }
              return product
            })
          }
        }
      } catch (error) {
        console.warn('Failed to fetch localized products from Sanity (getProductsByIds):', error)
      }

      return products
    })
    .catch((error) => {
      // console.error("批量產品獲取失敗:", error)
      throw medusaError(error)
    })
}

/**
 * 從產品資料中提取詳細內容（從 metadata.detail_content）
 */
export const getProductDetailContent = async (product: HttpTypes.StoreProduct): Promise<string | null> => {
  try {
    if (product?.metadata && typeof product.metadata === 'object') {
      const metadata = product.metadata as Record<string, any>
      return metadata.detail_content || null
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * 從產品資料中提取詳細圖片清單（從 metadata.detail_images）
 */
export const getProductDetailImages = async (product: HttpTypes.StoreProduct): Promise<string[]> => {
  try {
    if (product?.metadata && typeof product.metadata === 'object') {
      const metadata = product.metadata as Record<string, any>
      if (metadata.detail_images) {
        return typeof metadata.detail_images === 'string'
          ? JSON.parse(metadata.detail_images)
          : metadata.detail_images
      }
    }
    return []
  } catch (error) {
    return []
  }
}

/**
 * 從產品資料中提取詳細區塊清單（從 metadata.detail_blocks）
 */
export const getProductDetailBlocks = async (product: HttpTypes.StoreProduct): Promise<any[]> => {
  try {
    if (product?.metadata && typeof product.metadata === 'object') {
      const metadata = product.metadata as Record<string, any>
      if (metadata.detail_blocks) {
        return typeof metadata.detail_blocks === 'string'
          ? JSON.parse(metadata.detail_blocks)
          : metadata.detail_blocks
      }
    }
    return []
  } catch (error) {
    return []
  }
}

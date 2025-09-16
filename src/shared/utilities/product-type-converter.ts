/**
 * 產品類型轉換工具
 * 用於在 LocalHttpTypes 和 HttpTypes 之間進行轉換
 */

import { HttpTypes } from "@medusajs/types"
import { LocalHttpTypes } from "../../types/medusa-local"

/**
 * 將 LocalHttpTypes.StoreProduct 轉換為 HttpTypes.StoreProduct
 * 主要處理 collection_id 的 null/undefined 差異
 */
export function convertToStandardProduct(
  product: LocalHttpTypes.StoreProduct
): HttpTypes.StoreProduct {
  return {
    ...product,
    // 將 null 轉換為 undefined 以匹配 HttpTypes
    collection_id: product.collection_id ?? undefined,
  } as HttpTypes.StoreProduct
}

/**
 * 批量轉換產品陣列
 */
export function convertToStandardProducts(
  products: LocalHttpTypes.StoreProduct[]
): HttpTypes.StoreProduct[] {
  return products.map(convertToStandardProduct)
}

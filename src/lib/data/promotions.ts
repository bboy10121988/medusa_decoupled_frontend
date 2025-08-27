"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"

/**
 * 從 Medusa API 獲取產品的促銷信息
 */
export const getProductPromotions = async (
  productId: string,
  regionId: string
): Promise<{
  discountPercentage?: number
  originalPrice?: number
  discountedPrice?: number
  hasFlashSale?: boolean
  isNew?: boolean
  isHot?: boolean
  isLimited?: boolean
  isBestseller?: boolean
  isFeatured?: boolean
  isOnSale?: boolean
  specialEvent?: string
  bundleDiscount?: number
  isExclusive?: boolean
  hasDiscountCode?: string
  buyXGetY?: string | boolean
}> => {
  try {
    // 獲取產品詳細信息包含價格
    const authHeaders = await getAuthHeaders()
    const product = await sdk.client.fetch<{ product: HttpTypes.StoreProduct }>(
      `/store/products/${productId}`,
      {
        method: "GET",
        query: {
          region_id: regionId,
        },
        headers: authHeaders,
        ...getCacheOptions("products"),
      }
    )

    if (!product.product || !product.product.variants?.[0]) {
      return {}
    }

    const variant = product.product.variants[0]
    const calculatedPrice = variant.calculated_price

    let promotionData: any = {}

    // 檢查價格差異來判斷是否有折扣
    if (calculatedPrice) {
      const originalAmount = calculatedPrice.original_amount
      const calculatedAmount = calculatedPrice.calculated_amount

      if (originalAmount && calculatedAmount && originalAmount > calculatedAmount) {
        const discountPercentage = Math.round(
          ((originalAmount - calculatedAmount) / originalAmount) * 100
        )
        promotionData = {
          discountPercentage,
          originalPrice: originalAmount,
          discountedPrice: calculatedAmount,
          isOnSale: true,
        }
      }
    }

    // 檢查產品 metadata 中的促銷標籤
    const metadata = product.product.metadata as Record<string, any> || {}
    
    // 從 metadata 中提取促銷標籤
    promotionData = {
      ...promotionData,
      isNew: metadata.is_new === true || metadata.is_new === "true",
      isHot: metadata.is_hot === true || metadata.is_hot === "true",
      isLimited: metadata.is_limited === true || metadata.is_limited === "true",
      isBestseller: metadata.is_bestseller === true || metadata.is_bestseller === "true",
      isFeatured: metadata.is_featured === true || metadata.is_featured === "true",
      hasFlashSale: metadata.has_flash_sale === true || metadata.has_flash_sale === "true",
      isExclusive: metadata.is_exclusive === true || metadata.is_exclusive === "true",
      specialEvent: metadata.special_event || null,
      hasDiscountCode: metadata.discount_code || null,
      bundleDiscount: metadata.bundle_discount ? parseInt(metadata.bundle_discount) : null,
      buyXGetY: metadata.buy_x_get_y || metadata.buyXGetY || null,
    }

    // 檢查產品標籤 (tags) 中的促銷信息
    if (product.product.tags && product.product.tags.length > 0) {
      const tagValues = product.product.tags.map((tag: any) => tag.value?.toLowerCase() || "")
      
      promotionData = {
        ...promotionData,
        isNew: promotionData.isNew || tagValues.includes("new") || tagValues.includes("新品"),
        isHot: promotionData.isHot || tagValues.includes("hot") || tagValues.includes("熱銷"),
        isLimited: promotionData.isLimited || tagValues.includes("limited") || tagValues.includes("限量"),
        isBestseller: promotionData.isBestseller || tagValues.includes("bestseller") || tagValues.includes("暢銷"),
        isFeatured: promotionData.isFeatured || tagValues.includes("featured") || tagValues.includes("精選"),
        hasFlashSale: promotionData.hasFlashSale || tagValues.includes("flash-sale") || tagValues.includes("限時搶購"),
        isExclusive: promotionData.isExclusive || tagValues.includes("exclusive") || tagValues.includes("獨家"),
      }
    }

    // 檢查收藏 (collection) 來判斷是否為精選商品
    if (product.product.collection) {
      const collectionHandle = product.product.collection.handle?.toLowerCase()
      if (collectionHandle === "featured" || collectionHandle === "精選") {
        promotionData.isFeatured = true
      }
    }

    return promotionData

  } catch (error) {
    console.error("Error fetching product promotions:", error)
    return {}
  }
}

/**
 * 檢查產品庫存狀態
 */
export const getProductInventoryStatus = async (
  productId: string,
  regionId: string
): Promise<{
  isOutOfStock: boolean
  canBackorder: boolean
  inventoryQuantity?: number
}> => {
  try {
    const authHeaders = await getAuthHeaders()
    const product = await sdk.client.fetch<{ product: HttpTypes.StoreProduct }>(
      `/store/products/${productId}`,
      {
        method: "GET",
        query: {
          region_id: regionId,
        },
        headers: authHeaders,
        ...getCacheOptions("products"),
      }
    )

    if (!product.product || !product.product.variants?.[0]) {
      return { isOutOfStock: false, canBackorder: false }
    }

    const variant = product.product.variants[0]
    
    return {
      isOutOfStock: false, // TODO: 根據實際庫存 API 實現
      canBackorder: variant.allow_backorder || false,
      inventoryQuantity: undefined, // TODO: 如果有庫存 API 可以添加
    }

  } catch (error) {
    console.error("Error fetching inventory status:", error)
    return { isOutOfStock: false, canBackorder: false }
  }
}

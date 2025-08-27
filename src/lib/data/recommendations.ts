import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export const getFeaturedProducts = async (
  limit: number = 4,
  countryCode: string = "tw"
): Promise<HttpTypes.StoreProduct[]> => {
  try {
    const next = {
      ...(await getCacheOptions("featured-products")),
    }

    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products?limit=${limit}&fields=*variants.prices`,
      {
        method: "GET",
        next,
        cache: "force-cache",
      }
    )

    return response.products || []
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

export const getRelatedProducts = async (
  productIds: string[],
  limit: number = 4,
  countryCode: string = "tw"
): Promise<HttpTypes.StoreProduct[]> => {
  try {
    const next = {
      ...(await getCacheOptions("related-products")),
    }

    // 獲取購物車中不包含的商品
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      `/store/products?limit=${limit + productIds.length}&fields=*variants.prices`,
      {
        method: "GET",
        next,
      }
    )

    // 過濾掉購物車中已有的商品
    const filteredProducts = (response.products || [])
      .filter((product: HttpTypes.StoreProduct) => !productIds.includes(product.id))
      .slice(0, limit)

    return filteredProducts
  } catch (error) {
    console.error("Error fetching related products:", error)
    return []
  }
}

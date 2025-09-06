import { sdk, MEDUSA_BACKEND_URL } from "../config"
import { getPublishableKeyForBackend } from "../medusa-publishable-key"
import { HttpTypes } from "@medusajs/types"

type CacheOptions = {
  revalidate?: number
  tags?: string[]
}



export const listCategories = async (query?: Record<string, any>) => {
  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit: query?.limit || 100,
          ...query,
        },
        headers: {
          "x-publishable-api-key": getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
        },
        next: { revalidate: 300 }
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  try {
    return sdk.client
      .fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "*category_children, *products",
            handle,
          },
          headers: {
            "x-publishable-api-key": getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
          },
          next: { revalidate: 300 }
        }
      )
      .then(({ product_categories }) => product_categories[0] || null)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(`Failed to fetch category by handle "${handle}":`, error)
    return null
  }
}

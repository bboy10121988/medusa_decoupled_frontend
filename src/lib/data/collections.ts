"use server"

import { sdk, MEDUSA_BACKEND_URL } from "../config"
import { getPublishableKeyForBackend } from "../medusa-publishable-key"
import { LocalHttpTypes } from "../../types/medusa-local"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<{ collection: LocalHttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: LocalHttpTypes.StoreCollection[]; count: number }> => {
  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return sdk.client
    .fetch<{ collections: LocalHttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: {
          ...queryParams,
          fields: "handle,id,title,metadata,products",
        },
        next: { revalidate: 0 }, // 禁用快取，每次都重新獲取
        cache: "no-store", // 禁用儲存快取
        headers: {
          "x-publishable-api-key": getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
        },
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string
): Promise<LocalHttpTypes.StoreCollection> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<LocalHttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      next,
      cache: "force-cache",
    })
    .then(({ collections }) => collections[0])
}

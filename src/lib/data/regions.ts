"use server"

import { sdk, MEDUSA_BACKEND_URL } from "@lib/config"
import { getPublishableKeyForBackend } from "@lib/medusa-publishable-key"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
      headers: {
        "x-publishable-api-key": getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
      },
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
      headers: {
        "x-publishable-api-key": getPublishableKeyForBackend(MEDUSA_BACKEND_URL),
      },
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (!regions) {
      return null
    }

    // 從環境變數取得預設地區，如果沒有則使用 tw
    const defaultRegion = process.env.NEXT_PUBLIC_DEFAULT_REGION || "tw"

    // 先嘗試使用 countries 資料建立映射
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    // 如果找到了基於 ISO 代碼的對應，直接返回
    if (regionMap.has(countryCode)) {
      if (process.env.NODE_ENV === 'development') console.log(`✅ 找到地區映射: ${countryCode} -> ${regionMap.get(countryCode)?.name}`)
      return regionMap.get(countryCode)
    }

    // 如果沒有找到，嘗試從環境變數獲取特定地區 ID
    const regionIdKey = `NEXT_PUBLIC_REGION_${countryCode.toUpperCase()}`
    const regionId = process.env[regionIdKey]
    
    if (regionId) {
      const region = regions.find(r => r.id === regionId)
      if (region) {
        regionMap.set(countryCode, region)
        if (process.env.NODE_ENV === 'development') console.log(`✅ 透過環境變數找到地區: ${countryCode} -> ${region.name} (${regionId})`)
        return region
      }
    }

    // 如果沒有找到，嘗試使用預設地區
    if (regionMap.has(defaultRegion)) {
      if (process.env.NODE_ENV === 'development') console.log(`⚠️  使用預設地區: ${defaultRegion} -> ${regionMap.get(defaultRegion)?.name}`)
      return regionMap.get(defaultRegion)
    }

    // 最後的備用方案：返回第一個可用的地區
    if (regions.length > 0) {
      if (process.env.NODE_ENV === 'development') console.log(`⚠️  使用第一個可用地區: ${regions[0].name}`)
      return regions[0]
    }

    return null

  } catch (e: any) {
    if (process.env.NODE_ENV === 'development') console.error("獲取地區時發生錯誤:", e)
    return null
  }
}

"use server"

import { sdk } from "@lib/config"
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

    // 建立硬編碼的 countryCode -> region 映射
    const hardcodedMapping: Record<string, string> = {
      "tw": "Taiwan",  // 更新為正確的地區名稱
      "us": "United States", 
      "eu": "Europe"
    }

    // 先嘗試使用 countries 資料建立映射
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    // 如果 countries 為空或找不到對應的地區，使用硬編碼映射
    if (regionMap.size === 0 || !regionMap.has(countryCode)) {
      regions.forEach((region) => {
        const regionName = region.name
        for (const [code, name] of Object.entries(hardcodedMapping)) {
          if (regionName === name) {
            regionMap.set(code, region)
          }
        }
      })
    }

    const region = countryCode
      ? regionMap.get(countryCode) || regionMap.get("tw")  // 預設使用台灣而不是美國
      : regionMap.get("tw")

    return region
  } catch (e: any) {
    return null
  }
}

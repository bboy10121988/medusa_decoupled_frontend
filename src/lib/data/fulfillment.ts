"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export const listCartShippingMethods = async (cartId: string) => {
  console.log("📞📞📞 listCartShippingMethods 被呼叫，cartId:", cartId)
  
  try {
    const headers = {
      ...(await getAuthHeaders()),
      'Content-Type': 'application/json',
    }

    // 使用標準 fetch 替代 SDK
    const url = new URL(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://35.236.182.29:9000'}/store/shipping-options`)
    url.searchParams.set('cart_id', cartId)
    
    console.log("🔗🔗🔗 請求URL:", url.toString())
    console.log("🔑🔑🔑 請求Headers:", headers)
    
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: 'no-store', // 確保不使用緩存
    })
    
    console.log("📡📡📡 回應狀態:", response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌❌❌ HTTP錯誤回應:", errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log("✅✅✅ 原生 API 回應:", data)
    
    if (data?.shipping_options) {
      console.log("🚚🚚🚚 listCartShippingMethods 成功，收到 shipping_options:", data.shipping_options.length, "個選項")
      return data.shipping_options
    } else {
      console.log("⚠️⚠️⚠️ 沒有 shipping_options 在回應中")
      return []
    }
  } catch (error: any) {
    console.error("❌❌❌ listCartShippingMethods 失敗:", error)
    // 不要拋出錯誤，而是返回空陣列
    return []
  }
}

export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  const body = { cart_id: cartId, data }

  if (data) {
    body.data = data
  }

  return sdk.client
    .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
      `/store/shipping-options/${optionId}/calculate`,
      {
        method: "POST",
        body,
        headers,
        next,
      }
    )
    .then(({ shipping_option }) => shipping_option)
    .catch((e) => {
      return null
    })
}

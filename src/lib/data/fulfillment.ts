"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export const listCartShippingMethods = async (cartId: string) => {
  console.log("📞 listCartShippingMethods 被呼叫，cartId:", cartId)
  
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const next = {
      ...(await getCacheOptions("fulfillment")),
    }

    // 直接使用原生 Medusa API
    const response = await sdk.client.fetch<{ shipping_options: HttpTypes.StoreCartShippingOption[] }>(
      `/store/shipping-options`,
      {
        method: "GET",
        headers,
        next,
        query: { cart_id: cartId }
      }
    )
    
    console.log("✅ 原生 API 回應:", response)
    
    if (response && response.shipping_options) {
      console.log("✅ listCartShippingMethods 成功，收到 shipping_options:", response.shipping_options.length, "個選項")
      return response.shipping_options
    } else {
      console.log("⚠️ 沒有 shipping_options 在回應中")
      return []
    }
  } catch (error) {
    console.error("❌ listCartShippingMethods 失敗:", error)
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

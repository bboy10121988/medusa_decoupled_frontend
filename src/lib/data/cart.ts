"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string) {
  const isDev = process.env.NODE_ENV === 'development'
  const id = cartId || (await getCartId())

  if (!id) {
    // 這是正常情況 - 新用戶還沒有購物車
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items, *region, *items.product, *items.variant, *items.variant.options, *items.variant.options.option, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name",
      },
      headers,
      next,
      cache: "no-store", // 不緩存購物車資料，確保每次都是最新的
    })
    .then(({ cart }) => cart)
    .catch((error) => {
      // 只在真正的錯誤時記錄，而不是沒有購物車時
      if (error.status !== 404) {
        if (isDev) {
          // console.error("❌ retrieveCart 失敗:", error)
        }
      }
      return null
    })
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  // if (isDev) console.log("🌍 區域資訊:", { regionId: region.id, countryCode })

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    // if (isDev) console.log("🆕 建立新購物車...")
    try {
      const cartResp = await sdk.store.cart.create(
        { region_id: region.id },
        {},
        headers
      )
      cart = cartResp.cart

      // if (isDev) console.log("✅ 購物車建立成功:", { cartId: cart.id })

      await setCartId(cart.id)
      // if (isDev) console.log("🍪 Cart ID 已設定到 cookies:", cart.id)

      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    } catch (error) {
      // if (isDev) console.error("❌ 建立購物車失敗:", error)
      throw error
    }
  } else {
    // if (isDev) console.log("♻️ 使用現有購物車:", { cartId: cart.id })
  }

  if (cart && cart?.region_id !== region.id) {
    // if (isDev) console.log("🔄 更新購物車區域...")
    try {
      await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    } catch (error) {
      // if (isDev) console.error("❌ 更新購物車區域失敗:", error)
      throw error
    }
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  // if (isDev) console.log("🚀 addToCart 開始:", { variantId, quantity, countryCode })

  try {
    const cart = await getOrSetCart(countryCode)

    if (!cart) {
      throw new Error("Error retrieving or creating cart")
    }

    // if (isDev) console.log("📦 購物車資訊:", { cartId: cart.id, regionId: cart.region_id })

    const headers = {
      ...(await getAuthHeaders()),
    }

    await sdk.store.cart
      .createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        headers
      )
      .then(async () => {
        // if (isDev) console.log("✅ 成功創建購物車項目:", response)
        
        const cartCacheTag = await getCacheTag("carts")
        revalidateTag(cartCacheTag)

        const fulfillmentCacheTag = await getCacheTag("fulfillment")
        revalidateTag(fulfillmentCacheTag)
      })
      .catch((error) => {
        // if (isDev) console.error("❌ 創建購物車項目失敗:", error)
        throw error
      })
  } catch (error) {
    // if (isDev) console.error("❌ addToCart 失敗:", error)
    throw error
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

/**
 * 清空整個購物車 - 當遇到支付會話衝突時的最後手段
 */
export async function clearCart() {
  try {
    removeCartId()
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    return true
  } catch (error: any) {
    // console.error("清空購物車失敗:", error)
    throw new Error("清空購物車失敗")
  }
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  // console.log(action,"cart:",cart)
  
  // console.log(action,"data:",data)
  
  const headers = {
    ...(await getAuthHeaders()),
  }

  // console.log("執行：",action)

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {



      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return resp
    }).catch((e)=>{

      // console.log(action,"has error:",e)

      medusaError(e)
    })
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("無法獲取購物車 ID，請先添加商品到購物車")
  }

  // 確保 codes 是有效的字符串數組
  const validCodes = codes.filter(code => typeof code === 'string' && code.trim() !== '')

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: validCodes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch((error) => {
      throw medusaError(error)
    })
}

export async function applyGiftCard() {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount() {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard() {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  _currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(_currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

/**
 * 為銀行轉帳支付創建支付集合
 * @param cartId - 購物車ID
 */
export async function createPaymentCollectionForBankTransfer(cartId: string) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // console.log("🏦 開始為銀行轉帳創建支付集合，購物車ID:", cartId)
  
  // 先獲取購物車信息
  let cart;
  try {
    cart = await retrieveCart(cartId)
    if (!cart) {
      throw new Error("找不到購物車")
    }
    // console.log("📋 購物車信息:", {
      // id: cart.id,
      // region_id: cart.region?.id,
      // currency_code: cart.region?.currency_code,
      // total: cart.total,
      // has_payment_collection: !!cart.payment_collection
    // })
  } catch (cartError: any) {
    // console.error("❌ 獲取購物車失敗:", cartError)
    throw new Error(`獲取購物車失敗: ${cartError.message}`)
  }

  // 如果購物車已經有支付集合，直接返回
  if (cart.payment_collection) {
    // console.log("✅ 購物車已經有支付集合:", cart.payment_collection)
    return cart.payment_collection
  }

  try {
    // 方法1：嘗試使用 payment-collections API
    // console.log("🔧 嘗試創建支付集合 (方法1: /store/payment-collections)")
    
    const paymentData = {
      cart_id: cartId,
      region_id: cart.region?.id,
      currency_code: cart.region?.currency_code || "TWD",
    }
    // console.log("📦 發送的數據:", paymentData)
    
    const paymentCollectionResponse = await sdk.client.fetch<any>(
      `/store/payment-collections`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      }
    )
    
    // console.log("✅ 支付集合創建成功 (方法1):", paymentCollectionResponse)
    return paymentCollectionResponse
    
  } catch (error: any) {
    // console.error("❌ 方法1失敗 - 錯誤詳情:", {
      // message: error.message,
      // status: error.status,
      // statusText: error.statusText,
      // response: error.response?.data || error.response,
      // responseText: error.responseText,
      // stack: error.stack?.split('\n').slice(0, 3)
    // })
    
    // 如果是網路錯誤或 API 不存在，直接嘗試下一個方法
    // console.log("🔄 方法1失敗，嘗試方法2...")
    
    try {
      // 方法2：為銀行轉帳創建一個基本的支付集合（使用系統預設）
      // console.log("🔧 嘗試為銀行轉帳創建基本支付集合 (方法2)")
      
      const paymentSessionData2 = {
        cart_id: cartId,
        amount: cart.total || 0,
        currency_code: cart.region?.currency_code || "TWD",
      }
      // console.log("📦 發送的會話數據:", paymentSessionData2)
      
      const paymentResponse = await sdk.client.fetch<any>(
        `/store/carts/${cartId}/payment-collection`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentSessionData2),
        }
      )
      
      // console.log("✅ 支付會話創建成功 (方法2):", paymentResponse)
      return paymentResponse
      
    } catch (error2: any) {
      // console.error("❌ 方法2也失敗了 - 錯誤詳情:", {
        // message: error2.message,
        // status: error2.status,
        // statusText: error2.statusText,
        // response: error2.response?.data || error2.response,
        // responseText: error2.responseText,
        // url: `/store/carts/${cartId}/payment-collection`,
        // stack: error2.stack?.split('\n').slice(0, 3)
      // })
      
      // console.log("🔄 方法2失敗，嘗試方法3...")
      
      // 方法3：使用 ECPay provider 作為技術基礎，但標記為銀行轉帳
      try {
        // console.log("🔧 使用 ECPay 作為基礎建立銀行轉帳支付 (方法3)")
        
        const paymentSessionData = {
          provider_id: "ecpay_credit_card", // 技術上使用 ECPay，但會在 metadata 中標記為銀行轉帳
        }
        
        const paymentResponse = await sdk.client.fetch<any>(
          `/store/carts/${cartId}/payment-collection`,
          {
            method: "POST",
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentSessionData),
          }
        )
        
        // console.log("✅ 基礎支付集合建立成功，現在標記為銀行轉帳")
        
        // 立即更新 metadata 以標記這是銀行轉帳
        await sdk.store.cart.update(
          cartId,
          {
            metadata: {
              ...cart.metadata,
              selected_payment_provider: "manual_manual",
              actual_payment_method: "bank_transfer",
              payment_initialized: "true"
            }
          }
        )
        
        // console.log("✅ 銀行轉帳支付集合建立完成 (方法3)")
        return paymentResponse
        
      } catch (error3: any) {
        // console.error("❌ 所有方法都失敗了 - 最終錯誤:", {
          // method1: error.message,
          // method2: error2.message,
          // method3: error3.message
        // })
        
        const detailedError = error3.response?.data || error3.message || "未知錯誤"
        throw new Error(`所有支付集合創建方法都失敗了: ${detailedError}`)
      }
    }
  }
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // 獲取當前購物車信息以檢查支付方式
  const currentCart = await retrieveCart(id)
  
  if (!currentCart) {
    throw new Error("無法獲取購物車信息")
  }

  if (!currentCart.shipping_address) {
    throw new Error("請先設定配送地址")
  }

  if (!currentCart.shipping_methods?.length) {
    throw new Error("請先選擇配送方式")
  }

  if (!currentCart.metadata?.selected_payment_provider && !currentCart.payment_collection?.payment_sessions?.length) {
    throw new Error("請先選擇支付方式")
  }

  // 對於 manual_manual (銀行轉帳)，直接提交訂單
  const selectedPaymentProvider = currentCart.metadata?.selected_payment_provider
  
  // console.log("💳 準備提交訂單:", {
    // cartId: id,
    // paymentProvider: selectedPaymentProvider,
    // hasPaymentCollection: !!currentCart.payment_collection,
    // hasPaymentSessions: !!currentCart.payment_collection?.payment_sessions?.length
  // })

  let cartRes;
  
  try {
    if (selectedPaymentProvider === "manual_manual") {
      // console.log("💰 使用銀行轉帳，嘗試直接提交訂單")
      
      // 銀行轉帳不需要支付集合，但可能需要在 metadata 中標記
      if (!currentCart.payment_collection) {
        // console.log("🔧 銀行轉帳: 先更新購物車 metadata")
        await sdk.store.cart.update(
          id,
          {
            metadata: {
              ...currentCart.metadata,
              selected_payment_provider: "manual_manual",
              payment_method: "bank_transfer",
              payment_status: "pending"
            }
          },
          {},
          headers
        )
      }
    }
    
    cartRes = await sdk.store.cart.complete(id, {}, headers)
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
  } catch (error: any) {
    // console.error("❌ 訂單提交失敗:", error)
    // console.error("錯誤詳情:", {
      // message: error?.message,
      // status: error?.status,
      // statusText: error?.statusText,
      // response: error?.response?.data || error?.response,
      // stack: error?.stack?.split('\n').slice(0, 5)
    // })
    
    // 如果是支付集合未初始化錯誤，根據支付方式採取不同策略
    if (error?.message?.includes("Payment collection has not been initiated")) {
      // console.log("🔧 處理支付集合未初始化錯誤")
      
      if (selectedPaymentProvider === "manual_manual") {
        // console.log("🏦 銀行轉帳: 嘗試使用替代策略")
        
        try {
          // 策略: 對於銀行轉帳，我們嘗試用 ECPay provider 創建支付集合
          // 然後在訂單創建後通過 metadata 標記為銀行轉帳
          // console.log("🔄 使用 ECPay provider 作為技術基礎建立支付集合")
          
          await sdk.client.fetch<any>(
            `/store/carts/${id}/payment-collection`,
            {
              method: "POST",
              headers: {
                ...headers,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                provider_id: "ecpay_credit_card"
              }),
            }
          )
          
          // console.log("✅ 技術支付集合建立成功:", paymentCollection)
          
          // 更新購物車 metadata 標記為銀行轉帳
          await sdk.store.cart.update(id, {
            metadata: {
              selected_payment_provider: "manual_manual",
              payment_method: "bank_transfer",
              technical_provider: "ecpay_credit_card",
              payment_status: "pending_manual_confirmation"
            }
          })
          
          // console.log("✅ 已標記為銀行轉帳模式")
          
          // 重新嘗試提交訂單
          // console.log("🔄 重新提交銀行轉帳訂單")
          cartRes = await sdk.store.cart.complete(id, {}, headers)
          
          const cartCacheTag = await getCacheTag("carts")
          revalidateTag(cartCacheTag)
          
        } catch (retryError: any) {
          // console.error("❌ 銀行轉帳重試失敗:", {
            // originalError: error.message,
            // retryError: retryError?.message,
            // status: retryError?.status,
            // response: retryError?.response?.data
          // })
          
          // 對於銀行轉帳，如果還是失敗，給出特定的錯誤信息
          throw new Error(`銀行轉帳訂單提交失敗：${retryError?.message || error.message}。請聯絡客服協助處理`)
        }
      } else {
        // 非銀行轉帳的支付方式
        throw new Error(`支付方式 ${selectedPaymentProvider} 尚未初始化，請重新選擇支付方式`)
      }
    } else {
      // 其他錯誤直接拋出
      const errorMessage = error?.response?.data?.message || error?.message || "訂單提交時發生未知錯誤"
      throw new Error(`訂單提交失敗：${errorMessage}`)
    }
  }

  if (cartRes?.type === "order") {
    // console.log("✅ 訂單建立成功:", cartRes.order.id)
    
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  
  // 如果沒有購物車 ID，返回空的運送選項
  if (!cartId) {
    return { shipping_options: [] }
  }
  
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  }).catch(() => {
    return { shipping_options: [] }
  })
}



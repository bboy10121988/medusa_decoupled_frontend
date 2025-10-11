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
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    console.log('🔍 retrieveCustomer - 檢查認證標頭:', {
      hasHeaders: !!authHeaders,
      hasAuth: !!(authHeaders as any)?.authorization,
      headerKeys: authHeaders ? Object.keys(authHeaders) : []
    })

    if (!authHeaders || !(authHeaders as any)?.authorization) {
      console.log('❌ retrieveCustomer - 無認證標頭，返回 null')
      return null
    }

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    try {
      console.log('📡 retrieveCustomer - 發送請求到 Medusa 後端')
      const result = await sdk.client
        .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
          method: "GET",
          query: {
            fields: "*orders",
          },
          headers,
          next,
          cache: "no-cache", // 改為 no-cache 確保獲取最新狀態
        })
        .then(({ customer }) => {
          console.log('✅ retrieveCustomer - 成功獲取客戶資料:', {
            hasCustomer: !!customer,
            email: customer?.email,
            id: customer?.id
          })
          return customer
        })
      
      return result
    } catch (error) {
      console.error('❌ retrieveCustomer - 獲取客戶資訊失敗:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      return null
    }
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  // 驗證必填欄位
  if (!customerForm.email || !password || !customerForm.first_name || !customerForm.last_name) {
    return "請填寫所有必填欄位"
  }

  // 驗證電子郵件格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(customerForm.email)) {
    return "請輸入有效的電子郵件地址"
  }

  // 驗證密碼強度
  if (password.length < 6) {
    return "密碼長度至少需要 6 個字元"
  }

  try {
    console.log("🔐 開始傳統註冊流程:", { email: customerForm.email })
    
    // 使用標準 Medusa SDK 進行註冊
    const registerToken = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    console.log("✅ 註冊成功，獲得 token:", { hasToken: !!registerToken })

    // 先設置註冊 token 來創建客戶資料
    await setAuthToken(registerToken)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    console.log("✅ 客戶資料創建成功:", { 
      customerId: createdCustomer?.id, 
      email: createdCustomer?.email 
    })

    // 註冊後自動登入以獲得完整的認證狀態
    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    console.log("✅ 自動登入成功，設置最終 token")
    await setAuthToken(loginToken as string)

    // 清除快取並轉移購物車
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    console.log("🎉 註冊流程完成，客戶應已登入")
    return createdCustomer
  } catch (error: any) {
    console.error("註冊錯誤:", error)
    
    // 處理註冊錯誤
    if (error.message || error.response?.data?.message) {
      const errorMessage = error.message || error.response.data.message
      
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || 
          errorMessage.includes('已存在') || errorMessage.includes('conflict')) {
        return "該電子郵件地址已被註冊，請使用其他郵件地址或嘗試登入"
      }
      
      if (errorMessage.includes('invalid email') || errorMessage.includes('email')) {
        return "電子郵件地址格式不正確"
      }
      
      if (errorMessage.includes('password') || errorMessage.includes('密碼')) {
        return "密碼不符合要求，請確保長度至少 6 個字元"
      }
      
      return errorMessage
    }
    
    return "註冊失敗，請稍後再試"
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // 驗證必填欄位
  if (!email || !password) {
    return "請輸入電子郵件和密碼"
  }

  // 驗證電子郵件格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "請輸入有效的電子郵件地址"
  }

  try {
    // 使用標準 Medusa SDK 進行登入
    const token = await sdk.auth.login("customer", "emailpass", { email, password })
    
    await setAuthToken(typeof token === 'string' ? token : token.location)
    
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    
  } catch (error: any) {
    console.error("登入錯誤:", error)
    
    // 處理登入錯誤
    if (error.message || error.response?.data?.message) {
      const errorMessage = error.message || error.response.data.message
      
      if (errorMessage.includes('unauthorized') || errorMessage.includes('invalid credentials') ||
          errorMessage.includes('401') || errorMessage.includes('authentication failed')) {
        return "電子郵件或密碼錯誤，請檢查後重試"
      }
      
      // 處理帳戶不存在的情況
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        return "找不到此電子郵件的帳戶，請先註冊"
      }
      
      return errorMessage
    }
    
    return "登入失敗，請稍後再試"
  }

  try {
    await transferCart()
  } catch (error: any) {
    console.error("購物車轉移錯誤:", error)
    // 購物車轉移失敗不應該阻止登入成功
  }

  // 登入成功後重定向到 account 頁面
  redirect("/tw/account")
}

export async function signout(countryCode: string) {
  try {
    console.log('🔓 開始簡單 SDK 登出')
    
    // 使用 Medusa SDK 的官方登出方法
    await sdk.auth.logout()
    console.log('✅ Medusa SDK 登出成功')
    
    // 清除認證令牌
    await removeAuthToken()
    console.log('🧹 已清除認證令牌')

    // 清除購物車 ID
    await removeCartId()
    console.log('🛒 已清除購物車 ID')

    // 重新驗證相關緩存
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    console.log('🔄 已重新驗證緩存')
    
  } catch (error) {
    console.error('❌ SDK 登出過程中發生錯誤:', error)
    // 即使 SDK 登出失敗，仍清除本地狀態
    await removeAuthToken()
    await removeCartId()
  }

  // 重定向到帳戶登入頁面
  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  try {
    const cartId = await getCartId()

    if (!cartId) {
      return
    }

    const headers = await getAuthHeaders()
    
    if (!headers) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔐 transferCart: 無驗證 headers，跳過轉移')
      }
      return
    }

    await sdk.store.cart.transferCart(cartId, {}, headers)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ transferCart: 購物車轉移成功')
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ transferCart 失敗:', error)
    }
    // 不重新拋出錯誤，避免影響用戶體驗
  }
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

/**
 * 確保購物車與用戶正確關聯
 * 如果轉移失敗，嘗試重新創建關聯
 */
async function ensureCartAssociation() {
  const cartId = await getCartId()
  const headers = await getAuthHeaders()
  
  if (!cartId || !headers) {
    return
  }

  try {
    // 嘗試獲取當前購物車
    const cart = await sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(`/store/carts/${cartId}`, {
      method: "GET",
      headers,
    })

    // 如果購物車已經有 customer_id，就不需要處理
    if (cart.cart.customer_id) {
      return
    }

    // 嘗試再次轉移購物車
    await sdk.store.cart.transferCart(cartId, {}, headers)
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    console.log("購物車重新轉移成功")
  } catch (error) {
    console.error("購物車重新轉移失敗:", error)
    // 如果還是失敗，清除本地購物車 ID，讓系統創建新的
    await removeCartId()
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    console.log("已清除本地購物車，系統將創建新的購物車")
  }
}

export async function handleGoogleCallback(token: string) {
  try {
    console.log("🔐 處理 Google 登入回調")
    
    await setAuthToken(token)
    
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    
    await transferCart()
    
    console.log("✅ Google 登入成功")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Google 登入回調處理失敗:", error)
    return { success: false, error: error.message || "處理失敗" }
  }
}

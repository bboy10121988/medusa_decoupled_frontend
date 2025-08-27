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
    // 檢查是否是 Google OAuth token
    const cookies = await import('next/headers').then(m => m.cookies())
    const token = (await cookies).get("_medusa_jwt")?.value
    
    if (token?.startsWith('google_oauth:')) {
      // 處理 Google OAuth 用戶
      try {
        const sessionData = JSON.parse(token.replace('google_oauth:', ''))
        console.log('找到 Google OAuth 會話:', sessionData)
        
        // 返回 Google OAuth 用戶資料
        return {
          id: sessionData.customer_id,
          email: sessionData.email,
          first_name: sessionData.first_name,
          last_name: sessionData.last_name,
          company_name: null,
          phone: null,
          has_account: true,
          metadata: {
            auth_provider: 'google'
          },
          addresses: [],
          default_billing_address_id: null,
          default_shipping_address_id: null,
          created_at: sessionData.created_at,
          updated_at: sessionData.created_at,
        } as unknown as HttpTypes.StoreCustomer
      } catch (error) {
        console.error('無法解析 Google OAuth 會話:', error)
        return null
      }
    }

    if (token?.startsWith('medusa_google_')) {
      // 處理 Medusa Google token
      try {
        const tokenData = token.replace('medusa_google_', '')
        const sessionData = JSON.parse(Buffer.from(tokenData, 'base64').toString())
        
        // 檢查 token 是否過期
        if (sessionData.expires_at && Date.now() > sessionData.expires_at) {
          console.log('Google token 已過期')
          return null
        }
        
        console.log('找到 Medusa Google 會話:', sessionData)
        
        // 返回 Google 用戶資料
        return {
          id: sessionData.customer_id,
          email: sessionData.email,
          first_name: sessionData.first_name || '',
          last_name: sessionData.last_name || '',
          company_name: null,
          phone: null,
          has_account: true,
          metadata: {
            auth_provider: 'google'
          },
          addresses: [],
          default_billing_address_id: null,
          default_shipping_address_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as HttpTypes.StoreCustomer
      } catch (error) {
        console.error('無法解析 Medusa Google token:', error)
        return null
      }
    }

    // 只有在不是 Google token 的情況下才獲取授權標頭
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    // 處理一般的 Medusa JWT token
    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
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
    // 使用標準 Medusa SDK 進行註冊
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    // 註冊後自動登入
    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

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
    
    await setAuthToken(token as string)
    
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
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

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

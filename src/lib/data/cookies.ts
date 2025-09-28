import "server-only"
import { cookies as nextCookies } from "next/headers"

export const getAuthHeaders = async (): Promise<
  { authorization: string; 'x-publishable-api-key'?: string } | { 'x-publishable-api-key'?: string }
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value
    
    // 總是包含 publishable key
    const headers: { authorization?: string; 'x-publishable-api-key'?: string } = {}
    
    // 添加 publishable key (如果有)
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    if (!token) {
      return headers
    }

    // 如果是 Google OAuth token，不返回授權標頭
    if (token.startsWith('google_oauth:') || token.startsWith('medusa_google_')) {
      return headers
    }

    headers.authorization = `Bearer ${token}`
    return headers
  } catch {
    // 即使出錯也返回 publishable key
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      return { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY }
    }
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    // Allow sending/setting cookie on top-level navigations coming from external OAuth
    // providers (Google). Lax is a safe default for auth cookies in this flow.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  const cartId = cookies.get("_medusa_cart_id")?.value
  if (process.env.NODE_ENV === 'development') console.log("🛒 Get Cart ID:", cartId || "❌ No cart ID found in cookies")
  return cartId
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false, // 前端需要讀取
    sameSite: "lax", // 支援跨請求
    secure: process.env.NODE_ENV === "production",
  })
  if (process.env.NODE_ENV === 'development') console.log("🍪 設定 Cart ID 到 cookies:", cartId)
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  })
}

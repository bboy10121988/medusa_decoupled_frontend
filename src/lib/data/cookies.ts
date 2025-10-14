import "server-only"
import { cookies as nextCookies } from "next/headers"

// Optional cookie domain (set this to ".timsfantasyworld.com" in production if you
// need the cookie to be shared across subdomains). If not set, cookies remain host-only.
// ⚠️ 在開發環境中不設置 domain，避免 localhost cookie 問題
const COOKIE_DOMAIN = process.env.NODE_ENV === "production" 
  ? process.env.NEXT_PUBLIC_COOKIE_DOMAIN 
  : undefined

export const getAuthHeaders = async (): Promise<
  { authorization: string; 'x-publishable-api-key'?: string } | { 'x-publishable-api-key'?: string }
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value
    
    console.log('🔍 getAuthHeaders - 檢查 token:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 30)}...` : null,
      cookieName: '_medusa_jwt',
      allCookies: Array.from(cookies.getAll()).map(c => c.name)
    })
    
    // 總是包含 publishable key
    const headers: { authorization?: string; 'x-publishable-api-key'?: string } = {}
    
    // 添加 publishable key (如果有)
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    if (!token) {
      console.log('❌ getAuthHeaders - 沒有找到 token，返回僅含 publishable key 的 headers')
      return headers
    }

    headers.authorization = `Bearer ${token}`
    console.log('✅ getAuthHeaders - 設置 authorization header')
    return headers
  } catch (error) {
    console.error('❌ getAuthHeaders 錯誤:', error)
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
  console.log("📝 setAuthToken 開始", {
    tokenLength: token?.length || 0,
    tokenPreview: token ? token.substring(0, 50) + "..." : null,
    env: process.env.NODE_ENV,
    cookieDomain: COOKIE_DOMAIN
  })
  
  const cookies = await nextCookies()
  
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    // Allow sending/setting cookie on top-level navigations coming from external OAuth
    // providers (Google). Lax is a safe default for auth cookies in this flow.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: COOKIE_DOMAIN,
    path: "/", // 確保 cookie 路徑一致
  })
  
  console.log("✅ setAuthToken 完成 - _medusa_jwt cookie 已設置")
  
  // 🔍 調試用：額外設置一個可在瀏覽器中查看的 JWT cookie
  // 只在開發環境中設置，並截取 token 的前 100 字符以便查看
  if (process.env.NODE_ENV === "development") {
    cookies.set("_debug_jwt_preview", token.substring(0, 200) + "...", {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false, // 允許在瀏覽器中查看
      sameSite: "lax",
      secure: false, // 開發環境中不需要 HTTPS
      domain: COOKIE_DOMAIN,
      path: "/", // 確保路徑一致
    })
    
    // 🔍 完整的 JWT token 用於調試（僅開發環境）
    cookies.set("_debug_jwt_full", token, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false, // 允許在瀏覽器中查看
      sameSite: "lax", 
      secure: false,
      domain: COOKIE_DOMAIN,
      path: "/", // 確保路徑一致
    })
    
    console.log("✅ setAuthToken 完成 - Debug cookies 已設置 (_debug_jwt_preview, _debug_jwt_full)")
  }
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: COOKIE_DOMAIN,
    path: "/",
  })
  
  // 🔍 同時移除調試 cookies
  if (process.env.NODE_ENV === "development") {
    cookies.set("_debug_jwt_preview", "", {
      maxAge: -1,
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      domain: COOKIE_DOMAIN,
      path: "/",
    })
    
    cookies.set("_debug_jwt_full", "", {
      maxAge: -1,
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      domain: COOKIE_DOMAIN,
      path: "/",
    })
  }
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
    domain: COOKIE_DOMAIN,
  })
  if (process.env.NODE_ENV === 'development') console.log("🍪 設定 Cart ID 到 cookies:", cartId)
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: COOKIE_DOMAIN,
    path: "/",
  })
}

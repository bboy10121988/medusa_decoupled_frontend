import { NextRequest, NextResponse } from "next/server"
import Medusa from "@medusajs/js-sdk"
import { getApiConfig } from "@lib/config"
import { getCacheTag, removeAuthToken, removeCartId } from "@lib/data/cookies"
import { cookies as nextCookies } from "next/headers"
import { revalidateTag } from "next/cache"

const performLogout = async () => {
  const config = getApiConfig()
  const medusa = new Medusa({
    baseUrl: config.baseUrl,
    publishableKey: config.publishableKey,
  })

  const cookieStore = await nextCookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (token) {
    medusa.client.setToken(token)
    try {
      await medusa.auth.logout()
    } catch (error) {
      console.warn("Medusa SDK logout failed:", error)
    }
  }

  await removeAuthToken()
  await removeCartId()

  // 清除額外的認證相關 cookies，包括 Google OAuth 相關
  const additionalCookiesToClear = [
    "_medusa_customer_id",
    "medusa-auth-token", 
    "next-auth.session-token",
    "next-auth.callback-url",
    "next-auth.csrf-token",
    "auth-token",
    "auth_session",
    "__Secure-next-auth.session-token",
    "__Host-next-auth.csrf-token",
    "connect.sid",
    "session",
    // Google OAuth 相關 cookies
    "g_state",
    "g_csrf_token",
    "google_oauth_state",
    "oauth_state",
    "gsi_callback_data",
    "__gads",
    "__gpi",
    "_gcl_au",
    // Google Identity Services cookies
    "g_enabled_idps",
    "g_session_check",
    "g_accounts_check", 
    "google_auto_select",
    "1P_JAR",
    "APISID",
    "SAPISID",
    "HSID",
    "SSID",
    "SID",
    // Google 帳戶選擇相關
    "ACCOUNT_CHOOSER",
    "LSOLH",
    "LSID",
    // 調試用 cookies
    "_debug_jwt_preview",
    "_debug_jwt_full"
  ]

  for (const cookieName of additionalCookiesToClear) {
    // 清除多個路徑和域名的 cookies
    const paths = ["/", "/tw", "/tw/", "/auth", "/auth/google"]
    const domains = ["", "localhost", ".localhost", ".google.com", ".accounts.google.com"]
    
    paths.forEach(path => {
      domains.forEach(domain => {
        cookieStore.set(cookieName, "", {
          maxAge: -1,
          httpOnly: false,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: path,
          ...(domain && { domain: domain })
        })
      })
    })
    
    // 基本清除
    cookieStore.set(cookieName, "", {
      maxAge: -1,
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  }

  try {
    const customerTag = await getCacheTag("customers")
    if (customerTag) {
      revalidateTag(customerTag)
    }

    const cartTag = await getCacheTag("carts")
    if (cartTag) {
      revalidateTag(cartTag)
    }
  } catch (error) {
    console.warn("Failed to revalidate auth caches:", error)
  }
}

export async function POST(request: NextRequest) {
  await performLogout()

  const redirectParam = request.nextUrl.searchParams.get("redirect")

  return NextResponse.json({
    success: true,
    redirect: redirectParam ?? null,
  })
}

export async function GET(request: NextRequest) {
  await performLogout()

  const redirectParam = request.nextUrl.searchParams.get("redirect") || "/"
  
  // 確保在生產環境中使用正確的域名
  let origin = request.nextUrl.origin
  
  // 如果在 VM 環境中（localhost:8000），使用生產域名
  if (origin.includes('localhost:8000') && process.env.NEXT_PUBLIC_BASE_URL) {
    origin = process.env.NEXT_PUBLIC_BASE_URL
  }
  
  const redirectUrl = new URL(redirectParam, origin)
  
  // 添加一個查詢參數來強制頁面重新載入，清除任何殘留的 Google OAuth 狀態
  redirectUrl.searchParams.set('_logout', Date.now().toString())
  redirectUrl.searchParams.set('_clear_oauth', '1')

  const response = NextResponse.redirect(redirectUrl.toString(), {
    status: 302,
  })
  
  // 額外設置響應標頭來清除緩存
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

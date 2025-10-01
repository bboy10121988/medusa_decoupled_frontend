import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

// 讓此路由永遠動態、不可快取，避免因 ISR 或快取造成延遲或狀態殘留
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// 最多花在等待後端 SDK logout 的時間（毫秒）。超過就直接返回，避免使用者體感延遲。
const LOGOUT_AWAIT_TIMEOUT_MS = 500

const COOKIES_TO_CLEAR = [
  "_medusa_jwt",
  "_medusa_cart_id",
  "_medusa_cache_id",
  "_affiliate_jwt",
  "_affiliate_admin_jwt",
  "connect.sid",
  "session",
  "_medusa_customer_id",
  "medusa-auth-token",
  "next-auth.session-token",
  "next-auth.callback-url",
  "next-auth.csrf-token",
  "auth-token",
  "auth_session",
  "google-oauth-state",
  "__Secure-next-auth.session-token",
  "__Host-next-auth.csrf-token",
  "google-auth-state",
]

const clearCookies = (response: NextResponse) => {
  COOKIES_TO_CLEAR.forEach((cookieName) => {
    response.cookies.delete(cookieName)

    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })

    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/tw",
    })

    response.cookies.set(cookieName, "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })
  })

  response.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"')
  response.headers.set("X-Clear-Auth-State", "true")
}

const createRedirectResponse = (request: NextRequest, redirect?: string | null) => {
  if (!redirect) {
    return null
  }

  const baseUrl = new URL(request.url).origin
  const redirectUrl = redirect.startsWith("/") ? `${baseUrl}${redirect}` : redirect
  console.log("🚀 執行伺服器端重定向到:", redirectUrl)

  const response = NextResponse.redirect(redirectUrl, { status: 302 })
  clearCookies(response)
  return response
}

const performLogout = async (request: NextRequest) => {
  console.log("🚪 開始後端登出流程...")
  const url = new URL(request.url)
  const redirect = url.searchParams.get("redirect")
  const fast = url.searchParams.get("fast") === "1"

  // 啟動非同步 logout，不阻塞主要流程，提升體感速度
  const logoutPromise = (async () => {
    try {
      await sdk.auth.logout()
      console.log("✅ Medusa SDK 登出成功")
    } catch (sdkError) {
      console.log("⚠️ SDK 登出失敗，已忽略 (cookies 仍會被清除):", sdkError)
    }
  })()

  if (!fast) {
    // 只有非 fast 模式才會有限度等待 SDK 完成
    try {
      await Promise.race([
        logoutPromise,
        new Promise((resolve) => setTimeout(resolve, LOGOUT_AWAIT_TIMEOUT_MS)),
      ])
    } catch (e) {
      console.log("⚠️ 等待 SDK logout race 發生錯誤，忽略。")
    }
  } else {
    console.log("⚡ fast=1 已啟用，跳過等待 SDK logout 完成")
  }

  console.log("🧹 清除 cookies:", COOKIES_TO_CLEAR)

  const redirectResponse = createRedirectResponse(request, redirect)
  if (redirectResponse) {
    redirectResponse.headers.set("X-Logout-Mode", fast ? "fast" : "normal")
    return redirectResponse
  }

  const response = NextResponse.json({ success: true, message: "登出成功" }, { status: 200 })
  clearCookies(response)
  response.headers.set("X-Logout-Mode", fast ? "fast" : "normal")
  console.log("✅ 登出完成，所有認證狀態已清除，支援帳號重新選擇")
  return response
}

const handleLogoutError = () => {
  const response = NextResponse.json(
    { success: false, message: "登出過程中發生錯誤，但 cookies 已清除" },
    { status: 200 }
  )

  clearCookies(response)
  return response
}

export async function GET(request: NextRequest) {
  try {
    return await performLogout(request)
  } catch (error) {
    console.error("❌ GET 登出過程中發生錯誤:", error)
    return handleLogoutError()
  }
}

export async function POST(request: NextRequest) {
  try {
    return await performLogout(request)
  } catch (error) {
    console.error("❌ POST 登出過程中發生錯誤:", error)
    return handleLogoutError()
  }
}

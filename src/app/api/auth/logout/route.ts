import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

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

  try {
    await sdk.auth.logout()
    console.log("✅ Medusa SDK 登出成功")
  } catch (sdkError) {
    console.log("⚠️ SDK 登出失敗，繼續清除 cookies:", sdkError)
  }

  console.log("🧹 清除 cookies:", COOKIES_TO_CLEAR)

  const url = new URL(request.url)
  const redirect = url.searchParams.get("redirect")

  const redirectResponse = createRedirectResponse(request, redirect)
  if (redirectResponse) {
    return redirectResponse
  }

  const response = NextResponse.json({ success: true, message: "登出成功" }, { status: 200 })
  clearCookies(response)
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

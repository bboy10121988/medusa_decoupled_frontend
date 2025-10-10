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

  // 清除額外的認證相關 cookies
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
    "session"
  ]

  for (const cookieName of additionalCookiesToClear) {
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
  const redirectUrl = new URL(redirectParam, request.nextUrl.origin)

  return NextResponse.redirect(redirectUrl.toString(), {
    status: 302,
  })
}

import { NextRequest, NextResponse } from "next/server"
import Medusa from "@medusajs/js-sdk"
import { getApiConfig } from "@lib/config"
import { getCacheTag, getCartId, setAuthToken } from "@lib/data/cookies"
import { revalidateTag } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "請輸入電子郵件和密碼",
        },
        { status: 400 }
      )
    }

    const medusa = new Medusa(getApiConfig())
    const result = await medusa.auth.login("customer", "emailpass", { email, password })

    if (typeof result !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "登入流程需要額外驗證，請使用預設登入表單。",
        },
        { status: 400 }
      )
    }

    await setAuthToken(result)

    try {
      const cartId = await getCartId()

      if (cartId) {
        await medusa.store.cart.transferCart(cartId, {}, {})
      }
    } catch (cartError) {
      console.warn("登入後轉移購物車失敗:", cartError)
    }

    try {
      const customerTag = await getCacheTag("customers")
      if (customerTag) {
        revalidateTag(customerTag)
      }
    } catch (error) {
      console.warn("重新驗證客戶快取失敗:", error)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("登入 API 發生錯誤:", error)

    const message =
      error?.message?.includes("unauthorized") || error?.message?.includes("401")
        ? "電子郵件或密碼錯誤，請重新輸入"
        : "登入失敗，請稍後再試"

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}

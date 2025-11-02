import { addToCart, getOrSetCart } from "@lib/data/cart"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { variantId, quantity = 1, countryCode = "tw" } = body

    // console.log("🛒 Add to Cart API called:", { variantId, quantity, countryCode })

    if (!variantId) {
      return NextResponse.json(
        { error: "Missing variant ID" },
        { status: 400 }
      )
    }

    // 先獲取或建立購物車
    const cart = await getOrSetCart(countryCode)
    if (!cart) {
      throw new Error("Failed to create or retrieve cart")
    }

    // console.log("📦 Cart 資訊:", { cartId: cart.id })

    await addToCart({
      variantId,
      quantity,
      countryCode,
    })

    // console.log("✅ 商品成功加入購物車")

    // 建立 response 並設定 cookie
    const response = NextResponse.json({ 
      success: true,
      message: "商品已加入購物車",
      cartId: cart.id
    })

    // 在 response 中設定 cookie
    response.cookies.set("_medusa_cart_id", cart.id, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      path: "/"
    })

    // console.log("🍪 API Response 設定 Cart ID cookie:", cart.id)

    return response
  } catch (error) {
    // console.error("❌ Add to cart API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to add to cart",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getOrSetCart, addToCart } from "@lib/data/cart"

export async function GET(request: NextRequest) {
  try {
    // 從查詢參數或預設值獲取 countryCode
    const url = new URL(request.url)
    const countryCode = url.searchParams.get('countryCode') || 'tw'
    
    const cart = await getOrSetCart(countryCode)
    return NextResponse.json({ cart })
  } catch (error) {
    return NextResponse.json({ cart: null }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { variantId, quantity = 1, countryCode = 'tw' } = body

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      )
    }

    // console.log("🛒 API Route 處理加入購物車:", { variantId, quantity, countryCode })

    // 使用現有的 addToCart 函數
    await addToCart({
      variantId,
      quantity,
      countryCode,
    })

    // 重新獲取購物車資料
    const updatedCart = await getOrSetCart(countryCode)
    
    // console.log("✅ API Route 加入購物車成功")
    return NextResponse.json({ 
      success: true, 
      cart: updatedCart,
      message: "Item added to cart successfully" 
    })
  } catch (error) {
    // console.error("❌ API Route 加入購物車失敗:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to add item to cart",
        success: false 
      },
      { status: 500 }
    )
  }
}
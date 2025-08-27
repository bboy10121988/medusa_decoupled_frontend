import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // 嘗試從前端 localStorage 或 cookie 獲取 cart ID
    let cartId = null
    
    // 從 cookie 中嘗試獲取
    cartId = request.cookies.get("_medusa_cart_id")?.value
    
    console.log("🛒 Get Cart ID API:", cartId || "❌ No cart ID found")
    
    return NextResponse.json({ 
      cartId: cartId || null
    })
  } catch (error) {
    console.error("❌ Get cart ID error:", error)
    return NextResponse.json(
      { error: "Failed to get cart ID" },
      { status: 500 }
    )
  }
}

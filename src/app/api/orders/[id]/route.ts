import { retrieveOrder } from "../../../../lib/data/orders"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    // console.log("🔍 API route: 獲取訂單", id)
    const order = await retrieveOrder(id)
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // console.log("✅ API route: 訂單獲取成功", order.id)
    return NextResponse.json({ order })
  } catch (error: any) {
    // console.error("❌ API route: 訂單獲取失敗", error)
    return NextResponse.json(
      { error: error.message || "Failed to retrieve order" },
      { status: 500 }
    )
  }
}

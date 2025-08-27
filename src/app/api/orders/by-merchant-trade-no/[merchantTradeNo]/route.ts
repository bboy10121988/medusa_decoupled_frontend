import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { merchantTradeNo: string } }
) {
  const { merchantTradeNo } = params

  try {
    // 調用後端 API 查詢訂單
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/orders/by-merchant-trade-no/${merchantTradeNo}`,
      {
        headers: {
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const order = await response.json()
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

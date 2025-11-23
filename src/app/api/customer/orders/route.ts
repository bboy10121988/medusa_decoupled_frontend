import { NextRequest, NextResponse } from "next/server"
import { listOrders } from "@lib/data/orders"

export async function GET(_request: NextRequest) {
  try {
    const orders = await listOrders(20, 0) // 獲取最近 20 筆訂單
    return NextResponse.json({ orders: orders || [] })
  } catch (error) {
    // console.error('獲取客戶訂單失敗:', error)
    return NextResponse.json({ orders: [] }, { status: 200 })
  }
}
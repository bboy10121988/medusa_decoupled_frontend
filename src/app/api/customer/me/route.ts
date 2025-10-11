import { NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"

export async function GET() {
  try {
    const headers = await getAuthHeaders()

    console.log("📡 API Route: 獲取客戶資料", {
      hasHeaders: !!headers,
      hasAuth: !!(headers as any)?.authorization
    })

    if (!headers || !(headers as any)?.authorization) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const { customer } = await sdk.store.customer.retrieve({}, headers)

    console.log("✅ API Route: 成功獲取客戶資料", {
      email: customer.email,
      id: customer.id
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error("❌ API Route: 獲取客戶資料失敗:", error)
    return NextResponse.json(
      { error: "Failed to retrieve customer" },
      { status: 500 }
    )
  }
}

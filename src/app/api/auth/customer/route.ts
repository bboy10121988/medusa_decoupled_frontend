import { NextRequest, NextResponse } from "next/server"
import { retrieveCustomer } from "@lib/data/customer"

export async function GET(_request: NextRequest) {
  try {
    const customer = await retrieveCustomer()

    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 401 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error("取得客戶資料失敗:", error)
    return NextResponse.json({ customer: null }, { status: 500 })
  }
}

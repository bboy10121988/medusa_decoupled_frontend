import { NextRequest, NextResponse } from 'next/server'
import { retrieveCustomer } from "@lib/data/customer"

export async function GET(request: NextRequest) {
  try {
    const customer = await retrieveCustomer().catch(() => null)
    
    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 200 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('獲取客戶資料失敗:', error)
    return NextResponse.json(
      { customer: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
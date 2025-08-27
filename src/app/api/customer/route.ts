import { NextRequest, NextResponse } from "next/server"
import { retrieveCustomer } from "@lib/data/customer"

export async function GET(request: NextRequest) {
  try {
    const customer = await retrieveCustomer()
    return NextResponse.json({ customer })
  } catch (error) {
    return NextResponse.json({ customer: null }, { status: 404 })
  }
}

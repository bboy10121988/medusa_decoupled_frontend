import { NextRequest, NextResponse } from "next/server"
import { listRegions } from "@lib/data/regions"

export async function GET(request: NextRequest) {
  try {
    const regions = await listRegions()
    return NextResponse.json({ regions })
  } catch (error) {
    return NextResponse.json({ regions: [] }, { status: 500 })
  }
}

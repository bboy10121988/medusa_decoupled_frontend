import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("_medusa_jwt")?.value
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    return NextResponse.json({ 
      authenticated: true
    }, { status: 200 })

  } catch (error) {
    // console.error("Auth check error:", error)
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}

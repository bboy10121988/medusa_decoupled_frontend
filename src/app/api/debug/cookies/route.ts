import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    const jwtCookie = cookieStore.get("_medusa_jwt")
    const debugPreview = cookieStore.get("_debug_jwt_preview")
    const debugFull = cookieStore.get("_debug_jwt_full")
    
    // console.log("🍪 調試 Cookie 狀態:", {
      // totalCookies: allCookies.length,
      // hasJwtCookie: !!jwtCookie,
      // jwtValue: jwtCookie?.value ? `${jwtCookie.value.substring(0, 50)}...` : null,
      // hasDebugPreview: !!debugPreview,
      // hasDebugFull: !!debugFull,
      // allCookieNames: allCookies.map(c => c.name)
    // })

    return NextResponse.json({
      success: true,
      cookies: {
        total: allCookies.length,
        jwt: jwtCookie ? {
          name: jwtCookie.name,
          hasValue: !!jwtCookie.value,
          valuePreview: jwtCookie.value ? `${jwtCookie.value.substring(0, 100)}...` : null
        } : null,
        debugPreview: debugPreview ? {
          name: debugPreview.name,
          value: debugPreview.value
        } : null,
        all: allCookies.map(cookie => ({
          name: cookie.name,
          hasValue: !!cookie.value,
          valueLength: cookie.value?.length || 0
        }))
      }
    })
  } catch (error) {
    // console.error("❌ 調試 Cookie 失敗:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
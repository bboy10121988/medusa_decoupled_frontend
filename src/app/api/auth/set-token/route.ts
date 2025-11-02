import { NextRequest, NextResponse } from "next/server"
import { setAuthToken } from "@lib/data/cookies"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    // console.log("🔐 API Route: 收到 set-token 請求", {
      // hasToken: !!token,
      // tokenType: typeof token,
      // tokenLength: token?.length || 0,
      // tokenPreview: token ? token.substring(0, 50) + "..." : null
    // })

    if (!token || typeof token !== "string") {
      // console.error("❌ API Route: Token 無效", { token })
      return NextResponse.json(
        { success: false, message: "缺少 token" },
        { status: 400 }
      )
    }

    await setAuthToken(token)
    
    // console.log("✅ API Route: Token 已存儲到 cookies")

    return NextResponse.json({ 
      success: true,
      message: "Token successfully stored in cookies"
    })
  } catch (error) {
    // console.error("❌ API Route: 設定認證 token 失敗:", error)
    return NextResponse.json(
      { success: false, message: "設定認證 cookie 失敗" },
      { status: 500 }
    )
  }
}

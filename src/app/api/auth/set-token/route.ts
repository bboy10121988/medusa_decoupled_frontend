import { NextRequest, NextResponse } from "next/server"
import { setAuthToken } from "@lib/data/cookies"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "缺少 token" },
        { status: 400 }
      )
    }

    await setAuthToken(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("設定認證 token 失敗:", error)
    return NextResponse.json(
      { success: false, message: "設定認證 cookie 失敗" },
      { status: 500 }
    )
  }
}

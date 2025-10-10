import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: "需要 email" }, { status: 400 })
    }

    const password = `google_${Date.now()}`
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    console.log("🔍 直接註冊測試:", { email, baseUrl, hasKey: !!publishableKey })

    // 直接調用 Medusa emailpass 註冊
    const response = await fetch(`${baseUrl}/auth/customer/emailpass/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || '',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })

    console.log("📡 回應狀態:", response.status)
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: "註冊成功！",
        token: data.token,
        email: email
      })
    } else {
      const errorText = await response.text()
      console.error("❌ 錯誤:", errorText)
      return NextResponse.json({
        success: false,
        error: errorText,
        statusCode: response.status
      })
    }

  } catch (error) {
    console.error("❌ 異常:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
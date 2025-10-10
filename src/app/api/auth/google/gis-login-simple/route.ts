import { NextRequest, NextResponse } from "next/server"

/**
 * Google Identity Services (GIS) 登入處理 - 簡化版本
 * 直接複製成功的 test-direct-register 邏輯
 */
export async function POST(request: NextRequest) {
  try {
    const { credential, user_info } = await request.json()

    if (!credential || !user_info) {
      return NextResponse.json(
        { success: false, message: "缺少登入憑證或用戶資訊" },
        { status: 400 }
      )
    }

    console.log("🔐 處理 Google Identity Services 登入 (簡化版):", {
      email: user_info.email,
      name: user_info.name,
      timestamp: new Date().toISOString()
    })

    // 使用和 test-direct-register 完全相同的邏輯
    const password = `google_${Date.now()}`
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    console.log("🔍 GIS 註冊:", { email: user_info.email, baseUrl, hasKey: !!publishableKey })

    // 直接調用 Medusa emailpass 註冊
    const response = await fetch(`${baseUrl}/auth/customer/emailpass/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || '',
      },
      body: JSON.stringify({
        email: user_info.email,
        password: password,
      }),
    })

    console.log("📡 回應狀態:", response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log("✅ GIS 註冊成功:", data)
      
      const apiResponse = NextResponse.json({
        success: true,
        message: `歡迎，${user_info.name}！Google 登入並註冊成功`,
        token: data.token,
        email: user_info.email,
        user: user_info,
        redirectTo: "/tw/account"
      })

      // 設置安全的 HTTP-only Cookie
      if (data.token) {
        apiResponse.cookies.set('medusa-auth-token', data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 天
        })
      }

      return apiResponse
    } else {
      const errorText = await response.text()
      console.error("❌ GIS 註冊錯誤:", errorText)
      return NextResponse.json({
        success: false,
        message: "會員註冊失敗",
        details: errorText,
        statusCode: response.status
      }, { status: response.status })
    }

  } catch (error) {
    console.error("❌ GIS 登入處理失敗:", error)
    return NextResponse.json({
      success: false,
      message: "登入處理失敗",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
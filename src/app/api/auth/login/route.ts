import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { setAuthToken } from "@lib/data/cookies"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 驗證必填欄位
    if (!email || !password) {
      return NextResponse.json({ 
        error: "請輸入電子郵件和密碼" 
      }, { status: 400 })
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: "請輸入有效的電子郵件地址" 
      }, { status: 400 })
    }

    try {
      // 使用 Medusa SDK 進行登入
      const token = await sdk.auth.login("customer", "emailpass", {
        email,
        password
      })

      if (!token) {
        return NextResponse.json({ 
          error: "電子郵件或密碼錯誤" 
        }, { status: 401 })
      }

      // 設置認證 token 到 cookies
      await setAuthToken(token as string)

      return NextResponse.json({ 
        success: true,
        message: "登入成功" 
      })
    } catch (authError: any) {
      console.error("Authentication error:", authError)
      
      // 處理常見的認證錯誤
      if (authError.message?.includes("Invalid email or password") || 
          authError.message?.includes("Unauthorized")) {
        return NextResponse.json({ 
          error: "電子郵件或密碼錯誤" 
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: "登入失敗，請稍後再試" 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Login API error:", error)
    return NextResponse.json({ 
      error: "登入失敗，請稍後再試" 
    }, { status: 500 })
  }
}

import { sdk } from "@lib/config"
import { NextRequest, NextResponse } from "next/server"

// 直接從 Google UserInfo API 獲取用戶資料的 endpoint
export async function POST(request: NextRequest) {
  try {
    const { authCode, state } = await request.json()
    
    if (!authCode) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    console.log("🔄 開始處理 Google OAuth - 直接 API 方式")
    
    // 步驟 1: 用授權碼換取 access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: authCode,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || '',
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error("❌ Google token 交換失敗:", error)
      return NextResponse.json({ error: "Failed to exchange code for token" }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    console.log("✅ 成功獲得 Google access token")

    // 步驟 2: 使用 access token 獲取用戶資料
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.text()
      console.error("❌ Google userinfo 獲取失敗:", error)
      return NextResponse.json({ error: "Failed to get user info" }, { status: 400 })
    }

    const userInfo = await userInfoResponse.json()
    console.log("✅ 成功獲得用戶資料:", { 
      email: userInfo.email, 
      name: userInfo.name,
      verified_email: userInfo.verified_email 
    })

    // 步驟 3: 建立新客戶（如果需要）
    let customer
    try {
      console.log("📝 嘗試建立客戶:", userInfo.email)
      const newCustomer = await sdk.store.customer.create({
        email: userInfo.email,
        first_name: userInfo.given_name || userInfo.name?.split(' ')[0] || 'Google',
        last_name: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || 'User',
      })
      customer = newCustomer.customer
      console.log("✅ 成功建立新客戶")
    } catch (customerError: any) {
      // 如果客戶已存在，這是正常的
      if (customerError.message?.includes('already exists') || customerError.message?.includes('duplicate')) {
        console.log("✅ 客戶已存在，繼續登入流程")
        customer = { email: userInfo.email, first_name: userInfo.given_name, last_name: userInfo.family_name }
      } else {
        console.error("❌ 客戶建立失敗:", customerError)
        return NextResponse.json({ error: "Failed to handle customer", details: customerError.message }, { status: 500 })
      }
    }

    // 步驟 4: 建立登入 session
    try {
      const loginResult = await sdk.auth.login("customer", "emailpass", {
        email: userInfo.email,
        password: `google_oauth_${userInfo.id}` // 臨時密碼，實際上不會用到
      })
      
      return NextResponse.json({
        success: true,
        customer: customer,
        userInfo: userInfo,
        redirect: '/tw/account'
      })
    } catch (loginError) {
      console.error("❌ 登入失敗:", loginError)
      
      // 如果密碼登入失敗，嘗試其他方式
      return NextResponse.json({
        success: true,
        customer: customer,
        userInfo: userInfo,
        message: "客戶已建立，請重新嘗試 Google 登入",
        redirect: '/tw/account?login_required=true'
      })
    }

  } catch (error: any) {
    console.error("❌ Google OAuth 直接處理失敗:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error.message 
    }, { status: 500 })
  }
}
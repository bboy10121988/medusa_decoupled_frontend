import { NextRequest, NextResponse } from "next/server"
import { setAuthToken } from "@lib/data/cookies"

// 簡單的 JWT 解碼函數 
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    const decodedData = Buffer.from(base64, 'base64').toString('utf8')
    return JSON.parse(decodedData)
  } catch (error) {
    console.error('JWT 解碼失敗:', error)
    return null
  }
}

/**
 * Google Identity Services (GIS) 登入處理
 * 恢復 JWT 版本：已驗證可以成功的版本
 */
export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { success: false, message: "缺少 Google 登入憑證" },
        { status: 400 }
      )
    }

    console.log("🔐 處理 Google Identity Services 登入 (JWT 版本):", {
      hasCredential: !!credential,
      timestamp: new Date().toISOString()
    })

    // 從 JWT 中提取用戶資訊
    const jwtPayload = decodeJWT(credential)
    if (!jwtPayload?.email) {
      return NextResponse.json(
        { success: false, message: "無法解析 Google 憑證" },
        { status: 400 }
      )
    }

    console.log("✅ JWT 解析成功:", {
      email: jwtPayload.email,
      name: jwtPayload.name,
      sub: jwtPayload.sub
    })

    // 配置
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    console.log("🔍 嘗試 Google 用戶認證:", { email: jwtPayload.email, baseUrl, hasKey: !!publishableKey })

    let authData
    let isNewUser = false

    // 使用固定的密碼策略 - Google 用戶的 sub ID
    const password = `google_user_${jwtPayload.sub}`

    // 首先嘗試註冊
    const registerResponse = await fetch(`${baseUrl}/auth/customer/emailpass/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || '',
      },
      body: JSON.stringify({
        email: jwtPayload.email,
        password: password,
      }),
    })

    console.log("📡 註冊回應狀態:", registerResponse.status)
    
    if (registerResponse.ok) {
      authData = await registerResponse.json()
      isNewUser = true
      console.log("✅ 註冊成功:", authData)
    } else if (registerResponse.status === 400 || registerResponse.status === 401 || registerResponse.status === 422) {
      // 用戶可能已存在，嘗試登入
      console.log("⚠️ 註冊失敗，可能用戶已存在，嘗試登入...")
      
      const loginResponse = await fetch(`${baseUrl}/auth/customer/emailpass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': publishableKey || '',
        },
        body: JSON.stringify({
          email: jwtPayload.email,
          password: password,
        }),
      })

      console.log("📡 登入回應狀態:", loginResponse.status)
      
      if (loginResponse.ok) {
        authData = await loginResponse.json()
        console.log("✅ 登入成功:", authData)
      } else {
        const loginError = await loginResponse.text()
        console.error("❌ 登入失敗:", loginError)
        return NextResponse.json({
          success: false,
          message: "Google 用戶認證失敗",
          details: loginError,
          statusCode: loginResponse.status
        }, { status: loginResponse.status })
      }
    } else {
      const errorText = await registerResponse.text()
      console.error("❌ 註冊錯誤:", errorText)
      return NextResponse.json({
        success: false,
        message: "會員註冊失敗",
        details: errorText,
        statusCode: registerResponse.status
      }, { status: registerResponse.status })
    }

    // 設置認證 token cookie
    if (authData.token) {
      console.log('🍪 設置認證 token 到 cookie:', {
        hasToken: !!authData.token,
        tokenLength: authData.token?.length || 0,
        tokenPreview: authData.token ? `${authData.token.substring(0, 50)}...` : null
      })
      await setAuthToken(authData.token)
      console.log('✅ Cookie 設置完成')
      
      // 重新驗證客戶快取
      const { revalidateTag } = await import('next/cache')
      const { getCacheTag } = await import('@lib/data/cookies')
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      console.log('🔄 客戶快取已重新驗證')
    } else {
      console.warn('⚠️ 無法設置 cookie：缺少 token')
      return NextResponse.json({
        success: false,
        message: "登入成功但缺少授權令牌",
      }, { status: 500 })
    }

    // 返回成功回應
    return NextResponse.json({
      success: true,
      message: `歡迎，${jwtPayload.name || jwtPayload.email}！Google ${isNewUser ? '註冊' : '登入'}成功`,
      token: authData.token,
      email: jwtPayload.email,
      user: {
        email: jwtPayload.email,
        name: jwtPayload.name,
        given_name: jwtPayload.given_name,
        family_name: jwtPayload.family_name,
        picture: jwtPayload.picture,
        sub: jwtPayload.sub
      },
      isNewUser
    })

  } catch (error) {
    console.error('❌ Google 登入處理錯誤:', error)
    return NextResponse.json({
      success: false,
      message: "登入處理失敗",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

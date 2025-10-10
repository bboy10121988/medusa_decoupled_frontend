import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 開始 Google OAuth 測試')
    
    // 測試 1: 檢查 SDK 配置
    console.log('1️⃣ 檢查 SDK 配置...')
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    console.log('Base URL:', baseUrl)
    console.log('Publishable Key:', publishableKey ? publishableKey.substring(0, 20) + '...' : 'Not set')
    
    // 測試 2: 獲取 Google OAuth URL
    console.log('2️⃣ 嘗試獲取 Google OAuth URL...')
    let authUrl = null
    try {
      // 直接調用後端的 Google OAuth 端點
      const response = await fetch(`${baseUrl}/auth/customer/google`, {
        method: 'GET',
        headers: {
          'x-publishable-api-key': publishableKey || '',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result && result.location) {
          authUrl = result.location
          console.log('✅ 成功獲取 Google OAuth URL')
          console.log('Auth URL:', authUrl.substring(0, 100) + '...')
        }
      } else {
        console.error('❌ 後端響應錯誤:', response.status, response.statusText)
      }
    } catch (authError: any) {
      console.error('❌ 獲取 Google OAuth URL 失敗:', authError.message)
    }

    return NextResponse.json({
      test: 'Google OAuth 配置測試',
      timestamp: new Date().toISOString(),
      results: {
        sdk_config: {
          baseUrl,
          publishableKeySet: !!publishableKey,
          publishableKeyPreview: publishableKey ? publishableKey.substring(0, 20) + '...' : null
        },
        google_auth_url: {
          success: !!authUrl,
          url: authUrl ? authUrl.substring(0, 100) + '...' : null,
          fullUrl: authUrl // 完整 URL 用於實際測試
        }
      },
      instructions: {
        next_step: authUrl ? 
          '請複製 fullUrl 到瀏覽器進行 Google OAuth 登入測試' :
          '無法獲取 Google OAuth URL，請檢查後端配置'
      }
    })

  } catch (error: any) {
    console.error('❌ Google OAuth 測試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

// POST 方法用於處理實際的 OAuth callback 測試
export async function POST(request: NextRequest) {
  try {
    const { code, state, action } = await request.json()
    
    console.log('🧪 處理 Google OAuth Callback 測試')
    console.log('Action:', action)
    console.log('Code present:', !!code)
    console.log('State:', state)

    if (action === 'simulate_callback' && code) {
      console.log('3️⃣ 模擬 Google OAuth Callback...')
      
      // 調用 Medusa SDK 的 callback
      const token = await sdk.auth.callback("customer", "google", { code, state })
      
      console.log('收到 token 類型:', typeof token)
      console.log('Token 存在:', !!token)
      
      let userEmail = null
      let userInfo = null
      let jwtPayload = null
      
      if (typeof token === 'string') {
        // 解析 JWT payload
        try {
          const [, payload] = token.split(".")
          if (payload) {
            const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
            const decoded = decodeURIComponent(
              atob(normalized)
                .split("")
                .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join("")
            )
            jwtPayload = JSON.parse(decoded)
            
            console.log('🧾 JWT Payload:')
            console.log(JSON.stringify(jwtPayload, null, 2))
            
            // 嘗試從不同的位置提取 email
            userEmail = jwtPayload.email || 
                      jwtPayload.user_metadata?.email ||
                      jwtPayload.app_metadata?.email ||
                      jwtPayload.sub
            
            userInfo = {
              email: userEmail,
              name: jwtPayload.name || jwtPayload.user_metadata?.name,
              picture: jwtPayload.picture || jwtPayload.user_metadata?.picture,
              sub: jwtPayload.sub,
              provider: jwtPayload.app_metadata?.provider
            }
            
            console.log('📧 提取的用戶資訊:')
            console.log('Email:', userEmail)
            console.log('Name:', userInfo.name)
            console.log('Provider:', userInfo.provider)
            
          }
        } catch (parseError) {
          console.error('❌ 解析 JWT 失敗:', parseError)
        }
      }
      
      // 測試 4: 嘗試獲取當前用戶資訊
      console.log('4️⃣ 嘗試獲取當前用戶資訊...')
      let currentUser = null
      try {
        // 設置 token 到 SDK
        if (typeof token === 'string') {
          sdk.config.jwt = token
        }
        
        // 嘗試獲取當前用戶
        currentUser = await sdk.auth.retrieve()
        console.log('✅ 成功獲取當前用戶:', currentUser)
      } catch (userError: any) {
        console.error('❌ 獲取當前用戶失敗:', userError.message)
      }

      return NextResponse.json({
        test: 'Google OAuth Callback 測試',
        timestamp: new Date().toISOString(),
        results: {
          token_received: {
            success: !!token,
            type: typeof token,
            tokenPreview: typeof token === 'string' ? token.substring(0, 50) + '...' : null
          },
          jwt_parsing: {
            success: !!jwtPayload,
            payload: jwtPayload
          },
          user_email_extraction: {
            success: !!userEmail,
            email: userEmail,
            userInfo
          },
          current_user_retrieval: {
            success: !!currentUser,
            user: currentUser
          }
        },
        email_found: !!userEmail,
        extracted_email: userEmail
      })
    }

    return NextResponse.json({
      error: '需要提供 action 和 code 參數'
    }, { status: 400 })

  } catch (error: any) {
    console.error('❌ Google OAuth Callback 測試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
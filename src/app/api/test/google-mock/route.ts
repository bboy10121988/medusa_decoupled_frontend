import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'

// 模擬 Google OAuth 用戶資料
const MOCK_GOOGLE_USER = {
  email: 'test.user@gmail.com',
  name: 'Test User',
  picture: 'https://lh3.googleusercontent.com/a/default-user',
  sub: 'google_123456789',
  email_verified: true
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  try {
    if (action === 'mock_login') {
      console.log('🎭 開始模擬 Google OAuth 登入流程')
      
      // 模擬生成一個包含用戶資訊的 JWT token
      const mockPayload = {
        sub: MOCK_GOOGLE_USER.sub,
        email: MOCK_GOOGLE_USER.email,
        name: MOCK_GOOGLE_USER.name,
        picture: MOCK_GOOGLE_USER.picture,
        email_verified: MOCK_GOOGLE_USER.email_verified,
        iss: 'https://accounts.google.com',
        aud: 'mock-client-id',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
        app_metadata: {
          provider: 'google',
          email: MOCK_GOOGLE_USER.email
        },
        user_metadata: {
          email: MOCK_GOOGLE_USER.email,
          name: MOCK_GOOGLE_USER.name,
          picture: MOCK_GOOGLE_USER.picture
        }
      }
      
      console.log('📋 模擬的用戶資料:')
      console.log(JSON.stringify(mockPayload, null, 2))
      
      // 創建一個模擬的 JWT (這裡只是為了測試格式，不是真正的 JWT)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      const payload = btoa(JSON.stringify(mockPayload))
      const signature = 'mock_signature'
      const mockToken = `${header}.${payload}.${signature}`
      
      // 測試解析 JWT
      let parsedPayload = null
      let userEmail = null
      try {
        const [, payloadPart] = mockToken.split(".")
        if (payloadPart) {
          const decoded = atob(payloadPart)
          parsedPayload = JSON.parse(decoded)
          
          // 從多個可能的位置提取 email
          userEmail = parsedPayload.email || 
                     parsedPayload.user_metadata?.email ||
                     parsedPayload.app_metadata?.email
          
          console.log('✅ 成功解析模擬 JWT')
          console.log('📧 提取的 Email:', userEmail)
        }
      } catch (parseError) {
        console.error('❌ 解析模擬 JWT 失敗:', parseError)
      }
      
      return NextResponse.json({
        test_type: '模擬 Google OAuth 登入',
        timestamp: new Date().toISOString(),
        mock_user: MOCK_GOOGLE_USER,
        mock_token: {
          token: mockToken.substring(0, 100) + '...',
          fullToken: mockToken
        },
        jwt_parsing: {
          success: !!parsedPayload,
          payload: parsedPayload
        },
        email_extraction: {
          success: !!userEmail,
          email: userEmail,
          sources_checked: [
            'payload.email',
            'payload.user_metadata.email', 
            'payload.app_metadata.email'
          ]
        },
        validation: {
          email_format_valid: userEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail) : false,
          email_is_gmail: userEmail ? userEmail.endsWith('@gmail.com') : false
        }
      })
    }
    
    if (action === 'test_medusa_integration') {
      console.log('🔗 測試與 Medusa 後端的整合')
      
      try {
        // 測試基本的 SDK 連接
        const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        
        console.log('Backend URL:', baseUrl)
        console.log('Publishable Key present:', !!publishableKey)
        
        // 嘗試獲取認證提供者列表
        let providers = null
        try {
          // 這個 API 可能存在於 Medusa v2
          const response = await fetch(`${baseUrl}/auth/list-providers`, {
            headers: {
              'x-publishable-api-key': publishableKey || ''
            }
          })
          
          if (response.ok) {
            providers = await response.json()
            console.log('✅ 成功獲取認證提供者:', providers)
          } else {
            console.log('⚠️ 無法獲取認證提供者列表 (可能是正常的)')
          }
        } catch (providerError) {
          console.log('⚠️ 獲取提供者時發生錯誤:', providerError)
        }
        
        // 測試是否可以創建 Google OAuth URL
        let authUrl = null
        try {
          const authResult = await sdk.auth.authenticate("customer", "google", {
            callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google/callback`
          })
          
          if (authResult && typeof authResult === 'object' && 'location' in authResult) {
            authUrl = authResult.location
            console.log('✅ 成功生成 Google OAuth URL')
          }
        } catch (authError: any) {
          console.error('❌ 生成 Google OAuth URL 失敗:', authError.message)
        }
        
        return NextResponse.json({
          test_type: 'Medusa 整合測試',
          timestamp: new Date().toISOString(),
          sdk_config: {
            baseUrl,
            publishableKeySet: !!publishableKey,
            publishableKeyPreview: publishableKey ? publishableKey.substring(0, 20) + '...' : null
          },
          auth_providers: {
            success: !!providers,
            providers
          },
          google_oauth_url: {
            success: !!authUrl,
            url: authUrl ? authUrl.substring(0, 100) + '...' : null,
            fullUrl: authUrl
          },
          backend_connection: {
            status: 'connected',
            baseUrl
          }
        })
      } catch (error: any) {
        console.error('❌ Medusa 整合測試失敗:', error)
        return NextResponse.json({
          test_type: 'Medusa 整合測試',
          success: false,
          error: error.message
        }, { status: 500 })
      }
    }
    
    // 默認返回可用的測試選項
    return NextResponse.json({
      available_tests: {
        mock_login: '模擬 Google OAuth 登入流程',
        test_medusa_integration: '測試與 Medusa 後端的整合'
      },
      usage: {
        mock_login: 'GET /api/test/google-mock?action=mock_login',
        medusa_integration: 'GET /api/test/google-mock?action=test_medusa_integration'
      }
    })
    
  } catch (error: any) {
    console.error('❌ 測試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

// POST 方法用於模擬完整的認證流程
export async function POST(request: NextRequest) {
  try {
    const { action, email } = await request.json()
    
    if (action === 'simulate_full_flow') {
      console.log('🎬 模擬完整的 Google OAuth 流程')
      
      const testEmail = email || MOCK_GOOGLE_USER.email
      
      // 步驟 1: 模擬 Google 認證
      console.log('步驟 1: 模擬 Google 認證成功')
      
      // 步驟 2: 模擬後端創建/查找用戶
      console.log('步驟 2: 模擬後端處理用戶資料')
      
      // 步驟 3: 模擬生成 JWT token
      const mockJwtPayload = {
        sub: `google_${Date.now()}`,
        email: testEmail,
        name: email?.split('@')[0] || 'Test User',
        provider: 'google',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        app_metadata: {
          provider: 'google',
          customer_id: `cus_${Date.now()}`
        },
        user_metadata: {
          email: testEmail,
          email_verified: true
        }
      }
      
      // 步驟 4: 測試 email 提取
      const extractedEmail = mockJwtPayload.email || 
                           mockJwtPayload.user_metadata?.email ||
                           mockJwtPayload.app_metadata?.email
      
      console.log('✅ 完整流程模擬完成')
      console.log('📧 最終提取的 Email:', extractedEmail)
      
      return NextResponse.json({
        test_type: '完整 Google OAuth 流程模擬',
        timestamp: new Date().toISOString(),
        flow_steps: {
          step_1_google_auth: { status: 'success', message: 'Google 認證成功' },
          step_2_backend_processing: { status: 'success', message: '後端用戶處理完成' },
          step_3_jwt_generation: { status: 'success', payload: mockJwtPayload },
          step_4_email_extraction: { 
            status: extractedEmail ? 'success' : 'failed',
            email: extractedEmail,
            extraction_method: mockJwtPayload.email ? 'direct' : 
                              mockJwtPayload.user_metadata?.email ? 'user_metadata' :
                              mockJwtPayload.app_metadata?.email ? 'app_metadata' : 'none'
          }
        },
        final_result: {
          success: !!extractedEmail,
          user_email: extractedEmail,
          user_authenticated: true
        }
      })
    }
    
    return NextResponse.json({
      error: '未知的 action'
    }, { status: 400 })
    
  } catch (error: any) {
    console.error('❌ POST 測試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
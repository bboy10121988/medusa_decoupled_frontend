import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()
    
    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
    }

    console.log('🔍 調試 Google OAuth 流程...')
    console.log('Authorization code:', code.substring(0, 20) + '...')
    console.log('State:', state)

    // 調用 Medusa SDK 的 callback
    const token = await sdk.auth.callback("customer", "google", { code, state })
    
    console.log('🔑 收到的 token 類型:', typeof token)
    console.log('🔑 Token 存在:', !!token)
    
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
          const parsedPayload = JSON.parse(decoded)
          
          console.log('🧾 完整的 JWT Payload:')
          console.log(JSON.stringify(parsedPayload, null, 2))
          
          return NextResponse.json({
            success: true,
            tokenExists: true,
            payload: parsedPayload,
            rawToken: token.substring(0, 100) + '...' // 只顯示部分 token
          })
        }
      } catch (parseError) {
        console.error('❌ 解析 JWT 失敗:', parseError)
        return NextResponse.json({
          success: true,
          tokenExists: true,
          payload: null,
          parseError: parseError.message,
          rawToken: token.substring(0, 100) + '...'
        })
      }
    }

    // 如果不是字符串，可能是重定向對象
    if (token && typeof token === 'object' && 'location' in token) {
      console.log('🔀 收到重定向 URL:', token.location)
      return NextResponse.json({
        success: true,
        redirectLocation: token.location
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Unexpected token format',
      tokenType: typeof token,
      token: token
    })

  } catch (error: any) {
    console.error('❌ Google OAuth 調試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
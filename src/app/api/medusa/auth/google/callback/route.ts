import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

// 初始化 Google OAuth2 客戶端
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') console.log('處理 Google 授權回調')

    // 檢查必要的環境變數
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('缺少 GOOGLE_CLIENT_ID 環境變數')
      return NextResponse.json({ error: '伺服器 Google OAuth 配置錯誤' }, { status: 500 })
    }

    // 解析請求體
    const { code, redirect_uri } = await request.json()

    if (!code) {
      return NextResponse.json({ error: '缺少授權碼' }, { status: 400 })
    }

    if (!redirect_uri) {
      return NextResponse.json({ error: '缺少重定向 URI' }, { status: 400 })
    }

    if (process.env.NODE_ENV === 'development') console.log('收到授權碼:', code.substring(0, 10) + '...')
    if (process.env.NODE_ENV === 'development') console.log('回調 URI:', redirect_uri)

    try {
      // 使用授權碼交換令牌
      const { tokens } = await client.getToken({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: redirect_uri,
        // 正式環境需要 client_secret，但這裡我們使用的是前端流程所以省略
      })

      if (!tokens || !tokens.id_token) {
        throw new Error('未能獲取有效令牌')
      }

      // 驗證 ID 令牌
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })

      const payload = ticket.getPayload()
      if (!payload) {
        throw new Error('無效的令牌數據')
      }

      const { sub: googleId, email, name, picture } = payload
      
      if (process.env.NODE_ENV === 'development') console.log('已驗證 Google 用戶:', { email, name })

      // 創建自訂 session token
      const sessionData = {
        id: googleId,
        email: email || `${googleId}@google.user`,
        firstName: name?.split(' ')[0] || 'Google',
        lastName: name?.split(' ').slice(1).join(' ') || 'User',
        googleAuth: true,
        picture,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7天過期
      }

      // 將 session 數據保存為 token 字串（前綴為 google_oauth:）
      const token = 'google_oauth:' + JSON.stringify(sessionData)

      return NextResponse.json({ 
        token, 
        customer: {
          id: googleId,
          email: sessionData.email,
          first_name: sessionData.firstName,
          last_name: sessionData.lastName,
          googleAuth: true,
        }
      })

    } catch (tokenError: any) {
      console.error('Google 令牌交換錯誤:', tokenError)
      return NextResponse.json({ 
        error: '授權碼驗證失敗',
        details: tokenError.message
      }, { status: 401 })
    }
  } catch (error: any) {
    console.error('Google 回調處理錯誤:', error)
    return NextResponse.json({ 
      error: '處理 Google 授權失敗',
      details: error.message
    }, { status: 500 })
  }
}
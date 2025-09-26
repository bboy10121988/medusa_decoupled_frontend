import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { ENV_MODE } from '@lib/env-mode'

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') console.log('處理 Google 授權回調')

    const googleClientId = ENV_MODE === 'vm'
      ? process.env.GOOGLE_CLIENT_ID_VM || process.env.GOOGLE_CLIENT_ID
      : process.env.GOOGLE_CLIENT_ID_LOCAL || process.env.GOOGLE_CLIENT_ID

    const googleClientSecret = ENV_MODE === 'vm'
      ? process.env.GOOGLE_CLIENT_SECRET_VM || process.env.GOOGLE_CLIENT_SECRET
      : process.env.GOOGLE_CLIENT_SECRET_LOCAL || process.env.GOOGLE_CLIENT_SECRET

    // 檢查必要的環境變數
    if (!googleClientId) {
      console.error('缺少 GOOGLE_CLIENT_ID 環境變數')
      return NextResponse.json({ error: '伺服器 Google OAuth 配置錯誤' }, { status: 500 })
    }

    if (!googleClientSecret) {
      console.error('缺少 GOOGLE_CLIENT_SECRET 環境變數')
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
      // 創建OAuth2客戶端
      const oauth2Client = new OAuth2Client(googleClientId, googleClientSecret, redirect_uri)

      // 使用授權碼交換令牌
      const { tokens } = await oauth2Client.getToken(code)

      if (!tokens || !tokens.id_token) {
        throw new Error('未能獲取有效令牌')
      }

      // 驗證 ID 令牌
      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: googleClientId,
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
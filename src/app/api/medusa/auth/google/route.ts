import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

// 初始化 Google OAuth2 客戶端
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') console.log('Google 授權 URL 請求')

    // 檢查必要的環境變數
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('缺少 GOOGLE_CLIENT_ID 環境變數')
      return NextResponse.json({ error: '伺服器 Google OAuth 配置錯誤' }, { status: 500 })
    }

    // 產生動態 callback URL（與部署網域一致）
    const origin = process.env.NEXT_PUBLIC_STORE_URL || (process.env.NEXTAUTH_URL || 'http://localhost:8001')
    const redirectUri = `${origin.replace(/\/$/, '')}/tw/auth/google/callback`

    if (process.env.NODE_ENV === 'development') console.log('使用回調 URL:', redirectUri)

    // 構建 Google OAuth 授權 URL
    // 注意：這裡使用 OAuth2 授權碼流程，需要在 Google Cloud Console 配置相同的重定向 URI
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID)}` + 
      `&redirect_uri=${encodeURIComponent(redirectUri)}` + 
      `&response_type=code` +
      `&scope=${encodeURIComponent('profile email')}` + 
      `&access_type=offline` +
      `&prompt=consent`

    if (process.env.NODE_ENV === 'development') console.log('生成的授權 URL:', authUrl)
    return NextResponse.json({ authUrl }, { status: 200 })

  } catch (error: any) {
    console.error('產生 Google 授權 URL 錯誤:', error)
    return NextResponse.json({ 
      error: '無法生成 Google 授權 URL',
      details: error.message 
    }, { status: 500 })
  }
}
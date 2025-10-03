import { NextRequest, NextResponse } from 'next/server'
import { ENV_MODE } from '@lib/env-mode'

const GOOGLE_CLIENT_ID = ENV_MODE === 'vm'
  ? process.env.GOOGLE_CLIENT_ID_VM || process.env.GOOGLE_CLIENT_ID
  : process.env.GOOGLE_CLIENT_ID_LOCAL || process.env.GOOGLE_CLIENT_ID

const GOOGLE_CLIENT_SECRET = ENV_MODE === 'vm'
  ? process.env.GOOGLE_CLIENT_SECRET_VM || process.env.GOOGLE_CLIENT_SECRET
  : process.env.GOOGLE_CLIENT_SECRET_LOCAL || process.env.GOOGLE_CLIENT_SECRET

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') console.log('Google 授權 URL 請求')

    // 檢查必要的環境變數
    if (!GOOGLE_CLIENT_ID) {
      console.error('缺少 GOOGLE_CLIENT_ID 環境變數')
      return NextResponse.json({ error: '伺服器 Google OAuth 配置錯誤' }, { status: 500 })
    }
    
    if (!GOOGLE_CLIENT_SECRET) {
      console.error('缺少 GOOGLE_CLIENT_SECRET 環境變數')
      return NextResponse.json({ error: '伺服器 Google OAuth 配置錯誤' }, { status: 500 })
    }

    // 從查詢參數獲取國家代碼
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('countryCode') || 'tw'

    // 產生動態 callback URL（與部署網域一致）
    const origin = process.env.NEXT_PUBLIC_STORE_URL || process.env.NEXTAUTH_URL || 
                   (process.env.NODE_ENV === 'production' ? 'https://timsfantasyworld.com' : 'http://localhost:8001')
    const redirectUri = `${origin.replace(/\/$/, '')}/auth/google/callback`

    if (process.env.NODE_ENV === 'development') console.log('使用回調 URL:', redirectUri)

    // 構建 Google OAuth 授權 URL，使用 state 參數傳遞國家代碼
    const state = encodeURIComponent(JSON.stringify({ countryCode }))
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` + 
      `&redirect_uri=${encodeURIComponent(redirectUri)}` + 
      `&response_type=code` +
      `&scope=${encodeURIComponent('profile email')}` + 
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${state}`

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
import { NextRequest, NextResponse } from 'next/server'
import { setAuthToken } from '@lib/data/cookies'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const redirectPath = searchParams.get('redirect') || '/tw/account'

    // 構建重定向 URL，優先使用環境變數，fallback 到 request origin
    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
    const redirectUrl = `${origin}${redirectPath}`

    if (!token) {
      console.log('🔗 沒有 token，重定向到:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    }

    // 設置認證 token
    await setAuthToken(token)
    console.log('🔗 Token 已設置，重定向到:', redirectUrl)
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('❌ set-token-redirect 錯誤:', error)
    // 錯誤時重定向到會員中心
    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
    return NextResponse.redirect(`${origin}/tw/account?error=auth_failed`)
  }
} 
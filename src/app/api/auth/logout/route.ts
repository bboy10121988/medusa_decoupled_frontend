import { NextRequest, NextResponse } from 'next/server'
import { sdk } from "@lib/config"

export async function POST(request: NextRequest) {
  console.log('🚪 API 登出端點被調用')
  
  try {
    // 1. 嘗試 Medusa SDK 登出
    console.log('🔐 嘗試 Medusa SDK 登出...')
    await sdk.auth.logout()
    console.log('✅ Medusa SDK 登出成功')
  } catch (error) {
    console.warn('⚠️ SDK logout failed:', error)
  }

  // 2. 創建回應並清除所有認證 cookies
  const response = NextResponse.json({ success: true })
  
  // 取得正確的域名
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined
  console.log('🌐 使用 cookie 域名:', domain)
  
  // 清除所有認證相關的 cookies
  const authCookies = ['_medusa_jwt', '_medusa_cart_id', '_medusa_cache_id']
  
  for (const cookieName of authCookies) {
    console.log(`🗑️ 清除 cookie: ${cookieName}`)
    
    // 清除當前域名的 cookie
    response.cookies.set(cookieName, '', {
      maxAge: -1,
      path: '/',
      domain: domain,
      httpOnly: cookieName === '_medusa_jwt',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    // 同時清除沒有域名設定的 cookie（以防萬一）
    response.cookies.set(cookieName, '', {
      maxAge: -1,
      path: '/',
      httpOnly: cookieName === '_medusa_jwt',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }
  
  console.log('✅ 所有 cookies 已清除')
  return response
}
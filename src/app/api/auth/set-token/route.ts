import { NextRequest, NextResponse } from 'next/server'
import { setAuthToken, getCacheTag } from '@lib/data/cookies'
import { revalidateTag } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const redirect = searchParams.get('redirect') || '/tw/account'
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }
    
    await setAuthToken(token)
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    
    // 重定向到指定頁面
    return NextResponse.redirect(new URL(redirect, request.url))
  } catch (error) {
    console.error('設定 token 錯誤:', error)
    return NextResponse.redirect(new URL('/tw/account?error=auth_failed', request.url))
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }
    
    await setAuthToken(token)
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('設定 token 錯誤:', error)
    return NextResponse.json({ error: 'Failed to set token' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') console.log('Google 授權 URL 請求 - 重定向到 Medusa 後端')

    // 根據流程圖，Google OAuth 完全由 Medusa 後端處理
    // 前端不需要直接與 Google API 互動，應該透過 Medusa SDK
    
    return NextResponse.json({ 
      message: 'Google OAuth 由 Medusa 後端處理，請使用 SDK: sdk.auth.login("customer", "google", {})',
      redirect: '請在前端組件中使用 sdk.auth.login() 方法'
    }, { status: 200 })

  } catch (error: any) {
    console.error('API 路由錯誤:', error)
    return NextResponse.json({ 
      error: 'API 路由錯誤',
      details: error.message 
    }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = new NextResponse(JSON.stringify({ success: true, message: 'All cookies cleared' }))
    
    // 清除所有可能的認證 cookies
    const cookiesToClear = [
      '_medusa_jwt',
      '_medusa_cart_id', 
      '_medusa_cache_id',
      '_debug_jwt_preview',
      '_debug_jwt_full',
      '_client_debug_jwt',
      '_client_jwt_info',
      'connect.sid',
      'session',
      'auth-token',

    ]

    cookiesToClear.forEach(name => {
      // 設置過期的 cookie 來清除
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false
      })
      
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/tw',
        httpOnly: false
      })
      
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true
      })
    })

    return response
  } catch (error) {
    console.error('清除 cookies 失敗:', error)
    return NextResponse.json({ success: false, error: 'Failed to clear cookies' }, { status: 500 })
  }
}
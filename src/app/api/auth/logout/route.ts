import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 開始後端登出流程...')
    
    // 嘗試使用 SDK 登出
    try {
      await sdk.auth.logout()
      console.log('✅ Medusa SDK 登出成功')
    } catch (sdkError) {
      console.log('⚠️ SDK 登出失敗，繼續清除 cookies:', sdkError)
    }
    
    // cookies() 會被 NextResponse 自動處理
    
    // 清除所有認證相關的 cookies (擴展列表以支援帳號切換)
    const cookiesToClear = [
      '_medusa_jwt',
      '_medusa_cart_id', 
      '_medusa_cache_id',
      '_affiliate_jwt',
      '_affiliate_admin_jwt',
      'connect.sid',
      'session',
      '_medusa_customer_id',
      'medusa-auth-token',
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      'auth-token',
      'auth_session',
      'google-oauth-state',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      'google-auth-state'
    ]
    
    console.log('🧹 清除 cookies:', cookiesToClear)
    
    const response = NextResponse.json(
      { success: true, message: '登出成功' },
      { status: 200 }
    )
    
    // 清除每個 cookie (支援多種路徑和設定以確保完全清除)
    cookiesToClear.forEach(cookieName => {
      // 方法1: 使用 delete
      response.cookies.delete(cookieName)
      
      // 方法2: 設置過期的 cookie (主路徑)
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      })
      
      // 方法3: 清除子路徑的 cookie
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/tw'
      })
      
      // 方法4: 清除非 httpOnly 的 cookie (用於前端 JavaScript)
      response.cookies.set(cookieName, '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      })
    })
    
    // 設置響應標頭來指示前端完全清除狀態
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"')
    response.headers.set('X-Clear-Auth-State', 'true')
    
    console.log('✅ 登出完成，所有認證狀態已清除，支援帳號重新選擇')
    
    return response
    
  } catch (error) {
    console.error('❌ 登出過程中發生錯誤:', error)
    
    // 即使有錯誤，也嘗試清除 cookies
    const response = NextResponse.json(
      { success: false, message: '登出過程中發生錯誤，但 cookies 已清除' },
      { status: 200 } // 仍然返回 200，因為我們完成了清除工作
    )
    
    const cookiesToClear = [
      '_medusa_jwt',
      '_medusa_cart_id',
      '_medusa_cache_id',
      '_affiliate_jwt',
      '_affiliate_admin_jwt',
      'connect.sid',
      'session',
      '_medusa_customer_id',
      'medusa-auth-token',
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      'auth-token',
      'auth_session',
      'google-oauth-state',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      'google-auth-state'
    ]
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.delete(cookieName)
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      })
      
      // 也清除非 httpOnly 版本
      response.cookies.set(cookieName, '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        path: '/'
      })
    })
    
    return response
  }
}
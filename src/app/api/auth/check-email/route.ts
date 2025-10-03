import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '需要提供 email' },
        { status: 400 }
      )
    }

    // 使用更簡單的方法：直接嘗試檢查客戶是否存在
    // 注意：這個 API 主要是為了提供更好的用戶體驗
    // 實際的認證驗證仍然在實際登入時進行
    
    try {
      // 嘗試用錯誤密碼登入來觸發特定錯誤
      await sdk.auth.login("customer", "emailpass", {
        email: email,
        password: "__CHECK_ACCOUNT_STATUS__" // 特殊標記用於檢查
      })
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || error.toString()
      console.log('Email 檢查回應:', errorMessage)
      
      // 基於錯誤訊息來推斷帳戶類型
      const lowerErrorMessage = errorMessage.toLowerCase()
      

      
      // 檢查是否為密碼錯誤（表示帳戶存在但使用密碼認證）
      if (lowerErrorMessage.includes('invalid') || 
          lowerErrorMessage.includes('incorrect') || 
          lowerErrorMessage.includes('unauthorized') ||
          lowerErrorMessage.includes('wrong') ||
          lowerErrorMessage.includes('credentials')) {
        return NextResponse.json({
          exists: true,
          authProvider: 'password',
          message: '此電子郵件已註冊，可使用密碼登入'
        })
      }
      
      // 檢查帳戶不存在
      if (lowerErrorMessage.includes('not found') || 
          lowerErrorMessage.includes('does not exist') ||
          lowerErrorMessage.includes('user not found') ||
          lowerErrorMessage.includes('customer not found')) {
        return NextResponse.json({
          exists: false,
          authProvider: null,
          message: '此電子郵件尚未註冊'
        })
      }
      
      // 其他情況，假設帳戶可能存在但需要密碼
      return NextResponse.json({
        exists: true,
        authProvider: 'password',
        message: '請輸入密碼來登入'
      })
    }
    
    // 預設回應
    return NextResponse.json({
      exists: false,
      authProvider: null,
      message: '無法確定帳戶狀態'
    })
    
  } catch (error) {
    console.error('檢查 email 時發生錯誤:', error)
    return NextResponse.json(
      { error: '檢查 email 時發生錯誤' },
      { status: 500 }
    )
  }
}
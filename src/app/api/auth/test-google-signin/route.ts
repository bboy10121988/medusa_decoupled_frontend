import { NextRequest, NextResponse } from 'next/server'
import { setAuthToken, getCacheTag } from '@lib/data/cookies'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    console.log('測試 Google 登入 API 被調用')

    // 注意：這是測試 API，不應在生產環境中使用
    const googleUserData = {
      google_id: "test_google_id_123",
      email: "test.user@gmail.com",
      first_name: "Test",
      last_name: "User",
      avatar: "https://via.placeholder.com/150"
    }

    console.log('測試用戶資料:', googleUserData)

    // 直接呼叫後端 API
    const medusaResponse = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/customers/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
      },
      body: JSON.stringify(googleUserData),
    })

    console.log('Medusa 回應狀態:', medusaResponse.status)
    
    const responseText = await medusaResponse.text()
    console.log('Medusa 原始回應內容:', responseText)

    if (!medusaResponse.ok) {
      console.error('Medusa 創建/登入用戶錯誤 - 狀態:', medusaResponse.status)
      console.error('Medusa 創建/登入用戶錯誤 - 內容:', responseText)
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = responseText
      }
      return NextResponse.json({ 
        error: 'Failed to create/login user',
        details: errorData,
        status: medusaResponse.status
      }, { status: 500 })
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log('Medusa 成功回應 (解析後):', responseData)
    } catch (parseError) {
      console.error('無法解析 Medusa 回應 JSON:', parseError)
      console.error('原始回應內容:', responseText)
      return NextResponse.json({ 
        error: 'Invalid response from backend',
        details: responseText 
      }, { status: 500 })
    }

    const { customer } = responseData

    // 設置 Google OAuth 會話
    console.log('為 Google OAuth 用戶設置特殊會話')
    
    try {
      const googleSessionData = {
        customer_id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        auth_provider: 'google',
        created_at: new Date().toISOString()
      }
      
      const googleToken = `google_oauth:${JSON.stringify(googleSessionData)}`
      
      await setAuthToken(googleToken)
      console.log('已設置 Google OAuth 會話 token')
    } catch (authError: any) {
      console.error('設置認證 token 失敗:', authError)
      return NextResponse.json({ 
        error: 'Failed to set authentication',
        details: authError?.message || 'Unknown auth error'
      }, { status: 500 })
    }

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    return NextResponse.json({ 
      success: true, 
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
      message: '測試 Google 登入成功'
    })
  } catch (error: any) {
    console.error('測試 Google 登入錯誤:', error)
    return NextResponse.json({ 
      error: error.message || 'Test Google login failed' 
    }, { status: 500 })
  }
}

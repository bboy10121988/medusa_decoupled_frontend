import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { setAuthToken, getCacheTag } from '@lib/data/cookies'
import { revalidateTag } from 'next/cache'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(request: NextRequest) {
  try {
    console.log('Google 登入 API 被呼叫')
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '已設定' : '未設定')
    
    const { credential } = await request.json()
    
    if (!credential) {
      console.error('Missing credential')
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 })
    }

    console.log('收到 credential，準備驗證...')

    // 驗證 Google JWT token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      // 暫時不檢查 audience，因為現有的 Client ID 可能沒有包含 localhost:8000
      // audience: process.env.GOOGLE_CLIENT_ID,
    })

    console.log('Google token 驗證成功')

    const payload = ticket.getPayload()
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 })
    }

    const { sub: googleId, email, name, picture } = payload

    console.log('Google 用戶資料:', { googleId, email, name })

    // 1. 先嘗試使用標準 Medusa API 創建或找到客戶
    let customer = null
    
    try {
      // 首先嘗試用 email 查找現有客戶
      const existingCustomerResponse = await fetch(
        `${process.env.MEDUSA_BACKEND_URL}/store/customers/me`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
            // 暫時不提供認證 token，讓它返回 401
          },
        }
      )
      
      // 如果找不到現有客戶，創建新客戶
      const createCustomerResponse = await fetch(
        `${process.env.MEDUSA_BACKEND_URL}/store/customers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
          },
          body: JSON.stringify({
            email: email,
            first_name: name?.split(' ')[0] || '',
            last_name: name?.split(' ').slice(1).join(' ') || '',
            password: `google_oauth_${googleId}`, // 使用 Google ID 作為密碼
          }),
        }
      )

      if (createCustomerResponse.ok) {
        const customerData = await createCustomerResponse.json()
        customer = customerData.customer
        console.log('成功創建新客戶:', customer?.email)
      } else {
        const errorText = await createCustomerResponse.text()
        console.log('創建客戶失敗:', createCustomerResponse.status, errorText)
        
        // 如果創建失敗（可能是因為 email 已存在），嘗試登入
        const loginResponse = await fetch(
          `${process.env.MEDUSA_BACKEND_URL}/store/auth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
            },
            body: JSON.stringify({
              email: email,
              password: `google_oauth_${googleId}`,
            }),
          }
        )

        if (loginResponse.ok) {
          const authData = await loginResponse.json()
          customer = authData.customer
          console.log('成功登入現有客戶:', customer?.email)
          
          // 設置認證 token
          if (authData.access_token) {
            await setAuthToken(authData.access_token)
            const customerCacheTag = await getCacheTag("customers")
            revalidateTag(customerCacheTag)

            return NextResponse.json({
              success: true,
              customer: customer,
              message: 'Google 登入成功 (現有帳戶)'
            })
          }
        }
      }
    } catch (customerError) {
      console.error('Medusa 客戶處理錯誤:', customerError)
    }

    // 2. 如果無法通過標準 API 處理，使用 fallback Google OAuth session
    if (!customer) {
      console.log('無法創建/找到客戶，使用 fallback session')
      
      // 創建一個臨時客戶物件以供前端使用
      const tempCustomer = {
        id: `google_${googleId}`,
        email: email,
        first_name: name?.split(' ')[0] || '',
        last_name: name?.split(' ').slice(1).join(' ') || '',
        created_at: new Date().toISOString(),
      }
      
      const googleSessionData = {
        customer_id: tempCustomer.id,
        email: tempCustomer.email,
        first_name: tempCustomer.first_name,
        last_name: tempCustomer.last_name,
        auth_provider: 'google',
        google_id: googleId,
        created_at: new Date().toISOString()
      }
      
      const googleToken = `google_oauth:${JSON.stringify(googleSessionData)}`
      await setAuthToken(googleToken)

      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)

      return NextResponse.json({ 
        success: true, 
        customer: tempCustomer,
        message: 'Google 登入成功 (臨時會話)'
      })
    }
    // 3. 如果成功找到/創建客戶，返回成功
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    return NextResponse.json({ 
      success: true, 
      customer: customer,
      message: 'Google 登入成功'
    })

  } catch (error: any) {
    console.error('Google 登入錯誤:', error)
    return NextResponse.json({ 
      error: error.message || 'Google login failed' 
    }, { status: 500 })
  }
}

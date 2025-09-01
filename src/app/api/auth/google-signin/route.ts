import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { setAuthToken, getCacheTag } from '@lib/data/cookies'
import { revalidateTag } from 'next/cache'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') console.log('Google 登入 API 被呼叫')
    if (process.env.NODE_ENV === 'development') console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '已設定' : '未設定')
    
    const { credential } = await request.json()
    
    if (!credential) {
      if (process.env.NODE_ENV === 'development') console.error('Missing credential')
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 })
    }

    if (process.env.NODE_ENV === 'development') console.log('收到 credential，準備驗證...')

    // 驗證 Google JWT token（啟用 audience 檢查）
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    if (process.env.NODE_ENV === 'development') console.log('Google token 驗證成功')

    const payload = ticket.getPayload()
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 })
    }

    const { sub: googleId, email, name, picture } = payload

    if (process.env.NODE_ENV === 'development') console.log('Google 用戶資料:', { googleId, email, name })

    // 1. 先嘗試使用標準 Medusa API 創建或找到客戶
    let customer: any = null
    let tokenSet = false
    
    try {
      // 首先嘗試用 email 查找現有客戶
      const existingCustomerResponse = await fetch(
        `${process.env.MEDUSA_BACKEND_URL}/store/customers/me`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': (await import('@lib/medusa-publishable-key')).getPublishableKeyForBackend(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL),
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
            'x-publishable-api-key': (await import('@lib/medusa-publishable-key')).getPublishableKeyForBackend(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL),
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
        if (process.env.NODE_ENV === 'development') console.log('成功創建新客戶:', customer?.email)

        // 取得存取權杖（使用相同密碼登入）
        const loginAfterCreate = await fetch(
          `${process.env.MEDUSA_BACKEND_URL}/store/auth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': (await import('@lib/medusa-publishable-key')).getPublishableKeyForBackend(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL),
            },
            body: JSON.stringify({
              email: email,
              password: `google_oauth_${googleId}`,
            }),
          }
        )

        if (loginAfterCreate.ok) {
          const authData = await loginAfterCreate.json()
          if (authData.access_token) {
            await setAuthToken(authData.access_token)
            const customerCacheTag = await getCacheTag("customers")
            revalidateTag(customerCacheTag)
            tokenSet = true
            return NextResponse.json({ success: true, customer, message: 'Google 登入成功 (新帳戶)' })
          }
        }
      } else {
        const errorText = await createCustomerResponse.text()
        if (process.env.NODE_ENV === 'development') console.log('創建客戶失敗:', createCustomerResponse.status, errorText)
        
        // 如果創建失敗（可能是因為 email 已存在），嘗試登入
        const loginResponse = await fetch(
          `${process.env.MEDUSA_BACKEND_URL}/store/auth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': (await import('@lib/medusa-publishable-key')).getPublishableKeyForBackend(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL),
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
          if (process.env.NODE_ENV === 'development') console.log('成功登入現有客戶:', customer?.email)
          
          // 設置認證 token
          if (authData.access_token) {
            await setAuthToken(authData.access_token)
            const customerCacheTag = await getCacheTag("customers")
            revalidateTag(customerCacheTag)

            tokenSet = true
            return NextResponse.json({
              success: true,
              customer: customer,
              message: 'Google 登入成功 (現有帳戶)'
            })
          }
        }
      }
    } catch (customerError) {
      if (process.env.NODE_ENV === 'development') console.error('Medusa 客戶處理錯誤:', customerError)
    }

    // 2. 嚴格要求必須設置 token 才算成功
    if (!customer || !tokenSet) {
      return NextResponse.json({ error: '無法創建或登入用戶（未獲取授權）' }, { status: 401 })
    }

    // 3. 理論上已於上面 return，不會走到此處
    return NextResponse.json({ success: true, customer, message: 'Google 登入成功' })

  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') console.error('Google 登入錯誤:', error)
    return NextResponse.json({ 
      error: error.message || 'Google login failed' 
    }, { status: 500 })
  }
}

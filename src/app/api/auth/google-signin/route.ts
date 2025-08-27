import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { setAuthToken, getCacheTag } from '@lib/data/cookies'
import { revalidateTag } from 'next/cache'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()
    
    if (!credential) {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 })
    }

    // 驗證 Google JWT token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 })
    }

    const { sub: googleId, email, name, picture } = payload

    // 1. 先確保 Medusa 有 customer 資料
    const medusaResponse = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/customers/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
      },
      body: JSON.stringify({
        google_id: googleId,
        email,
        first_name: name?.split(' ')[0] || '',
        last_name: name?.split(' ').slice(1).join(' ') || '',
        avatar: picture,
      }),
    })

    let responseData
    try {
      const responseText = await medusaResponse.text()
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { customer: null }
    }
    const { customer } = responseData

    if (!customer) {
      return NextResponse.json({ error: 'Failed to create or find customer' }, { status: 500 })
    }

    // 2. 使用 Medusa SDK 為 Google 用戶創建認證會話
    try {
      // 檢查用戶是否已經有 email/password 認證
      const authResponse = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/customers/google/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({
          customer_id: customer.id,
          email: customer.email,
          google_id: googleId,
        }),
      })

      if (authResponse.ok) {
        const authData = await authResponse.json()
        
        if (authData.token) {
          // 如果後端成功生成了 JWT token，使用它
          await setAuthToken(authData.token)
          
          const customerCacheTag = await getCacheTag("customers")
          revalidateTag(customerCacheTag)

          return NextResponse.json({ 
            success: true, 
            customer: customer,
            message: 'Google 登入成功'
          })
        }
      }
    } catch (authError) {
      console.error('Medusa auth error:', authError)
    }

    // 3. 如果無法生成正式的 JWT，則使用 Google OAuth session
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

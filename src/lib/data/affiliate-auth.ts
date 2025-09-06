"use server"

import "server-only"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAffiliateStoreApiUrl } from '../affiliate-config'
import { getPublishableKeyForBackend } from '../medusa-publishable-key'

type AffiliateSession = {
  id: string
  email: string
  displayName?: string
  website?: string
  status: 'approved' | 'pending'
  created_at: string
}

const COOKIE_NAME = '_affiliate_jwt'

export async function setAffiliateAuthToken(payload: AffiliateSession) {
  const cookieStore = await cookies()
  const token = Buffer.from(JSON.stringify(payload)).toString('base64')
  cookieStore.set(COOKIE_NAME, token, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function removeAffiliateAuthToken() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', { maxAge: -1 })
}

export async function retrieveAffiliate(): Promise<AffiliateSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    const json = Buffer.from(token, 'base64').toString()
    const session = JSON.parse(json) as AffiliateSession
    return session
  } catch {
    return null
  }
}

export async function affiliateLogin(
  _state: unknown,
  formData: FormData
) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const countryCode = String(formData.get('countryCode') || 'tw')

  if (!email || !password) return '請輸入電子郵件與密碼'
  
  // 測試模式：如果使用特定測試帳號，直接設置認證 token
  if (email === 'test@affiliate.com' && password === 'test123') {
    // 使用固定的測試 ID，確保每次登入都相同
    await setAffiliateAuthToken({
      id: 'aff_test',
      email: 'test@affiliate.com',
      displayName: '測試聯盟夥伴',
      website: 'https://test-affiliate.com',
      status: 'approved',
      created_at: new Date().toISOString(),
    })
    
    redirect(`/${countryCode}/affiliate`)
  }
  
  // 聯盟會員登入邏輯 - 使用本地驗證，不需要調用外部 API
  // 使用 email 前綴作為固定的聯盟會員 ID
  const emailPrefix = email.split('@')[0]
  const affiliateId = `aff_${emailPrefix}`
  
  // 簡單的本地驗證邏輯（可以根據需要擴展）
  let isValidLogin = false
  
  // 未來可以在這裡添加其他驗證邏輯，例如：
  // - 檢查 JSON 檔案中的聯盟會員資料
  // - 驗證密碼雜湊
  // - 檢查帳號狀態等
  
  // 目前除了測試帳號外，其他帳號都使用預設驗證
  // 可以根據需要修改這個邏輯
  if (email && password) {
    isValidLogin = true
  }
  
  if (!isValidLogin) {
    return '電子郵件或密碼不正確'
  }
  
  console.log('Login successful for affiliate:', affiliateId)
  
  // 設定聯盟會員認證 token
  await setAffiliateAuthToken({
    id: affiliateId,
    email,
    displayName: email.split('@')[0],
    website: email === 'test@affiliate.com' ? 'https://test-affiliate.com' : undefined,
    status: 'approved', // 預設為已審核通過
    created_at: new Date().toISOString(),
  })

  // 重定向到聯盟夥伴儀表板
  redirect(`/${countryCode}/affiliate`)
}

export async function affiliateSignup(
  _state: unknown,
  formData: FormData
) {
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const displayName = String(formData.get('displayName') || '')
  const website = String(formData.get('website') || '')
  const countryCode = String(formData.get('countryCode') || 'tw')
  
  if (!email || !password || !displayName) {
    return '請完整填寫必填欄位'
  }

  try {
    // 使用不需要 publishable key 的專用端點
    // 在 Server Actions 中，環境變數可能不可用，使用VM地址
    const backendUrl = 'http://35.236.182.29:9000'
    const requestUrl = `${backendUrl}/affiliate-apply`
    console.log('Submitting affiliate application to:', requestUrl)
    console.log('Environment MEDUSA_BACKEND_URL:', process.env.MEDUSA_BACKEND_URL)
    console.log('Request payload:', { name: displayName, email, password, website: website || undefined })
    
    // 先測試後端連接
    let res: Response
    try {
      res = await fetch(requestUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          name: displayName,  // 後端期望的是 name 字段
          email, 
          password, 
          website: website || undefined 
        }),
        cache: 'no-store',
      })
      console.log('Fetch completed, status:', res.status)
    } catch (fetchError: any) {
      console.error('Fetch error details:', {
        message: fetchError.message,
        cause: fetchError.cause,
        stack: fetchError.stack,
        name: fetchError.name,
        code: fetchError.code
      })
      throw fetchError
    }
    
    if (!res.ok) {
      const errorResponse = await res.json().catch(() => ({}))
      const errorText = errorResponse.message || errorResponse.error || await res.text().catch(() => '')
      console.error('Backend signup error:', res.status, errorResponse)
      
      // 根據不同錯誤返回不同訊息
      if (res.status === 400) {
        return errorText || '申請資料有誤，請檢查後重新提交'
      } else if (res.status === 409) {
        return '此電子郵件已經申請過或已是會員'
      } else {
        return errorText || '申請提交失敗，請稍後再試'
      }
    }

    const responseData = await res.json().catch(() => ({}))
    console.log('Application submitted successfully:', responseData)

    // 申請成功後設置前端會話
    await setAffiliateAuthToken({
      id: responseData.data?.id || responseData.id || 'temp_' + Math.random().toString(36).slice(2, 8),
      email,
      displayName,
      website,
      status: 'pending',
      created_at: responseData.data?.created_at || responseData.created_at || new Date().toISOString(),
    })

    // 重定向到待審核頁面
    try {
      redirect(`/${countryCode}/affiliate/pending`)
    } catch (redirectError) {
      // redirect() 拋出錯誤是正常的，這是 Next.js 的機制
      throw redirectError
    }
    
  } catch (error: any) {
    // 檢查是否是 redirect 錯誤
    if (error?.digest?.startsWith?.('NEXT_REDIRECT')) {
      // 這是正常的重定向，重新拋出
      throw error
    }
    
    console.error('Network error during signup:', error)
    return '網路連線錯誤，請檢查網路連線後重試'
  }
}

export async function affiliateSignout(countryCode: string) {
  await removeAffiliateAuthToken()
  redirect(`/${countryCode}/login-affiliate`)
}

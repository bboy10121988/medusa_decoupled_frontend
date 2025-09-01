"use server"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAffiliateStoreApiUrl } from '@lib/affiliate-config'
import { getPublishableKeyForBackend } from '@lib/medusa-publishable-key'

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
  
  try {
    // 使用不需要 publishable key 的登入端點
    // 在 Server Actions 中，環境變數可能不可用，使用硬編碼 localhost
    const backendUrl = 'http://localhost:9000'
    const requestUrl = `${backendUrl}/affiliate-login`
    console.log('Attempting affiliate login:', requestUrl)
    console.log('Environment MEDUSA_BACKEND_URL:', process.env.MEDUSA_BACKEND_URL)
    
    let res: Response
    try {
      res = await fetch(requestUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      })
      console.log('Login fetch completed, status:', res.status)
    } catch (fetchError: any) {
      console.error('Login fetch error details:', {
        message: fetchError.message,
        cause: fetchError.cause,
        name: fetchError.name,
        code: fetchError.code
      })
      throw fetchError
    }
    
    if (!res.ok) {
      const errorResponse = await res.json().catch(() => ({}))
      const errorText = errorResponse.message || errorResponse.error || await res.text().catch(() => '')
      console.error('Backend login error:', res.status, errorResponse)
      return errorText || '登入失敗'
    }
    
    const data = await res.json().catch(() => ({}))
    console.log('Login successful:', data.email, 'Status:', data.status)
    
    const status = (data.status as 'approved' | 'pending') || 'pending'
    await setAffiliateAuthToken({
      id: data.id || 'aff_' + Math.random().toString(36).slice(2, 8),
      email,
      displayName: data.displayName || email.split('@')[0],
      website: data.website,
      status,
      created_at: data.created_at || new Date().toISOString(),
    })

    // 重定向到相應頁面
    try {
      redirect(`/${countryCode}/affiliate${status === 'approved' ? '' : '/pending'}`)
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
    
    console.error('Network error during login:', error)
    return '網路連線錯誤，請檢查網路連線後重試'
  }
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
    // 在 Server Actions 中，環境變數可能不可用，使用硬編碼 localhost
    const backendUrl = 'http://localhost:9000'
    const requestUrl = `${backendUrl}/affiliate-apply`
    console.log('Submitting affiliate application to:', requestUrl)
    console.log('Environment MEDUSA_BACKEND_URL:', process.env.MEDUSA_BACKEND_URL)
    console.log('Request payload:', { email, displayName, website: website || undefined })
    
    // 先測試後端連接
    let res: Response
    try {
      res = await fetch(requestUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName, website: website || undefined }),
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

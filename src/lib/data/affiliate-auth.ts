"use server"

import "server-only"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MEDUSA_BACKEND_URL } from '../config'

type AffiliateSession = {
  id: string
  email: string
  displayName?: string
  website?: string
  status: 'approved' | 'pending' | 'rejected' | 'suspended'
  role?: 'user' | 'admin'
  created_at: string
}

const SESSION_COOKIE = '_affiliate_session'
const TOKEN_COOKIE = '_affiliate_token'

export async function setAffiliateAuthToken(payload: AffiliateSession, token: string) {
  const cookieStore = await cookies()

  // Store session data
  const sessionStr = Buffer.from(JSON.stringify(payload)).toString('base64')
  cookieStore.set(SESSION_COOKIE, sessionStr, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Store JWT token
  cookieStore.set(TOKEN_COOKIE, token, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function removeAffiliateAuthToken() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, '', { maxAge: -1 })
  cookieStore.set(TOKEN_COOKIE, '', { maxAge: -1 })
}

export async function getAffiliateToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_COOKIE)?.value
}

export async function retrieveAffiliate(): Promise<AffiliateSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionStr = cookieStore.get(SESSION_COOKIE)?.value
    if (!sessionStr) return null
    const json = Buffer.from(sessionStr, 'base64').toString()
    return JSON.parse(json) as AffiliateSession
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
      cache: 'no-store'
    })

    if (!res.ok) {
      const error = await res.json()
      return error.message || '登入失敗'
    }

    const data = await res.json()
    await setAffiliateAuthToken(data.session, data.token)

    if (data.session.role === 'admin') {
      redirect(`/${countryCode}/affiliate/manager`)
    } else {
      redirect(`/${countryCode}/affiliate`)
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    return '發生錯誤，請稍後再試'
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        first_name: displayName,
        email,
        password,
        phone: '', // Optional
        metadata: { website }
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const error = await res.json()
      return error.message || '註冊失敗'
    }

    const data = await res.json()

    // Auto login or redirect to login?
    // The requirement says "pending" status usually.
    // Let's set session as pending.

    await setAffiliateAuthToken({
      id: data.affiliate.id,
      email: data.affiliate.email,
      displayName,
      website,
      status: data.affiliate.status,
      role: data.affiliate.role || 'user',
      created_at: new Date().toISOString(),
    }, '') // No token yet if pending, or maybe backend should return token for pending user?
    // Actually, if pending, they might not be able to login.
    // But let's redirect to pending page.

    redirect(`/${countryCode}/affiliate/pending`)

  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    return '發生錯誤，請稍後再試'
  }
}

export async function affiliateSignout(countryCode: string) {
  await removeAffiliateAuthToken()
  redirect(`/${countryCode}/login-affiliate`)
}

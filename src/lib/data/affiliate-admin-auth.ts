"use server"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type AdminSession = {
  id: string
  email: string
  role: 'admin'
  created_at: string
  token: string
}

const COOKIE = '_affiliate_admin_jwt'

export async function setAffiliateAdminToken(payload: AdminSession) {
  const c = await cookies()
  const token = Buffer.from(JSON.stringify(payload)).toString('base64')
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function removeAffiliateAdminToken() {
  const c = await cookies()
  c.set(COOKIE, '', { maxAge: -1 })
}

export async function retrieveAffiliateAdmin(): Promise<AdminSession | null> {
  try {
    const c = await cookies()
    const token = c.get(COOKIE)?.value
    if (!token) return null
    const json = Buffer.from(token, 'base64').toString()
    return JSON.parse(json) as AdminSession
  } catch {
    return null
  }
}

import { sdk } from '@lib/config'

export async function affiliateAdminLogin(_s: unknown, form: FormData) {
  const email = String(form.get('email') || '')
  const password = String(form.get('password') || '')
  const countryCode = String(form.get('countryCode') || 'tw')
  if (!email || !password) return '請輸入帳密'

  try {
    // 使用 Medusa Admin 憑證登入
    const adminToken = await sdk.auth.login('admin', 'emailpass', { email, password })

    await setAffiliateAdminToken({
      id: 'adm_' + Math.random().toString(36).slice(2, 8),
      email,
      role: 'admin',
      created_at: new Date().toISOString(),
      token: String(adminToken),
    })
  } catch (e: any) {
    const msg = e?.message || '登入失敗，請檢查帳號密碼'
    return msg
  }
  redirect(`/${countryCode}/affiliate-admin`)
}

export async function affiliateAdminSignout(countryCode: string) {
  await removeAffiliateAdminToken()
  redirect(`/${countryCode}/affiliate-admin/login`)
}

/**
 * Google OAuth 真實 email 管理工具
 * 用於在前端顯示真實的 Google email 而不是 debug email
 */

// 從 localStorage 獲取真實的 Google email
export function getRealGoogleEmail(): string | null {
  if (typeof window === 'undefined') return null
  
  return localStorage.getItem('google_real_email') || localStorage.getItem('customer_display_email')
}

// 設置真實的 Google email 到 localStorage
export function setRealGoogleEmail(email: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('google_real_email', email)
  localStorage.setItem('customer_display_email', email)
  console.log('💾 已設置真實 Google email:', email)
}

// 清除存儲的真實 email (登出時使用)
export function clearRealGoogleEmail(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('google_real_email')
  localStorage.removeItem('customer_display_email')
  console.log('🗑️ 已清除存儲的真實 email')
}

// 獲取顯示用的 email (優先使用真實 email，否則使用傳入的 fallback email)
export function getDisplayEmail(fallbackEmail?: string): string {
  const realEmail = getRealGoogleEmail()
  
  if (realEmail && !realEmail.startsWith('debug-')) {
    return realEmail
  }
  
  return fallbackEmail || ''
}

// 檢查是否為 debug email
export function isDebugEmail(email?: string): boolean {
  return Boolean(email?.startsWith('debug-'))
}

// 嘗試從 API 獲取真實 email (如果 localStorage 中沒有)
export async function fetchRealGoogleEmail(customerId: string): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/update-google-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.realEmail) {
        setRealGoogleEmail(data.realEmail)
        return data.realEmail
      }
    }
  } catch (error) {
    console.warn('⚠️ 無法獲取真實 Google email:', error)
  }
  
  return null
}
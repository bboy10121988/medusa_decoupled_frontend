"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * Google OAuth Callback Redirect Handler
 * 
 * 此頁面處理從 Google 返回的 OAuth callback（無國家代碼）
 * 並重定向到包含國家代碼的正確路徑
 * 
 * Flow:
 * Google → /auth/google/callback?code=xxx&state=xxx
 * → Redirect to → /tw/auth/google/callback?code=xxx&state=xxx
 */
export default function GoogleCallbackRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 獲取所有查詢參數
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const scope = searchParams.get('scope')
    const authuser = searchParams.get('authuser')
    const prompt = searchParams.get('prompt')

    console.log("=== Google OAuth Callback Redirect ===")
    console.log("Received at: /auth/google/callback")
    console.log("Query params:", { code: code?.substring(0, 10) + "...", state, scope, authuser, prompt })

    // 預設使用 'tw' 國家代碼
    // 如果需要支援多國家，可以從 localStorage 或 cookie 讀取使用者偏好
    const countryCode = 'tw'

    // 建立新的查詢字串
    const queryString = new URLSearchParams()
    if (code) queryString.set('code', code)
    if (state) queryString.set('state', state)
    if (scope) queryString.set('scope', scope)
    if (authuser) queryString.set('authuser', authuser)
    if (prompt) queryString.set('prompt', prompt)

    const redirectUrl = `/${countryCode}/auth/google/callback?${queryString.toString()}`
    
    console.log("Redirecting to:", redirectUrl)
    
    // 使用 window.location.href 進行完整重定向，保留所有查詢參數
    window.location.href = redirectUrl
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="text-gray-600">正在處理 Google 登入...</p>
      </div>
    </div>
  )
}

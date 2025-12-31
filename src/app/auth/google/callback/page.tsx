"use client"

import { useEffect, useState, Suspense } from "react"
// import { useSearchParams } from "next/navigation"
import { sdk } from "@/lib/config"
import { decodeToken } from "react-jwt"

function GoogleCallbackContent() {
  console.log("google callback page loaded")

//   const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const DEFAULT_COUNTRY_CODE = process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "tw"

  const validateCallback = async () => {
    setStatus('loading')

    // 取得網址上的 query parameters (含 code, state 等)
    const searchParams = new URLSearchParams(window.location.search)
    const queryParams = Object.fromEntries(searchParams.entries())

    console.log("query params:",queryParams)

    try {
      // 1. 驗證回呼，這會自動在 SDK 中設定 JWT Token
    
      const token = await sdk.auth.callback("customer", "google", queryParams)
      console.log("received token:", token)

      // 2. 解碼 Token 檢查 actor_id (顧客 ID)
      const decodedToken = decodeToken(token) as {
        actor_id: string
        user_metadata: Record<string, unknown>
      }

      console.log("decoded token:", decodedToken)

      if (decodedToken.actor_id === "") {
        // 3. 如果顧客不存在，使用 Token 建立顧客資料
        await createCustomer(decodedToken.user_metadata.email as string)
        // 4. 建立後需重新整理 Token 以取得完整的顧客資訊
        await refreshToken()
      }

      // 登入成功，導向首頁
      window.location.href = "/" + DEFAULT_COUNTRY_CODE + "/account/profile"
    } catch (error) {
      setStatus('error')
      console.error("認證失敗", error)
    }
  }

  const createCustomer = async (email: string) => {
    await sdk.store.customer.create({
      email,
    })
  }

  const refreshToken = async () => {
    await sdk.auth.refresh()
  }

  useEffect(() => {
    validateCallback()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">處理登入中...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">登入成功!</h1>
            <p className="mt-2 text-gray-600">正在跳轉到會員中心...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <svg className="w-16 h-16 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">登入失敗</h1>
            
            <p className="mt-4 text-sm text-gray-500">正在返回帳戶頁面...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">處理登入中...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}

"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { sdk } from "@/lib/config"
import { decodeToken } from "react-jwt"
import { syncAffiliateSession } from "@/lib/data/affiliate-sync"

function GoogleCallbackContent() {

  console.log("google callback page loaded")

  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const countryCode = (params.countryCode as string) || 'tw'

  const validateCallback = async () => {

    alert("Google Callback Triggered")

    // 取得網址上的 query parameters (含 code, state 等)
    const searchParams = new URLSearchParams(window.location.search)
    const queryParams = Object.fromEntries(searchParams.entries())

    try {
      // 1. 驗證回呼，這會自動在 SDK 中設定 JWT Token
      const token = await sdk.auth.callback("customer", "google", queryParams)

      // 2. 解碼 Token 檢查 actor_id (顧客 ID)
      const decodedToken = decodeToken(token)
      const userExists = decodedToken.actor_id !== ""

      if (!userExists) {
        // 3. 如果顧客不存在，使用 Token 建立顧客資料
        // user_metadata 通常包含從 Google 取得的 email
        await sdk.store.customer.create({
          email: decodedToken.user_metadata.email
        })

        // 4. 建立後需重新整理 Token 以取得完整的顧客資訊
        await sdk.auth.refresh()
      }

      // 登入成功，導向首頁
      window.location.href = "/"
    } catch (error) {
      console.error("認證失敗", error)
    }
  }

  useEffect(()=>{
    validateCallback()
  },[])

  // useEffect(() => {
  //   const success = searchParams.get('success')
  //   const error = searchParams.get('error')
  //   const code = searchParams.get('code')
  //   const state = searchParams.get('state')

  //   console.log('=== Google OAuth Callback ===')
  //   console.log('Success:', success)
  //   console.log('Error:', error)
  //   console.log('Code:', code ? 'Received' : 'None')

  //   if (success === 'true') {
  //     setStatus('success')
  //     console.log('✅ Google 登入成功!')

  //     syncAffiliateSession().then((res) => {
  //       console.log('🔗 Affiliate sync result:', res)
  //     })

  //     setTimeout(() => {
  //       router.push(`/${countryCode}/account`)
  //     }, 1000)

  //   } else if (code) {
  //     console.log('🔄 收到授權碼，正在驗證...')

  //     sdk.auth.callback("customer", "google", {
  //       code,
  //       state: state || undefined
  //     })
  //       .then(async (res) => {
  //         console.log('✅ 驗證成功:', res)

  //         await syncAffiliateSession()

  //         setStatus('success')
  //         setTimeout(() => {
  //           router.push(`/${countryCode}/account`)
  //         }, 1000)
  //       })
  //       .catch((err) => {
  //         console.error('❌ 驗證失敗:', err)
  //         setStatus('error')
  //       })

  //   } else if (error) {
  //     setStatus('error')
  //     console.error('❌ Google 登入失敗:', error)

  //     setTimeout(() => {
  //       router.push(`/${countryCode}/account`)
  //     }, 3000)
  //   }
  // }, [searchParams, router, countryCode])

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
            <p className="mt-2 text-gray-600 break-words">
              {searchParams.get('error') || '發生未知錯誤'}
            </p>
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

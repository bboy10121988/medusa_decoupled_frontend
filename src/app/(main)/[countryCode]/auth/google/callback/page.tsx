"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"

function GoogleCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const countryCode = (params.countryCode as string) || 'tw'

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    console.log('=== Google OAuth Callback ===')
    console.log('Success:', success)
    console.log('Error:', error)

    if (success === 'true') {
      setStatus('success')
      console.log('✅ Google 登入成功!')
      
      setTimeout(() => {
        router.push(`/${countryCode}/account`)
      }, 1000)
      
    } else if (error) {
      setStatus('error')
      console.error('❌ Google 登入失敗:', error)
      
      setTimeout(() => {
        router.push(`/${countryCode}/account`)
      }, 3000)
    }
  }, [searchParams, router, countryCode])

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

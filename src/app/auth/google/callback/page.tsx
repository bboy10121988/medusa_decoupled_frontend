"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { handleGoogleCallback } from "@lib/data/google-auth"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // 從 state 參數解析國家代碼
        const stateParam = searchParams.get('state')
        let countryCode = 'tw' // 預設值
        
        if (stateParam) {
          try {
            const stateData = JSON.parse(decodeURIComponent(stateParam))
            countryCode = stateData.countryCode || 'tw'
          } catch (error) {
            console.warn('無法解析 state 參數，使用預設國家代碼:', error)
          }
        }

        // 處理 Google OAuth 回調
        const result = await handleGoogleCallback(searchParams, countryCode)
        
        if (result.success) {
          setStatus('success')
          // 重定向將由 handleGoogleCallback 處理
        } else {
          setStatus('error')
          setErrorMessage(result.error || '登入處理失敗')
        }
      } catch (error: any) {
        console.error('Google 回調處理錯誤:', error)
        setStatus('error')
        setErrorMessage(error.message || '登入處理失敗')
      }
    }

    processCallback()
  }, [searchParams, router])

  // 錯誤處理 - 重定向到對應的登入頁面
  useEffect(() => {
    if (status === 'error') {
      const stateParam = searchParams.get('state')
      let countryCode = 'tw'
      
      if (stateParam) {
        try {
          const stateData = JSON.parse(decodeURIComponent(stateParam))
          countryCode = stateData.countryCode || 'tw'
        } catch (error) {
          console.warn('解析 state 參數失敗，使用預設值:', error)
        }
      }

      // 延遲重定向，讓使用者看到錯誤訊息
      const timer = setTimeout(() => {
        router.push(`/${countryCode}/account/login?error=${encodeURIComponent(errorMessage)}`)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [status, errorMessage, router, searchParams])

  if (status === 'processing') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">正在處理 Google 登入...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">登入失敗</h1>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <p className="text-sm text-gray-500">3 秒後將重定向到登入頁面...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-green-600 mb-4">登入成功</h1>
        <p className="text-gray-600">正在重定向...</p>
      </div>
    </div>
  )
}
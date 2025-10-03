"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { sdk } from "@lib/config"

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 獲取 URL 參數中的授權碼
        const code = searchParams?.get('code')
        const state = searchParams?.get('state')
        
        if (!code) {
          throw new Error('未收到 Google 授權碼')
        }

        setMessage('正在處理 Google 登入...')

        // 使用 Medusa SDK 完成 OAuth 流程
        const result = await sdk.auth.callback("customer", "google", {
          code,
          ...(state && { state })
        })

        if (result && typeof result === 'string') {
          // 設置認證 token
          await fetch('/api/auth/set-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: result }),
          })

          setStatus('success')
          setMessage('Google 登入成功！正在跳轉...')
          
          // 成功後跳轉到會員中心
          setTimeout(() => {
            router.push('/tw/account')
          }, 1500)
        } else {
          throw new Error('登入回應格式異常')
        }
      } catch (error: any) {
        console.error('Google OAuth 回調處理失敗:', error)
        setStatus('error')
        setMessage(error.message || 'Google 登入失敗，請重試')
        
        // 錯誤後跳轉回登入頁面
        setTimeout(() => {
          router.push('/tw/account/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">處理中</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">登入成功</h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">登入失敗</h2>
            </>
          )}
          
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  )
}
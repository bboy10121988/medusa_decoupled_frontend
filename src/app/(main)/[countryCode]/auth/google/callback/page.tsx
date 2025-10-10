"use client"

import { useEffect, useState, Suspense, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { handleGoogleCallback } from "@lib/data/google-auth"

interface GoogleCallbackContentProps {
  params: Promise<{ countryCode: string }>
}

function GoogleCallbackContent({ params }: GoogleCallbackContentProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code')
        const stateParam = searchParams.get('state')
        const error = searchParams.get('error')
        
        if (error) {
          setStatus('error')
          setMessage(`OAuth 錯誤: ${error}`)
          setTimeout(() => {
            router.push(`/${resolvedParams.countryCode}/account`)
          }, 3000)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('缺少授權代碼')
          setTimeout(() => {
            router.push(`/${resolvedParams.countryCode}/account`)
          }, 3000)
          return
        }

        setStatus('loading')
        setMessage('處理 Google 登入中...')

        const redirectUri =
          typeof window !== 'undefined'
            ? `${window.location.origin}${window.location.pathname}`
            : undefined

        const result = await handleGoogleCallback({
          code,
          state: stateParam || '',
          ...(redirectUri ? { redirect_uri: redirectUri } : {}),
        })

        if (result.success) {
          setStatus('success')
          setMessage('登入成功！正在重定向...')

          setTimeout(() => {
            router.replace(`/${resolvedParams.countryCode}/account`)
          }, 1500)
        } else {
          setStatus('error')
          setMessage(result.error || '登入失敗')
          setTimeout(() => {
            router.push(`/${resolvedParams.countryCode}/account`)
          }, 3000)
        }
      } catch (error) {
        console.error('Google callback error:', error)
        setStatus('error')
        setMessage('處理 Google 登入時發生錯誤')
        setTimeout(() => {
          router.push(`/${resolvedParams.countryCode}/account`)
        }, 3000)
      }
    }
    
    processCallback()
  }, [searchParams, router, resolvedParams.countryCode])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                正在處理 Google 登入...
              </h2>
              <p className="text-gray-600">請稍候</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                {message}
              </h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">
                登入失敗
              </h2>
              <p className="text-red-600 mb-4">{message}</p>
              <p className="text-gray-600 text-sm">即將重定向到登入頁面...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage({ params }: GoogleCallbackContentProps) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <GoogleCallbackContent params={params} />
    </Suspense>
  )
}

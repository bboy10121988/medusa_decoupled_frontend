/**
 * Google Identity Services (GIS) 登入組件
 * 使用新版 Google Identity API 取代舊版 OAuth flow
 * 參考：https://developers.google.com/identity/gsi/web/guides/overview
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface GoogleGISLoginProps {
  onSuccess?: (response: any) => void
  onError?: (error: string) => void
  countryCode?: string
}

// Google Client ID (從環境變數或配置中獲取)
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (params: any) => void
          renderButton: (element: HTMLElement, options: any) => void
          prompt: () => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

const GoogleGISLogin = ({ onSuccess, onError, countryCode = 'tw' }: GoogleGISLoginProps) => {
  const router = useRouter()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

  // 解析 JWT Token (瀏覽器友好版本)
  const decodeJwtResponse = (token: string) => {
    try {
      // 取得 JWT payload 部分 (第二段)
      const base64Url = token.split('.')[1]
      if (!base64Url) {
        throw new Error('Invalid JWT format')
      }
      
      // 將 base64url 轉換為標準 base64
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      
      // 補齊 padding
      while (base64.length % 4) {
        base64 += '='
      }
      
      // 使用瀏覽器原生的 atob 函數解碼
      const decodedData = atob(base64)
      
      // 將解碼後的數據轉換為 JSON
      return JSON.parse(decodedData)
    } catch (error) {
      console.error('JWT 解析失敗:', error)
      return null
    }
  }

  // 處理 Google 登入回應
  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true)
      setError(null)

      const payload = decodeJwtResponse(response.credential)
      
      if (!payload) {
        throw new Error('無法解析 Google 憑證')
      }

      console.log('🎯 Google 登入成功:', {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture
      })

      // 發送到我們的後端處理
      const loginResponse = await fetch('/api/auth/google/gis-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          credential: response.credential,
          user_info: {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            given_name: payload.given_name,
            family_name: payload.family_name,
            picture: payload.picture
          }
        }),
      })

      const data = await loginResponse.json()

      if (loginResponse.ok && data.success) {
        console.log('✅ 後端處理成功')
        
        if (onSuccess) {
          onSuccess(data)
        } else {
          router.push(`/${countryCode}/account`)
          router.refresh()
        }
      } else if (data.suggestion?.action === 'use_traditional_google_login') {
        const message = `${data.message}\n\n建議：${data.suggestion.description}`
        throw new Error(message)
      } else {
        throw new Error(data.message || '登入處理失敗')
      }

    } catch (error: any) {
      console.error('❌ Google 登入失敗:', error)
      const message = error.message || '登入失敗，請稍後再試'
      setError(message)
      if (onError) onError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // 載入 Google Identity Services
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        setIsGoogleLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        setIsGoogleLoaded(true)
      }
      script.onerror = () => {
        setError('無法載入 Google 登入服務')
      }
      document.head.appendChild(script)
    }

    loadGoogleScript()
  }, [])

  // 初始化 Google Identity Services
  useEffect(() => {
    if (isGoogleLoaded && window.google?.accounts?.id && buttonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: "100%"
        })

        // 可以選擇性啟用 One Tap
        // window.google.accounts.id.prompt()

      } catch (error) {
        console.error('Google Identity 初始化失敗:', error)
        setError('Google 登入初始化失敗')
      }
    }
  }, [isGoogleLoaded])

  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
    return (
      <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">請設定 GOOGLE_CLIENT_ID 環境變數</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-blue-600">處理 Google 登入中...</p>
          </div>
        </div>
      )}

      <div 
        ref={buttonRef} 
        className={`w-full ${!isGoogleLoaded ? 'opacity-50' : ''}`}
        style={{ minHeight: '44px' }}
      />

      {!isGoogleLoaded && (
        <div className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-50">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-600">載入 Google 登入中...</span>
        </div>
      )}
    </div>
  )
}

export default GoogleGISLogin
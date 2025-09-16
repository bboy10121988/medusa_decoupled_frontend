"use client"

import { useEffect, useRef, useState } from "react"
import GoogleApiManager from "@lib/google-api-manager"

interface GoogleLoginButtonProps {
  onSuccess?: (response: any) => void
  onError?: (error: string) => void
}

const GoogleLoginButton = ({ onSuccess, onError }: GoogleLoginButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCredentialResponse = async (response: any) => {
    try {
      if (!response?.credential) {
        throw new Error('沒有收到 Google 憑證')
      }

      const result = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })

      if (!result.ok) {
        let errorData: any
        try {
          errorData = await result.json()
        } catch {
          errorData = await result.text()
        }
        let errorMessage = errorData?.error || errorData || `HTTP ${result.status}: Google 登入失敗`
        if (result.status === 400) errorMessage = 'Google 登入配置錯誤，請檢查網域設定或聯繫管理員'
        else if (result.status === 401) errorMessage = 'Google 登入驗證失敗，請重試'
        throw new Error(errorMessage)
      }

      const data = await result.json()
      if (onSuccess) onSuccess(data)
      else window.location.href = '/tw/account'
    } catch (err: any) {
      const msg = err?.message || 'Google 登入失敗，請稍後再試'
      setError(msg)
      if (onError) onError(msg)
    }
  }

  useEffect(() => {
    let mounted = true
    const manager = GoogleApiManager.getInstance()

    async function setup() {
      try {
        await manager.initializeGoogle()
        if (!mounted) return
        setIsLoaded(true)
        if (buttonRef.current) {
          manager.renderButton(buttonRef.current, handleCredentialResponse, (e) => {
            const msg = e || 'Google 按鈕渲染失敗'
            setError(msg)
            if (onError) onError(msg)
          })
        }
      } catch (err: any) {
        const msg = err?.message || 'Google 初始化失敗'
        setError(msg)
        if (onError) onError(msg)
      }
    }

    setup()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div ref={buttonRef} className="w-full" style={{ minHeight: '44px' }} />

      {!isLoaded && (
        <div className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">載入 Google 登入...</span>
        </div>
      )}
    </div>
  )
}

export default GoogleLoginButton

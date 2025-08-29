"use client"

import { useEffect, useRef, useState } from "react"

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
      console.log('收到 Google 憑證:', response)
      
      if (!response.credential) {
        throw new Error('沒有收到 Google 憑證')
      }
      
      // 將 JWT token 發送到後端進行驗證
      const result = await fetch('/api/auth/google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          credential: response.credential 
        }),
      })

      if (!result.ok) {
        let errorData
        try {
          errorData = await result.json()
          console.error('後端驗證失敗 (JSON):', errorData)
        } catch (parseError) {
          errorData = await result.text()
          console.error('後端驗證失敗 (TEXT):', errorData)
        }
        
        // 提供更具體的錯誤訊息
        let errorMessage = errorData?.error || errorData || `HTTP ${result.status}: Google 登入失敗`
        if (result.status === 400) {
          errorMessage = 'Google 登入配置錯誤，請檢查網域設定或聯繫管理員'
        } else if (result.status === 401) {
          errorMessage = 'Google 登入驗證失敗，請重試'
        }
        
        throw new Error(errorMessage)
      }

      const data = await result.json()
      console.log('Google 登入成功:', data)
      
      // 刷新頁面或重定向
      if (onSuccess) {
        onSuccess(data)
      } else {
        window.location.href = '/tw/account'
      }
    } catch (error: any) {
      console.error('Google 登入錯誤:', error)
      const errorMessage = error.message || 'Google 登入失敗，請稍後再試'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    }
  }

  useEffect(() => {
    // 載入 Google 腳本
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('Google Script 載入完成')
      setIsLoaded(true)
      
      if (window.google && buttonRef.current) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        
        if (!clientId) {
          console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID 環境變數未設定')
          setError('Google 登入設定錯誤，請聯繫管理員')
          return
        }
        
        console.log('使用 Google Client ID:', clientId)
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          // 添加更多錯誤處理選項
          use_fedcm_for_prompt: false,
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        })
      }
    }
    script.onerror = () => {
      console.error('Google Script 載入失敗')
      setError('Google 登入腳本載入失敗，請檢查網路連接')
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div 
        ref={buttonRef} 
        className="w-full"
        style={{ minHeight: '44px' }}
      />
      
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

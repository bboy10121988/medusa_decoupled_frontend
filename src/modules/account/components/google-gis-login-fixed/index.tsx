/**
 * Google Identity Services (GIS) 登入組件 - 簡化修復版
 * 移除複雜的 JWT 解碼，專注於核心功能
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

// 聲明 Google Identity Services 的類型
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, options: any) => void
          prompt: () => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

interface GoogleLoginProps {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  clientId?: string
}

export default function GoogleGISLoginFixed({ 
  onSuccess, 
  onError,
  clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID 
}: GoogleLoginProps) {
  const router = useRouter()
  const pathname = usePathname()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

  // 從路徑中提取國家代碼
  const countryCode = pathname.split('/')[1] || 'tw'

  // 處理 Google 登入回調
  const handleCredentialResponse = async (response: any) => {
    console.log('🎯 收到 Google 憑證，發送至後端處理...', {
      hasCredential: !!response.credential,
      credentialLength: response.credential?.length,
      credentialPreview: response.credential?.substring(0, 50) + '...'
    })
    
    setIsLoading(true)
    setError(null)

    try {
      // 發送憑證到後端進行驗證和註冊/登入
      const loginResponse = await fetch('/api/auth/google/gis-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      })

      console.log('📡 請求完成:', {
        status: loginResponse.status,
        statusText: loginResponse.statusText,
        ok: loginResponse.ok,
        headers: Object.fromEntries(loginResponse.headers.entries())
      })

      let data
      try {
        data = await loginResponse.json()
        console.log('📡 後端完整回應:', {
          status: loginResponse.status,
          statusText: loginResponse.statusText,
          data: data,
          dataType: typeof data,
          dataKeys: Object.keys(data || {})
        })
      } catch (jsonError) {
        console.error('❌ 無法解析後端回應 JSON:', jsonError)
        const textResponse = await loginResponse.text()
        console.error('原始回應內容:', textResponse)
        throw new Error(`後端回應無效 (HTTP ${loginResponse.status}): ${textResponse}`)
      }
      
      if (data && data.success) {
        console.log('✅ GIS 登入成功:', data)
        
        if (onSuccess) {
          onSuccess(data)
        } else {
          // 重定向到會員中心
          const targetPath = `/${countryCode}/account`
          console.log('🔄 重定向到會員中心...')
          console.log('📍 當前位置:', window.location.href)
          console.log('📍 目標位置:', targetPath)
          
          // 先驗證認證狀態，然後再決定重定向
          console.log('🔄 驗證認證狀態...')
          
          // 等待一下讓 cookie 設置完成，然後驗證認證狀態
          setTimeout(async () => {
            try {
              console.log('🔍 檢查認證狀態...')
              const authCheck = await fetch('/api/auth/customer', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-cache'
              })
              
              console.log('📡 認證檢查結果:', {
                status: authCheck.status,
                ok: authCheck.ok
              })
              
              if (authCheck.ok) {
                const authData = await authCheck.json()
                console.log('✅ 認證狀態確認成功:', authData)
                
                // 檢查是否已在目標頁面
                if (window.location.pathname === targetPath) {
                  console.log('📍 已在目標頁面且已認證，刷新頁面')
                  window.location.reload()
                } else {
                  console.log('🔄 導航到認證頁面')
                  window.location.href = targetPath
                }
              } else {
                console.log('❌ 認證狀態檢查失敗，等待更長時間後重試...')
                // 如果認證檢查失敗，等待更長時間後重試
                setTimeout(() => {
                  window.location.reload()
                }, 2000)
              }
            } catch (error) {
              console.error('❌ 認證狀態檢查錯誤:', error)
              // 出錯時直接刷新頁面
              window.location.reload()
            }
          }, 1000)
        }
      } else {
        console.error('❌ 後端註冊失敗:', {
          success: data?.success,
          message: data?.message,
          details: data?.details,
          statusCode: data?.statusCode,
          httpStatus: loginResponse.status,
          rawData: data
        })
        throw new Error(data?.message || `登入處理失敗 (HTTP ${loginResponse.status})`)
      }

    } catch (error) {
      console.error('❌ Google 登入錯誤:', error)
      setError(error instanceof Error ? error.message : '登入失敗，請稍後再試')
      if (onError) {
        onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 載入 Google Identity Services
  useEffect(() => {
    if (!clientId) {
      console.error('❌ 缺少 Google Client ID')
      setError('缺少 Google 登入配置')
      return
    }

    console.log('🔄 載入 Google Identity Services...', {
      clientId,
      origin: window.location.origin,
      hasClientId: !!clientId
    })

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('✅ Google Identity Services 載入完成')
      setIsGoogleLoaded(true)
    }
    script.onerror = () => {
      console.error('❌ Google Identity Services 載入失敗')
      setError('Google 登入服務載入失敗')
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [clientId])

  // 初始化 Google Identity Services
  useEffect(() => {
    if (!isGoogleLoaded || !window.google || !clientId) return

    console.log('🔧 初始化 Google Identity Services...', {
      clientId,
      origin: window.location.origin,
      buttonElement: !!buttonRef.current
    })

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 280,
        })
        console.log('✅ Google 登入按鈕已渲染')
      }
    } catch (error) {
      console.error('❌ Google Identity Services 初始化失敗:', error)
      setError('Google 登入初始化失敗')
    }
  }, [isGoogleLoaded, clientId])

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-2">登入錯誤</div>
        <div className="text-sm text-gray-600">{error}</div>
        <button 
          onClick={() => {
            setError(null)
            window.location.reload()
          }}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          重試
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        ref={buttonRef} 
        className={`min-h-[44px] min-w-[280px] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      />
      {isLoading && (
        <div className="text-sm text-gray-600">
          正在處理登入...
        </div>
      )}
      {!isGoogleLoaded && !error && (
        <div className="text-sm text-gray-600">
          載入 Google 登入服務...
        </div>
      )}
    </div>
  )
}
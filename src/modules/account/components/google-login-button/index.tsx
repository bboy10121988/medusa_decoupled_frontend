"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { sdk } from "@lib/config"

interface GoogleLoginButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

const GoogleLoginButton = ({ onSuccess, onError }: GoogleLoginButtonProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 檢測是否為 LINE 內建瀏覽器或其他 WebView
  const isInWebView = () => {
    if (typeof window === 'undefined') return false
    const userAgent = window.navigator.userAgent.toLowerCase()
    return userAgent.includes('line/') || 
           userAgent.includes('wv') || 
           userAgent.includes('webview') ||
           (userAgent.includes('mobile') && !userAgent.includes('safari'))
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await sdk.auth.login("customer", "google", {
        scope: "openid email profile",
        access_type: "online", 
        prompt: "select_account",
        include_granted_scopes: true
      })

      if (typeof result !== "string" && result.location) {
        // 🔧 修正：手動添加 prompt=select_account 參數到 Google OAuth URL
        let authUrl = result.location
        if (authUrl.includes('accounts.google.com/o/oauth2/v2/auth')) {
          // 檢查是否已經有 prompt 參數
          if (!authUrl.includes('prompt=')) {
            const separator = authUrl.includes('?') ? '&' : '?'
            authUrl += `${separator}prompt=select_account`
            console.log("✅ 已添加 prompt=select_account 參數到 Google OAuth URL")
          }
        }
        
        window.location.href = authUrl
        return
      }

      if (typeof result === "string") {
        // 登入流程已完成（不需跳轉）
        if (onSuccess) {
          onSuccess()
          return
        }

        router.push("/tw/account")
        return
      }

      throw new Error("Google 登入回傳資料異常")
    } catch (err: any) {
      let message = err?.message || "Google 登入失敗，請稍後再試"
      
      // 針對 WebView 環境提供特殊錯誤訊息
      if (isInWebView() && (message.includes('OAuth') || message.includes('授權') || message.includes('blocked'))) {
        message = "LINE 內建瀏覽器不支援 Google 登入，請點擊右上角「在瀏覽器中開啟」後重試"
      }
      
      setError(message)
      if (onError) onError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* WebView 警告提示 */}
      {isInWebView() && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-amber-700">
              💡 偵測到您正在使用 LINE 或其他 App 內建瀏覽器，Google 登入可能會被封鎖。
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open(window.location.href, '_blank')
                }
              }}
              className="inline-flex items-center gap-1 text-sm text-amber-800 hover:text-amber-900 underline font-medium"
            >
              🔗 在瀏覽器中開啟此頁面
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-medium">正在前往 Google 登入...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.22C12.54 13.42 17.77 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.8-.16-3.53-.46-5.2H24v9.86h12.7c-.55 2.96-2.26 5.47-4.81 7.16l7.39 5.73C43.98 37.19 46.5 31.26 46.5 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.54 28.44c-.48-1.43-.76-2.95-.76-4.44s.28-3.01.76-4.44L2.56 13.22C.91 16.44 0 20.08 0 24s.91 7.56 2.56 10.78l7.98-6.34z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.94-2.13 15.92-5.81l-7.39-5.73c-2.06 1.38-4.7 2.18-8.53 2.18-6.23 0-11.46-3.92-13.46-9.45l-7.98 6.34C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span className="text-sm font-medium">使用 Google 登入</span>
          </>
        )}
      </button>
    </div>
  )
}

export default GoogleLoginButton

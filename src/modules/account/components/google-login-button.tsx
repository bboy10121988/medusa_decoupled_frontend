"use client" // include with Next.js 13+

import { useState } from "react"
import { useParams } from "next/navigation"
import { sdk } from "@/lib/config"

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const params = useParams()

  // 從 URL 獲取當前的 countryCode，如果沒有則預設為 'tw'
  const countryCode = (params.countryCode as string) || 'tw'

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      // 將回調 URL 動態傳遞給後端
      const result = await sdk.auth.login("customer", "google", {
        redirect_uri: `${window.location.origin}/${countryCode}/auth/google/callback`,
        // 建議明確傳遞 state，增強安全性
        state: btoa(JSON.stringify({ countryCode })),
      })
      
      if (typeof result === "object" && result.location) {
        // 直接使用後端回傳的、已經包含所有正確參數的 URL 進行跳轉
        window.location.href = result.location
        return // 確保在跳轉後立即中止函式執行
      }
      
      // 如果後端沒有回傳 location，代表流程有問題
      // (例如，後端 Google 策略未正確設定)
      // 在正常情況下，這段不會被觸發
      alert("無法啟動 Google 登入，請聯繫管理員。")
      setIsLoading(false)
    } catch (error) {
      console.error("Google 登入錯誤:", error)
      alert("登入時發生錯誤，請稍後重試")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button 
        onClick={loginWithGoogle}
        disabled={isLoading}
        className={`flex items-center justify-center w-full px-5 py-2.5 border border-gray-300 rounded-md transition-colors ${
          isLoading ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            處理中...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            使用 Google 登入
          </>
        )}
      </button>
    </div>
  )
}
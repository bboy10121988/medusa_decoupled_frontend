"use client" // include with Next.js 13+

import { useState } from "react"
import { sdk } from "@/lib/config"

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  
  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      console.log('🔑 開始 Google 登入流程 - 檢查 OAuth URL')
      
      // 🔧 禁用自動選擇
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id?.disableAutoSelect) {
        (window as any).google.accounts.id.disableAutoSelect()
        console.log('✅ 已禁用 Google 自動選擇')
      }
      
      // 🔧 發起 Google OAuth 請求並檢查生成的 URL
      console.log('📡 發起 Google OAuth 請求，檢查 URL 是否包含正確的參數...')
      const result = await sdk.auth.login("customer", "google", {
        prompt: "consent select_account",
        approval_prompt: "force",
        access_type: "offline"
      })
      
      // 🔍 檢查返回的結果和 URL
      console.log('🔍 Google OAuth 結果:', {
        resultType: typeof result,
        hasLocation: typeof result === "object" && result?.location,
        locationUrl: typeof result === "object" ? result?.location : null
      })
      
      // 如果有 location URL，檢查是否包含必要的參數
      if (typeof result === "object" && result?.location) {
        const url = new URL(result.location)
        console.log('🔍 Google OAuth URL 參數檢查:', {
          prompt: url.searchParams.get('prompt'),
          access_type: url.searchParams.get('access_type'),
          approval_prompt: url.searchParams.get('approval_prompt'),
          allParams: Object.fromEntries(url.searchParams.entries())
        })
        
        // 如果 URL 沒有包含 prompt=select_account，手動添加
        if (!url.searchParams.get('prompt')?.includes('select_account')) {
          console.log('⚠️ URL 缺少 select_account 參數，手動添加...')
          url.searchParams.set('prompt', 'consent select_account')
          console.log('✅ 已添加強制帳號選擇參數')
          window.location.href = url.toString()
          return
        }
      }

      if (typeof result === "object" && result.location) {
        // redirect to Google for authentication
        window.location.href = result.location
        return
      }
      
      if (typeof result !== "string") {
        // result failed, show an error
        alert("認證失敗，請稍後重試")
        setIsLoading(false)
        return
      }

    // Customer was previously authenticated, and its token is now stored in the JS SDK.
    // all subsequent requests are authenticated
    const { customer } = await sdk.store.customer.retrieve()
    console.log(customer)
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
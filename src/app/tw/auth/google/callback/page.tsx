"use client"

import { useEffect, useState, Suspense } from "react"
import { handleGoogleCallback } from "@lib/data/google-auth"
import { useRouter, useSearchParams } from "next/navigation"

function GoogleCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("🚀 開始處理 Google 回調...")
        
        // 從 URL 參數中獲取授權碼
        const code = searchParams.get("code")
        const state = searchParams.get("state")

        if (!code) {
          throw new Error("未收到授權碼")
        }

        console.log("📝 收到的參數:", { 
          code: code.substring(0, 20) + "...", 
          state,
          fullUrl: window.location.href 
        })

        // 構建查詢物件
        const queryObject = {
          code,
          state,
          ...(searchParams.get("scope") && { scope: searchParams.get("scope") }),
          ...(searchParams.get("authuser") && { authuser: searchParams.get("authuser") }),
          ...(searchParams.get("prompt") && { prompt: searchParams.get("prompt") })
        }

        console.log("🔄 呼叫後端處理...")
        
        // 處理回調
        const result = await handleGoogleCallback(queryObject)
        
        console.log("✅ 後端處理完成:", result)
        
        if (result.success) {
          setStatus("success")

          // 從當前 URL 中提取 countryCode
          const pathSegments = window.location.pathname.split('/')
          const countryCode = pathSegments[1] || 'tw'  // 預設為 tw
          
          // 立即嘗試重導向，使用動態的 countryCode
          const redirectUrl = result?.redirect || `/${countryCode}/account`
          console.log("🚀 準備重導向到:", redirectUrl)
          console.log("🔍 提取的 countryCode:", countryCode)
          console.log("🔍 當前 pathname:", window.location.pathname)
          console.log("🔍 當前 URL:", window.location.href)
          
          // 直接使用最可靠的重導向方式
          console.log("🔄 使用 window.location.href 進行重導向...")
          window.location.href = redirectUrl
          
          // 備用檢查：確保重導向執行
          setTimeout(() => {
            console.log("🔄 備用重導向檢查...")
            if (window.location.pathname.includes('/callback')) {
              console.log("⚠️ 仍在 callback 頁面，使用 replace 強制重導向...")
              window.location.replace(redirectUrl)
            }
          }, 500)

        } else {
          throw new Error(result.error || "登入失敗")
        }
      } catch (err: any) {
        console.error("❌ Google 回調處理異常:", err)
        setError(err.message || "處理 Google 登入時發生錯誤")
        setStatus("error")
      }
    }

    processCallback()
  }, [searchParams])

  // 錯誤發生時，等待幾秒後重定向到登入頁
  useEffect(() => {
    if (status === "error") {
      const timer = setTimeout(() => {
        router.push("/tw/account/login")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {status === "loading" && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium mb-2">處理 Google 登入中...</h2>
          <p className="text-gray-600">請稍候，我們正在驗證您的身份</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center">
          <div className="w-16 h-16 text-green-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-2">登入成功！</h2>
          <p className="text-gray-600">正在將您重定向到帳戶頁面...</p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center max-w-md">
          <div className="w-16 h-16 text-red-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-2">登入失敗</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">將在 5 秒後返回登入頁面，或者您可以<button 
            onClick={() => router.push("/tw/account/login")}
            className="text-blue-600 hover:underline"
          >立即返回</button></p>
        </div>
      )}
    </div>
  )
}

export default function GoogleCallbackPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    }>
      <GoogleCallbackPage />
    </Suspense>
  )
}

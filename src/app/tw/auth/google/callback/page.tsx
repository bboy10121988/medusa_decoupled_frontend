"use client"

import { useEffect, useState, Suspense } from "react"
import { handleGoogleCallback } from "@lib/data/google-auth"
import { useRouter, useSearchParams } from "next/navigation"

function GoogleCallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    async function processCallback() {
      try {
        // 檢查是否有 OAuth 錯誤
        const oauthError = searchParams.get("error")
        if (oauthError) {
          const errorDescription = searchParams.get("error_description") || "Google 認證被拒絕"
          console.error("Google OAuth 錯誤:", oauthError, errorDescription)
          setError(`Google 登入失敗: ${errorDescription}`)
          setStatus("error")
          return
        }

        // 獲取授權碼
        const code = searchParams.get("code")
        if (!code) {
          console.error("Google callback 缺少授權碼")
          setError("Google 登入失敗: 未收到授權碼")
          setStatus("error")
          return
        }

        // 處理 Google 回調（根據流程圖步驟4）
        console.log("🔄 正在處理 Google OAuth 回調...")
        const queryObject = Object.fromEntries(searchParams.entries())
        const result = await handleGoogleCallback(queryObject)

        if (result && !result.success) {
          console.error("❌ Google OAuth 處理失敗:", result.error)
          setError(result.error || "處理授權回調時發生未知錯誤")
          setStatus("error")
          return
        }

        // handleGoogleCallback 成功時會自動重定向，以下代碼通常不會執行
        console.log("✅ Google OAuth 處理成功")
        setStatus("success")
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      {status === "loading" && (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-medium mb-2">處理 Google 登入中</h2>
          <p className="text-gray-600">請稍候，正在完成您的登入...</p>
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

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-medium mb-2">載入中...</h2>
        <p className="text-gray-600">正在處理您的請求...</p>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}

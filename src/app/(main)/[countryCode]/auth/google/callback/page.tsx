"use client" // include with Next.js 13+

import { useEffect, useMemo, useState } from "react"
import { sdk } from "@/lib/config"
import { useRouter, useParams } from "next/navigation"

export default function GoogleCallback() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  
  const countryCode = params.countryCode as string
  // 安全地獲取 URL 參數，避免伺服器端渲染問題
  const queryParams = useMemo(() => {
    if (typeof window === 'undefined') {
      return {}
    }
    const searchParams = new URLSearchParams(window.location.search)
    return Object.fromEntries(searchParams.entries())
  }, [])

  useEffect(() => {
    // 將 validateCallback 移入 useEffect 內部，避免不必要的重新渲染
    const validateCallback = async () => {
      try {
        console.log("開始驗證 Google 回調...")
        console.log("查詢參數:", queryParams)
        
        // 檢查授權碼
        if (!queryParams.code) {
          console.error("錯誤: 缺少 Google 授權碼 (code)")
          setError("缺少 Google 授權參數，無法完成登入。")
          return
        }
        
        console.log("正在發送 Google 授權碼到後端...")
        
        // 將 code 發送到後端，後端會處理所有與 Google 的通訊和使用者建立/登入邏輯
        // 成功後，後端會設定 httpOnly cookie，SDK 會自動感知到認證狀態
        await sdk.auth.callback("customer", "google", {
          ...queryParams,
          // 確保傳遞給後端的 redirect_uri 與 Google 驗證請求時一致
          // 動態使用當前的 countryCode
          redirect_uri: `${window.location.origin}/${countryCode}/auth/google/callback`,
        })
        
        console.log("✅ 後端已成功處理回調。")
        
        // 登入成功，重導向到帳戶頁面
        console.log("🚀 登入成功，正在重導向到帳戶頁面...")
        // 使用 window.location.href 進行完整頁面重載，確保所有 context 和狀態都刷新
        window.location.href = `/${countryCode}/account`
      } catch (error) {
        console.error("驗證回調過程中發生錯誤:", error)
        const errorMessage = error instanceof Error ? error.message : "發生未知錯誤"
        setError(`登入失敗: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    if (!loading) {
      return
    }

    // 確保我們在客戶端環境並且有查詢參數
    if (typeof window !== 'undefined' && Object.keys(queryParams).length > 0) {
      validateCallback()
    }
    // 移除 validateCallback 依賴，因為它現在在 useEffect 內部定義
  }, [loading, queryParams, router, countryCode])

  // 渲染不同的內容根據當前狀態
  const renderContent = () => {
    // 統一返回一致的消息，等待客戶端邏輯接管
    if (!error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <p className="text-gray-600 mb-4">正在驗證您的 Google 身份，請稍候...</p>
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
      )
    }
    
    // 顯示錯誤訊息
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <p className="text-red-500 mb-4 text-center font-medium">認證處理中遇到問題</p>
          <p className="text-gray-700 bg-red-50 p-3 rounded text-sm">{error}</p>
          <div className="mt-4 flex justify-center space-x-4">
            <button 
              onClick={() => router.push(`/${countryCode}/account`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              返回登入頁面
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return renderContent()
}
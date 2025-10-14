"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/config"

export default function GoogleAuthTest() {
  const [status, setStatus] = useState<{
    step: string
    loading: boolean
    error?: string
    result?: any
  }>({
    step: "初始化",
    loading: false
  })

  const testGoogleLogin = async () => {
    setStatus({ step: "開始 Google 登入測試", loading: true })
    
    try {
      console.log("🔑 測試 Google OAuth 流程")
      
      // 1. 測試 Google OAuth URL 生成
      const result = await sdk.auth.login("customer", "google", {
        prompt: "consent select_account",
        approval_prompt: "force",
        access_type: "offline"
      })
      
      console.log("🔍 Google OAuth 結果:", result)
      
      if (typeof result === "object" && result?.location) {
        setStatus({ 
          step: "Google OAuth URL 已生成", 
          loading: false,
          result: { redirectUrl: result.location }
        })
        
        // 自動重定向到 Google
        setTimeout(() => {
          window.location.href = result.location
        }, 2000)
        
      } else if (typeof result === "string") {
        // 已經認證的情況
        setStatus({ 
          step: "用戶已認證", 
          loading: false,
          result: { token: result }
        })
        
        // 獲取用戶資料
        try {
          const { customer } = await sdk.store.customer.retrieve()
          setStatus(prev => ({
            ...prev,
            result: { ...prev.result, customer }
          }))
        } catch (err) {
          console.error("獲取客戶資料失敗:", err)
        }
        
      } else {
        setStatus({ 
          step: "認證失敗", 
          loading: false,
          error: "未知的響應格式"
        })
      }
      
    } catch (error: any) {
      console.error("Google 登入錯誤:", error)
      setStatus({
        step: "Google 登入失敗",
        loading: false,
        error: error.message || "未知錯誤"
      })
    }
  }

  const checkCurrentAuth = async () => {
    setStatus({ step: "檢查當前認證狀態", loading: true })
    
    try {
      // 檢查 API 認證狀態
      const authResponse = await fetch('/api/auth/check', {
        credentials: 'include'
      })
      const authResult = await authResponse.json()
      
      setStatus({
        step: "認證狀態檢查完成",
        loading: false,
        result: authResult
      })
      
    } catch (error: any) {
      setStatus({
        step: "認證狀態檢查失敗",
        loading: false,
        error: error.message
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">🔐 Google 認證測試</h1>
        
        <div className="space-y-4">
          {/* 當前狀態 */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">當前狀態</h2>
            <div className="flex items-center space-x-2">
              {status.loading && (
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              )}
              <span className={`px-2 py-1 rounded text-sm ${
                status.error ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {status.step}
              </span>
            </div>
            
            {status.error && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 rounded">
                錯誤：{status.error}
              </div>
            )}
            
            {status.result && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(status.result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* 操作按鈕 */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">測試操作</h2>
            <div className="space-y-2">
              <button
                onClick={checkCurrentAuth}
                disabled={status.loading}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
              >
                🔍 檢查當前認證狀態
              </button>
              
              <button
                onClick={testGoogleLogin}
                disabled={status.loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                🔑 測試 Google 登入
              </button>
            </div>
          </div>

          {/* 說明 */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">測試說明</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 先檢查當前認證狀態</li>
              <li>• 點擊 Google 登入會生成 OAuth URL</li>
              <li>• 系統會自動重定向到 Google 認證頁面</li>
              <li>• 完成認證後會回到回調頁面處理 token</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
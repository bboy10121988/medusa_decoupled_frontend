"use client"

import { useState } from "react"
import GoogleGISLogin from "@modules/account/components/google-gis-login"

export default function GoogleGISTestPage() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = (response: any) => {
    console.log("登入成功:", response)
    setResult(response)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    console.error("登入失敗:", errorMessage)
    setError(errorMessage)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Google Identity Services 測試
          </h1>
          <p className="text-gray-600">
            測試新版 Google 登入整合
          </p>
        </div>

        <GoogleGISLogin
          onSuccess={handleSuccess}
          onError={handleError}
          countryCode="tw"
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-sm font-medium text-red-800 mb-2">錯誤訊息:</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-sm font-medium text-green-800 mb-2">登入成功:</h3>
            <pre className="text-xs text-green-600 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Google Identity Services (新版):</h3>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• ✅ 使用新版 Google Identity Services API</li>
            <li>• ✅ 直接接收 JWT token，無需複雜的 OAuth flow</li>
            <li>• ✅ 前端整合完成，可正常獲取用戶資料</li>
            <li>• ❌ 後端整合待完成：需要 JWT → Medusa Token 轉換</li>
            <li className="text-orange-600">⚠️ 核心問題：GIS 跳過 OAuth，無法獲得 Medusa 認證 token</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-sm font-medium text-green-800 mb-2">建議使用傳統 Google 登入:</h3>
          <ul className="text-sm text-green-600 space-y-1">
            <li>• 使用標準的 OAuth 2.0 flow</li>
            <li>• 已修復用戶創建問題</li>
            <li>• 包含手動客戶創建的 fallback 邏輯</li>
            <li>• 目前穩定可用</li>
          </ul>
          <div className="mt-3">
            <a 
              href="/tw/account"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              前往登入頁面使用傳統 Google 登入
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
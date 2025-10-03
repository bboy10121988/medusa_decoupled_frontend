"use client"

import { useState } from 'react'
import { sdk } from "@lib/config"

export default function JWTDebugPage() {
  const [jwtToken, setJwtToken] = useState<string>("")
  const [decodedPayload, setDecodedPayload] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // JWT 解析函數
  const parseJwt = (token: string) => {
    try {
      const [, payload] = token.split(".")
      if (!payload) return null
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
      const decoded = decodeURIComponent(
        atob(normalized)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      )
      return JSON.parse(decoded)
    } catch (error) {
      console.error("JWT 解析失敗:", error)
      return null
    }
  }

  // 測試 Google OAuth 並獲取 JWT
  const testGoogleOAuth = async () => {
    setLoading(true)
    try {
      // 檢查 URL 中是否有回調參數
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      
      if (code) {
        console.log("🔍 發現 OAuth 回調，開始處理...")
        
        // 處理 OAuth 回調
        const params = {
          code: code,
          state: state || undefined
        }
        
        const token = await sdk.auth.callback("customer", "google", params)
        
        if (typeof token === "string") {
          setJwtToken(token)
          const payload = parseJwt(token)
          setDecodedPayload(payload)
          
          // 同時顯示在控制台
          console.log("🎯 JWT Token:", token)
          console.log("🎯 解析後的 Payload:", payload)
        } else {
          console.error("❌ 收到非字串類型的 token:", token)
        }
      } else {
        // 發起 OAuth 流程
        const result = await sdk.auth.login("customer", "google", {
          scope: "openid email profile",
          access_type: "online",
          prompt: "select_account"
        })
        
        if (typeof result !== "string" && result.location) {
          window.location.href = result.location
        }
      }
    } catch (error: any) {
      console.error("❌ OAuth 測試失敗:", error)
      alert("OAuth 測試失敗: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 手動輸入 JWT 進行解析
  const parseManualJWT = () => {
    if (!jwtToken) {
      alert("請先輸入 JWT Token")
      return
    }
    
    const payload = parseJwt(jwtToken)
    setDecodedPayload(payload)
    console.log("🎯 手動解析的 Payload:", payload)
  }

  // 複製 JWT 到剪貼簿
  const copyJWT = () => {
    if (jwtToken) {
      navigator.clipboard.writeText(jwtToken)
      alert("JWT Token 已複製到剪貼簿！")
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">🔍 JWT Token 調試工具</h1>
      
      {/* 控制按鈕 */}
      <div className="flex gap-4 mb-8 justify-center">
        <button 
          onClick={testGoogleOAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "處理中..." : "🚀 測試 Google OAuth"}
        </button>
        
        <button 
          onClick={parseManualJWT}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          🔧 解析 JWT
        </button>
        
        {jwtToken && (
          <button 
            onClick={copyJWT}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600"
          >
            📋 複製 JWT
          </button>
        )}
      </div>

      {/* JWT Token 輸入/顯示區域 */}
      <div className="mb-8">
        <label className="block text-lg font-semibold mb-2">JWT Token:</label>
        <textarea
          value={jwtToken}
          onChange={(e) => setJwtToken(e.target.value)}
          placeholder="JWT Token 會在這裡顯示，或者你可以手動輸入進行測試..."
          className="w-full h-32 p-4 border rounded-lg font-mono text-sm"
        />
      </div>

      {/* 解析結果顯示 */}
      {decodedPayload && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🔍 JWT Payload 解析結果:</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto">
            <pre>{JSON.stringify(decodedPayload, null, 2)}</pre>
          </div>
          
          {/* 重要欄位快速查看 */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-800">📧 Email 相關:</h3>
              <p><strong>email:</strong> {decodedPayload.email || "❌ 無"}</p>
              <p><strong>email_verified:</strong> {decodedPayload.email_verified?.toString() || "❌ 無"}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-800">👤 用戶資訊:</h3>
              <p><strong>sub:</strong> {decodedPayload.sub || "❌ 無"}</p>
              <p><strong>name:</strong> {decodedPayload.name || "❌ 無"}</p>
              <p><strong>given_name:</strong> {decodedPayload.given_name || "❌ 無"}</p>
              <p><strong>family_name:</strong> {decodedPayload.family_name || "❌ 無"}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold text-yellow-800">🔑 Token 資訊:</h3>
              <p><strong>iss:</strong> {decodedPayload.iss || "❌ 無"}</p>
              <p><strong>aud:</strong> {decodedPayload.aud || "❌ 無"}</p>
              <p><strong>exp:</strong> {decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toLocaleString() : "❌ 無"}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded">
              <h3 className="font-semibold text-red-800">🏢 Medusa 特定:</h3>
              <p><strong>actor_id:</strong> {decodedPayload.actor_id || "❌ 無"}</p>
              <p><strong>actor_type:</strong> {decodedPayload.actor_type || "❌ 無"}</p>
              <p><strong>app_metadata:</strong> {JSON.stringify(decodedPayload.app_metadata) || "❌ 無"}</p>
            </div>
          </div>
        </div>
      )}

      {/* 使用說明 */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-3">📝 使用說明:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>點擊「🚀 測試 Google OAuth」開始 Google 登入流程</li>
          <li>完成 Google 授權後，會自動返回並顯示 JWT Token</li>
          <li>JWT Token 會自動解析並顯示重要欄位</li>
          <li>你也可以手動輸入 JWT Token 進行測試</li>
          <li>使用「📋 複製 JWT」按鈕將 token 複製到剪貼簿</li>
        </ol>
      </div>

      {/* 外部工具連結 */}
      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-3">🔗 外部測試工具:</h3>
        <div className="space-y-2">
          <a 
            href="https://jwt.io/" 
            target="_blank" 
            className="block text-blue-600 hover:underline"
          >
            🔗 JWT.io - 在線 JWT 解析工具
          </a>
          <a 
            href="https://developers.google.com/oauthplayground/" 
            target="_blank" 
            className="block text-blue-600 hover:underline"
          >
            🔗 Google OAuth 2.0 Playground
          </a>
        </div>
      </div>
    </div>
  )
}
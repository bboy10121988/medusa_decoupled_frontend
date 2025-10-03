"use client"

import { useState } from 'react'

export default function TestGoogleOAuth() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectGoogleAPI = async () => {
    setLoading(true)
    setResults(null)

    try {
      // 步驟1: 測試直接 Google OAuth 流程
      const CLIENT_ID = "273789094137-fhpmj9kft3u0jn2ig0icebo1jme40lvf.apps.googleusercontent.com"
      const REDIRECT_URI = "https://timsfantasyworld.com/tw/test-google-oauth"
      const SCOPE = "openid email profile"
      
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
      authUrl.searchParams.set("client_id", CLIENT_ID)
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
      authUrl.searchParams.set("response_type", "code")
      authUrl.searchParams.set("scope", SCOPE)
      authUrl.searchParams.set("state", "test-state-" + Date.now())
      
      setResults({
        step: "redirect",
        message: "即將重定向到 Google OAuth...",
        authUrl: authUrl.toString()
      })
      
      // 3秒後重定向
      setTimeout(() => {
        window.location.href = authUrl.toString()
      }, 3000)
      
    } catch (error: any) {
      setResults({
        step: "error",
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const testMedusaSDK = async () => {
    setLoading(true)
    setResults(null)

    try {
      // 測試 Medusa SDK Google 登入
      const { sdk } = await import("@lib/config")
      
      const result = await sdk.auth.login("customer", "google", {
        scope: "openid email profile",
        access_type: "online",
        prompt: "select_account"
      })

      setResults({
        step: "medusa_sdk",
        result: result,
        type: typeof result
      })

      if (typeof result !== "string" && result.location) {
        setTimeout(() => {
          window.location.href = result.location
        }, 3000)
      }

    } catch (error: any) {
      setResults({
        step: "error",
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const parseURLCallback = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    if (code) {
      setResults({
        step: "callback_received",
        code: code.substring(0, 20) + "...",
        state: state,
        error: error,
        fullParams: Object.fromEntries(urlParams.entries())
      })
    }
  }

  const testJWTDecoding = () => {
    const sampleJWT = prompt("請輸入 JWT token 進行測試:")
    if (!sampleJWT) return

    try {
      const [, payload] = sampleJWT.split(".")
      if (!payload) throw new Error("Invalid JWT format")
      
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
      const decoded = decodeURIComponent(
        atob(normalized)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      )
      
      const parsedPayload = JSON.parse(decoded)
      
      setResults({
        step: "jwt_decode",
        payload: parsedPayload,
        email: parsedPayload.email,
        email_verified: parsedPayload.email_verified,
        sub: parsedPayload.sub,
        iss: parsedPayload.iss,
        aud: parsedPayload.aud
      })
      
    } catch (error: any) {
      setResults({
        step: "error",
        error: "JWT 解析失敗: " + error.message
      })
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Google OAuth 測試工具</h1>
      
      <div className="grid gap-4 mb-8">
        <button 
          onClick={testDirectGoogleAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "處理中..." : "測試直接 Google OAuth API"}
        </button>
        
        <button 
          onClick={testMedusaSDK}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "處理中..." : "測試 Medusa SDK Google 登入"}
        </button>
        
        <button 
          onClick={parseURLCallback}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          解析當前 URL 的 OAuth 回調參數
        </button>
        
        <button 
          onClick={testJWTDecoding}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          測試 JWT Token 解析
        </button>
      </div>

      {results && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">測試結果</h2>
          <pre className="bg-black text-green-400 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-blue-50 p-4 rounded">
        <h3 className="font-semibold mb-2">外部測試工具推薦：</h3>
        <ul className="space-y-2">
          <li>
            <a 
              href="https://developers.google.com/oauthplayground/" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              🔗 Google OAuth 2.0 Playground - 官方 OAuth 測試工具
            </a>
          </li>
          <li>
            <a 
              href="https://jwt.io/" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              🔗 JWT.io - JWT Token 解析和驗證工具
            </a>
          </li>
          <li>
            <a 
              href="https://developers.google.com/apis-explorer/" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              🔗 Google API Explorer - Google API 直接測試
            </a>
          </li>
        </ul>
      </div>

      <div className="mt-4 bg-yellow-50 p-4 rounded">
        <h3 className="font-semibold mb-2">使用說明：</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>點擊「測試直接 Google OAuth API」測試原生 Google OAuth 流程</li>
          <li>點擊「測試 Medusa SDK Google 登入」測試通過 Medusa 的 Google 登入</li>
          <li>在 OAuth 回調後，點擊「解析當前 URL」查看回調參數</li>
          <li>使用「測試 JWT Token 解析」來解析任何 JWT token</li>
        </ol>
      </div>
    </div>
  )
}
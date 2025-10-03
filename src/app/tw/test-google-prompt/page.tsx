"use client"

import { useState } from 'react'
import { sdk } from "@lib/config"

export default function TestGooglePrompt() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testGoogleAuth = async () => {
    setLoading(true)
    setResult(null)

    try {
      const authResult = await sdk.auth.login("customer", "google", {
        scope: "openid email profile",
        access_type: "online", 
        prompt: "select_account",
        include_granted_scopes: true
      })

      setResult({
        type: typeof authResult,
        data: authResult,
        hasLocation: !!(authResult as any)?.location,
        location: (authResult as any)?.location
      })

      // 檢查URL是否包含prompt參數
      if (typeof authResult !== "string" && authResult.location) {
        const url = new URL(authResult.location)
        const promptParam = url.searchParams.get('prompt')
        
        setResult(prev => ({
          ...prev,
          promptParam,
          hasPromptParam: !!promptParam,
          allParams: Object.fromEntries(url.searchParams.entries())
        }))
      }

    } catch (error: any) {
      setResult({
        error: error.message,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testWithManualPrompt = async () => {
    setLoading(true)
    setResult(null)

    try {
      const authResult = await sdk.auth.login("customer", "google", {
        scope: "openid email profile",
        access_type: "online", 
        prompt: "select_account",
        include_granted_scopes: true
      })

      if (typeof authResult !== "string" && authResult.location) {
        // 手動添加 prompt 參數（模擬修正後的邏輯）
        let authUrl = authResult.location
        if (authUrl.includes('accounts.google.com/o/oauth2/v2/auth')) {
          if (!authUrl.includes('prompt=')) {
            const separator = authUrl.includes('?') ? '&' : '?'
            authUrl += `${separator}prompt=select_account`
          }
        }

        const url = new URL(authUrl)
        
        setResult({
          type: 'modified_url',
          originalUrl: authResult.location,
          modifiedUrl: authUrl,
          promptParam: url.searchParams.get('prompt'),
          hasPromptParam: !!url.searchParams.get('prompt'),
          allParams: Object.fromEntries(url.searchParams.entries())
        })
      }

    } catch (error: any) {
      setResult({
        error: error.message,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Google OAuth Prompt 參數測試</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testGoogleAuth}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '測試中...' : '測試原始 Medusa SDK'}
        </button>

        <button
          onClick={testWithManualPrompt}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? '測試中...' : '測試手動添加 Prompt'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-2">測試結果:</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          {result.location && (
            <div className="bg-blue-100 p-4 rounded">
              <h2 className="font-semibold mb-2">Google OAuth URL 分析:</h2>
              <p><strong>包含 prompt 參數:</strong> {result.hasPromptParam ? '✅ 是' : '❌ 否'}</p>
              <p><strong>prompt 值:</strong> {result.promptParam || '無'}</p>
              
              {result.modifiedUrl && (
                <div className="mt-4">
                  <p><strong>原始 URL:</strong></p>
                  <p className="text-xs break-all bg-white p-2 rounded">{result.originalUrl}</p>
                  <p><strong>修正後 URL:</strong></p>
                  <p className="text-xs break-all bg-white p-2 rounded">{result.modifiedUrl}</p>
                </div>
              )}
            </div>
          )}

          {result.allParams && (
            <div className="bg-green-100 p-4 rounded">
              <h2 className="font-semibold mb-2">所有 URL 參數:</h2>
              <ul className="text-sm">
                {Object.entries(result.allParams).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-yellow-100 p-4 rounded">
            <h2 className="font-semibold mb-2">預期結果:</h2>
            <ul className="text-sm space-y-1">
              <li>• 原始 Medusa SDK 應該<strong>不包含</strong> prompt=select_account</li>
              <li>• 手動添加 prompt 後應該<strong>包含</strong> prompt=select_account</li>
              <li>• 有了 prompt=select_account，Google 會顯示帳號選擇頁面</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
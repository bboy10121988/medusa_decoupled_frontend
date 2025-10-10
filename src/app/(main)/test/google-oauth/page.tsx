'use client'

import { useState } from 'react'

export default function GoogleOAuthTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [callbackData, setCallbackData] = useState<any>(null)

  // 測試 1: 檢查配置並獲取 Google OAuth URL
  const testGoogleOAuthSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/google-oauth', {
        method: 'GET'
      })
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      console.error('測試失敗:', error)
      setTestResults({ error: '測試失敗' })
    } finally {
      setLoading(false)
    }
  }

  // 測試 2: 手動輸入 callback code 進行測試
  const testCallback = async (code: string, state: string = '') => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/google-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'simulate_callback',
          code,
          state
        })
      })
      const data = await response.json()
      setCallbackData(data)
    } catch (error) {
      console.error('Callback 測試失敗:', error)
      setCallbackData({ error: 'Callback 測試失敗' })
    } finally {
      setLoading(false)
    }
  }

  const handleCallbackTest = () => {
    const code = (document.getElementById('callback-code') as HTMLInputElement)?.value
    const state = (document.getElementById('callback-state') as HTMLInputElement)?.value
    if (code) {
      testCallback(code, state)
    } else {
      alert('請輸入 authorization code')
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Google OAuth 測試工具</h1>
      
      {/* 測試 1: 配置檢查 */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">步驟 1: 檢查 Google OAuth 配置</h2>
        <button
          onClick={testGoogleOAuthSetup}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '測試中...' : '開始測試配置'}
        </button>
        
        {testResults && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">測試結果:</h3>
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(testResults, null, 2)}
            </pre>
            
            {testResults.results?.google_auth_url?.success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-semibold">✅ Google OAuth URL 生成成功!</p>
                <p className="text-sm mt-2">請複製以下 URL 到新分頁進行 Google 登入:</p>
                <a 
                  href={testResults.results.google_auth_url.fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm break-all"
                >
                  {testResults.results.google_auth_url.fullUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 測試 2: Callback 處理 */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">步驟 2: 測試 OAuth Callback</h2>
        <p className="text-gray-600 mb-4">
          完成 Google 登入後，你會被重定向到 callback URL。請從 URL 中複製 <code>code</code> 參數到下面:
        </p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="callback-code" className="block text-sm font-medium mb-1">
              Authorization Code (必填):
            </label>
            <input
              id="callback-code"
              type="text"
              placeholder="從 callback URL 的 code 參數複製過來"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="callback-state" className="block text-sm font-medium mb-1">
              State (選填):
            </label>
            <input
              id="callback-state"
              type="text"
              placeholder="從 callback URL 的 state 參數複製過來"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <button
            onClick={handleCallbackTest}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '處理中...' : '測試 Callback'}
          </button>
        </div>
        
        {callbackData && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Callback 測試結果:</h3>
            <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(callbackData, null, 2)}
            </pre>
            
            {callbackData.email_found && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-semibold">🎉 成功取得用戶 Email!</p>
                <p className="text-lg mt-1">📧 Email: <strong>{callbackData.extracted_email}</strong></p>
              </div>
            )}
            
            {!callbackData.email_found && callbackData.results && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-semibold">❌ 無法取得用戶 Email</p>
                <p className="text-sm mt-1">請檢查 JWT payload 和後端配置</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 說明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">使用說明:</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>首先點擊「開始測試配置」檢查系統配置</li>
          <li>如果配置正確，會顯示 Google OAuth URL</li>
          <li>點擊該 URL 進行 Google 登入</li>
          <li>登入完成後，從 callback URL 複製 <code>code</code> 參數</li>
          <li>將 code 貼入上方輸入框，點擊「測試 Callback」</li>
          <li>查看是否成功取得用戶 email</li>
        </ol>
      </div>
    </div>
  )
}
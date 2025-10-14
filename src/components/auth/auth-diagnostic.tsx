"use client"

import { useState } from 'react'

interface AuthDiagnosticInfo {
  cookies: Record<string, string>
  localStorage: Record<string, string>
  sessionStorage: Record<string, string>
  authCheck: any
  headers: Record<string, string>
}

export function AuthDiagnostic() {
  const [diagnosticInfo, setDiagnosticInfo] = useState<AuthDiagnosticInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostic = async () => {
    setIsLoading(true)
    try {
      // 1. 檢查 Cookies
      const cookies: Record<string, string> = {}
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          const [key, value] = cookie.trim().split('=')
          if (key && value) {
            cookies[key] = decodeURIComponent(value)
          }
        })
      }

      // 2. 檢查 localStorage
      const localStorage: Record<string, string> = {}
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i)
          if (key) {
            localStorage[key] = window.localStorage.getItem(key) || ''
          }
        }
      }

      // 3. 檢查 sessionStorage
      const sessionStorage: Record<string, string> = {}
      if (typeof window !== 'undefined' && window.sessionStorage) {
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i)
          if (key) {
            sessionStorage[key] = window.sessionStorage.getItem(key) || ''
          }
        }
      }

      // 4. 檢查認證狀態
      const authResponse = await fetch('/api/auth/check', {
        credentials: 'include',
        cache: 'no-cache'
      })
      const authCheck = await authResponse.json()

      // 5. 檢查請求標頭
      const headers: Record<string, string> = {}
      if (typeof document !== 'undefined') {
        // 模擬獲取當前請求的標頭
        headers['User-Agent'] = navigator.userAgent
        headers['Referrer'] = document.referrer
        headers['Origin'] = window.location.origin
      }

      setDiagnosticInfo({
        cookies,
        localStorage,
        sessionStorage,
        authCheck,
        headers
      })

    } catch (error) {
      console.error('診斷失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllData = () => {
    if (typeof window !== 'undefined') {
      // 清理 localStorage
      window.localStorage.clear()
      
      // 清理 sessionStorage
      window.sessionStorage.clear()
      
      // 清理 cookies（只能清理可訪問的）
      document.cookie.split(';').forEach(cookie => {
        const [key] = cookie.trim().split('=')
        if (key) {
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost`
        }
      })
    }
    
    // 重新運行診斷
    runDiagnostic()
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">🔍 認證診斷工具</h1>
        
        <div className="mb-6 flex gap-4">
          <button 
            onClick={runDiagnostic}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? '診斷中...' : '運行診斷'}
          </button>
          
          <button 
            onClick={clearAllData}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            清理所有數據
          </button>
        </div>

        {diagnosticInfo && (
          <div className="space-y-6">
            {/* 認證狀態 */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                📊 認證狀態 
                <span className={`ml-2 px-2 py-1 text-sm rounded ${
                  diagnosticInfo.authCheck.authenticated 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {diagnosticInfo.authCheck.authenticated ? '✅ 已認證' : '❌ 未認證'}
                </span>
              </h2>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(diagnosticInfo.authCheck, null, 2)}
              </pre>
            </div>

            {/* Cookies */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">🍪 Cookies</h2>
              {Object.keys(diagnosticInfo.cookies).length > 0 ? (
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(diagnosticInfo.cookies, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">沒有找到 cookies</p>
              )}
              
              {!diagnosticInfo.cookies._medusa_jwt && (
                <div className="mt-3 p-3 bg-yellow-100 border border-yellow-400 rounded">
                  <p className="text-yellow-800">
                    ⚠️ <strong>缺少 _medusa_jwt cookie</strong> - 這是認證失敗的主要原因
                  </p>
                </div>
              )}
            </div>

            {/* LocalStorage */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">💾 LocalStorage</h2>
              {Object.keys(diagnosticInfo.localStorage).length > 0 ? (
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(diagnosticInfo.localStorage, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">LocalStorage 是空的</p>
              )}
            </div>

            {/* SessionStorage */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">🗂️ SessionStorage</h2>
              {Object.keys(diagnosticInfo.sessionStorage).length > 0 ? (
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(diagnosticInfo.sessionStorage, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">SessionStorage 是空的</p>
              )}
            </div>

            {/* 建議 */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">💡 修復建議</h2>
              <div className="space-y-3">
                {!diagnosticInfo.authCheck.authenticated && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800">
                      <strong>需要重新登入：</strong> 請前往登入頁面重新進行 Google 登入
                    </p>
                  </div>
                )}
                
                {!diagnosticInfo.cookies._medusa_jwt && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-orange-800">
                      <strong>缺少 JWT Token：</strong> 認證 cookie 遺失，需要重新登入以獲取新的 token
                    </p>
                  </div>
                )}

                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800">
                    <strong>建議步驟：</strong>
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>點擊上方 "清理所有數據" 按鈕</li>
                    <li>前往 <a href="/tw/account" className="text-blue-600 underline">/tw/account</a> 登入頁面</li>
                    <li>使用 Google 登入重新認證</li>
                    <li>回到這裡重新運行診斷確認修復</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthDiagnostic
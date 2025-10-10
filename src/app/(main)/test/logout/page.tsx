'use client'

import { useState } from 'react'
import { useLogout } from '@lib/hooks/use-logout'

export default function LogoutTestPage() {
  const [strategy, setStrategy] = useState<'client-fetch' | 'server-redirect'>('server-redirect')
  const { logout, isLoggingOut } = useLogout({
    countryCode: 'tw',
    strategy
  })

  const handleLogout = async () => {
    try {
      console.log('🔓 開始測試登出', { strategy })
      await logout()
    } catch (error) {
      console.error('❌ 登出測試失敗:', error)
    }
  }

  const testDirectLogout = async () => {
    try {
      console.log('📡 直接調用登出 API')
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      console.log('✅ 直接登出結果:', result)
      alert(`直接登出結果: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      console.error('❌ 直接登出失敗:', error)
      alert(`直接登出失敗: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-center">帳戶登出測試</h1>
      
      {/* 策略選擇 */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">選擇登出策略</h2>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="strategy"
              value="server-redirect"
              checked={strategy === 'server-redirect'}
              onChange={(e) => setStrategy(e.target.value as 'server-redirect')}
              className="mr-2"
            />
            Server Redirect (推薦) - 伺服器處理重定向
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="strategy"
              value="client-fetch"
              checked={strategy === 'client-fetch'}
              onChange={(e) => setStrategy(e.target.value as 'client-fetch')}
              className="mr-2"
            />
            Client Fetch - 客戶端 fetch 後重定向
          </label>
        </div>
      </div>

      {/* 登出測試 */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">useLogout Hook 測試</h2>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? '登出中...' : '測試登出'}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          策略: {strategy}
        </p>
        {isLoggingOut && (
          <p className="text-blue-600 mt-2">🔄 正在執行登出流程...</p>
        )}
      </div>

      {/* 直接 API 測試 */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">直接 API 測試</h2>
        <button
          onClick={testDirectLogout}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
        >
          直接調用登出 API
        </button>
        <p className="text-sm text-gray-600 mt-2">
          直接測試 /api/auth/logout POST 端點
        </p>
      </div>

      {/* SDK 測試說明 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3 text-yellow-800">SDK 登出功能說明</h2>
        <ul className="list-disc list-inside space-y-2 text-yellow-700">
          <li>使用簡單的 Medusa SDK <code>sdk.auth.logout()</code></li>
          <li>自動清除認證令牌和購物車 ID</li>
          <li>重新驗證相關緩存</li>
          <li>支援服務器重定向和客戶端重定向兩種策略</li>
          <li>清除本地儲存和會話儲存</li>
        </ul>
      </div>

      {/* 開發者資訊 */}
      <div className="bg-gray-50 border rounded-lg p-4 mt-6">
        <h3 className="font-semibold mb-2">開發者資訊</h3>
        <p className="text-sm text-gray-600">
          開啟瀏覽器開發工具查看登出流程的詳細 console 日誌
        </p>
      </div>
    </div>
  )
}
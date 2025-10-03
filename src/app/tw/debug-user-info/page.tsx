"use client"

import React, { useEffect, useState } from 'react'
import { sdk } from "@lib/config"

export default function DebugUserInfo() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [localStorageInfo, setLocalStorageInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        // 獲取當前認證用戶
        const customerResponse = await sdk.store.customer.retrieve()
        console.log("🔍 用戶資訊:", customerResponse)
        setUserInfo(customerResponse)

        // 獲取 localStorage 資訊
        const localData = {
          google_real_email: localStorage.getItem('google_real_email'),
          customer_display_email: localStorage.getItem('customer_display_email'),
          all_keys: Object.keys(localStorage).filter(key => 
            key.includes('email') || key.includes('google') || key.includes('customer')
          )
        }
        setLocalStorageInfo(localData)

      } catch (error) {
        console.error("獲取用戶資訊失敗:", error)
        setUserInfo({ error: error instanceof Error ? error.message : String(error) })
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const handleTestEmailUpdate = async () => {
    if (!userInfo?.customer?.id) return

    try {
      const response = await fetch('/api/auth/update-google-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userInfo.customer.id })
      })

      const result = await response.json()
      console.log("📧 Email 更新測試結果:", result)
      alert(JSON.stringify(result, null, 2))
    } catch (error) {
      console.error("測試失敗:", error)
      alert("測試失敗: " + (error instanceof Error ? error.message : String(error)))
    }
  }

  if (loading) return <div className="p-8">載入中...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">用戶資訊調試頁面</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">當前用戶資訊</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">localStorage 資訊</h2>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(localStorageInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">測試功能</h2>
          <button 
            onClick={handleTestEmailUpdate}
            disabled={!userInfo?.customer?.id}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            測試 Email 更新 API
          </button>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">使用說明</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>檢查用戶的 Customer ID 是否在映射表中</li>
            <li>檢查 localStorage 是否正確設置了真實 email</li>
            <li>測試 Email 更新 API 是否正常工作</li>
            <li>如果用戶是新用戶，需要更新映射表</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
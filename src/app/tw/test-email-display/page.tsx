"use client"

import { useState, useEffect } from 'react'
import { getRealGoogleEmail, getDisplayEmail } from '@lib/utils/google-email-utils'

export default function TestEmailDisplay() {
  const [customer, setCustomer] = useState<any>(null)
  const [realEmail, setRealEmail] = useState<string | null>(null)
  const [displayEmail, setDisplayEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch('/api/auth/customer', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          const data = await response.json()
          setCustomer(data.customer)
          
          if (data.customer) {
            const real = getRealGoogleEmail()
            const display = getDisplayEmail(data.customer.email)
            setRealEmail(real)
            setDisplayEmail(display)
          }
        }
      } catch (error) {
        console.error('獲取客戶資料失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerData()
  }, [])

  if (loading) {
    return <div className="p-8">載入中...</div>
  }

  if (!customer) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Email 顯示測試</h1>
        <div className="bg-yellow-100 border border-yellow-400 p-4 rounded">
          <p>請先登入以測試 email 顯示功能</p>
          <a href="/tw/account/login" className="text-blue-600 underline">前往登入</a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Email 顯示測試</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">客戶資料庫 Email:</h2>
          <p className="font-mono text-sm">{customer.email}</p>
          <p className="text-xs text-gray-600 mt-1">
            {customer.email?.startsWith('debug-') ? '⚠️ 這是 debug email' : '✅ 這是正式 email'}
          </p>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-semibold mb-2">localStorage 中儲存的真實 Email:</h2>
          <p className="font-mono text-sm">{realEmail || '未找到'}</p>
          <p className="text-xs text-gray-600 mt-1">
            從 localStorage 中的 google_real_email 或 customer_display_email 鍵值
          </p>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold mb-2">getDisplayEmail() 函數結果:</h2>
          <p className="font-mono text-sm">{displayEmail}</p>
          <p className="text-xs text-gray-600 mt-1">
            這是前端組件應該顯示的 email
          </p>
        </div>

        <div className="bg-purple-100 p-4 rounded">
          <h2 className="font-semibold mb-2">客戶基本資訊:</h2>
          <p><strong>ID:</strong> {customer.id}</p>
          <p><strong>姓名:</strong> {customer.first_name} {customer.last_name}</p>
          <p><strong>建立時間:</strong> {new Date(customer.created_at).toLocaleString()}</p>
        </div>

        <div className="bg-orange-100 p-4 rounded">
          <h2 className="font-semibold mb-2">localStorage 內容:</h2>
          <pre className="text-xs">
            {JSON.stringify({
              google_real_email: typeof window !== 'undefined' ? localStorage.getItem('google_real_email') : 'N/A',
              customer_display_email: typeof window !== 'undefined' ? localStorage.getItem('customer_display_email') : 'N/A'
            }, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h2 className="font-semibold mb-2">測試結果分析:</h2>
        <ul className="text-sm space-y-1">
          <li>• 如果客戶資料庫顯示 debug email，但 localStorage 有真實 email，表示映射正常</li>
          <li>• getDisplayEmail() 應該優先返回真實 email</li>
          <li>• 前端組件將使用 getDisplayEmail() 的結果來顯示</li>
        </ul>
      </div>
    </div>
  )
}
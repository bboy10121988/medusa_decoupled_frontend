"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Overview from "@modules/account/components/overview"
import { useAccount } from "@lib/context/account-context"
import { HttpTypes } from "@medusajs/types"

export const dynamic = 'force-dynamic'

export default function AccountPage() {
  const { customer } = useAccount()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[] | null>(null)
  const [loading, setLoading] = useState(true)

  // 檢查是否有強制登出參數
  useEffect(() => {
    if (searchParams.get('force_logout') === '1') {
      // console.log('🔄 檢測到強制登出參數，清除所有狀態')
      
      if (typeof window !== 'undefined') {
        // 完全清除所有狀態
        try {
          localStorage.clear()
          sessionStorage.clear()
          
          // 清除所有 cookies
          document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=')
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          })
          
          // console.log('✅ 強制清除完成')
          
          // 移除 URL 參數並重新加載
          const url = new URL(window.location.href)
          url.searchParams.delete('force_logout')
          window.history.replaceState({}, '', url.toString())
          
        } catch (e) {
          // console.log('強制清除失敗:', e)
        }
      }
    }
  }, [searchParams])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersResponse = await fetch('/api/customer/orders', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData.orders || [])
        }
      } catch (err) {
        // console.error('獲取訂單資料失敗:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading || !customer) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <Overview customer={customer} orders={orders || []} />
}

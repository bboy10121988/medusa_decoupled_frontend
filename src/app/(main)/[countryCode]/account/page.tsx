"use client"

import { useEffect, useState } from "react"
import Overview from "@modules/account/components/overview"
import { HttpTypes } from "@medusajs/types"

export const dynamic = 'force-dynamic'

export default function AccountPage() {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 獲取客戶和訂單資料
        const [customerResponse, ordersResponse] = await Promise.all([
          fetch('/api/auth/customer', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/customer/orders', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          })
        ])

        if (customerResponse.ok) {
          const customerData = await customerResponse.json()
          setCustomer(customerData.customer)
        }

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData.orders || [])
        }
      } catch (err) {
        console.error('獲取帳戶資料失敗:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <Overview customer={customer} orders={orders || []} />
}

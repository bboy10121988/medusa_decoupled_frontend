'use client'

import { useEffect, useState } from 'react'
import Overview from "@modules/account/components/overview"
import { HttpTypes } from "@medusajs/types"

export default function ClientOverview() {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 獲取客戶資料
        const customerResponse = await fetch('/api/auth/customer')
        if (customerResponse.ok) {
          const customerData = await customerResponse.json()
          setCustomer(customerData)
        }

        // 獲取訂單資料
        const ordersResponse = await fetch('/api/orders')
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData)
        }
      } catch (error) {
        console.error('獲取資料失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <Overview customer={customer} orders={orders} />
}
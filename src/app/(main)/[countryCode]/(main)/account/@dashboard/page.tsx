"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import Overview from "@modules/account/components/overview"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"

export const dynamic = 'force-dynamic'

export default function OverviewTemplate() {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 並行獲取客戶和訂單資料
        const [customerResponse, ordersResponse] = await Promise.all([
          sdk.store.customer.retrieve().catch(() => null),
          sdk.store.order.list({
            fields: "*items,*items.product,*items.variant"
          }).catch(() => null)
        ])

        if (customerResponse?.customer) {
          setCustomer(customerResponse.customer)
        }
        
        if (ordersResponse?.orders) {
          setOrders(ordersResponse.orders)
        }
      } catch (err) {
        console.error('獲取帳戶資料失敗:', err)
        setError('無法載入帳戶資料')
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

  if (error || !customer) {
    notFound()
  }

  return <Overview customer={customer} orders={orders || []} />
}

"use client"

import { useEffect, useState } from "react"
import Overview from "@modules/account/components/overview"
import { useAccount } from "@lib/context/account-context"
import { HttpTypes } from "@medusajs/types"

export const dynamic = 'force-dynamic'

export default function AccountPage() {
  const { customer } = useAccount()
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[] | null>(null)
  const [loading, setLoading] = useState(true)

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
        console.error('獲取訂單資料失敗:', err)
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

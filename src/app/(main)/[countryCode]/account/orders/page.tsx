"use client"

import { useEffect, useState } from "react"
import OrderOverview from "@modules/account/components/order-overview"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"
import { HttpTypes } from "@medusajs/types"

export default function Orders() {
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[] | null>(null)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, customerResponse] = await Promise.all([
          fetch('/api/customer/orders', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/auth/customer', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          })
        ])
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData.orders || [])
        }
        
        if (customerResponse.ok) {
          const customerData = await customerResponse.json()
          setCustomer(customerData.customer)
        }
      } catch (err) {
        console.error('獲取訂單資料失敗:', err)
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

  if (!customer) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-red-500">載入資料時發生錯誤</div>
      </div>
    )
  }

  return (
    <div className="flex-1" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">訂單</h1>
        <p className="text-base-regular">
          查看您之前的訂單和其狀態。您也可以建立退貨或交換請求（如果需要的話）。
        </p>
      </div>
      <div className="w-full">
        {orders && orders.length > 0 ? (
          <div className="flex flex-col gap-y-8">
            <OrderOverview orders={orders} />
            <Divider />
            <TransferRequestForm />
          </div>
        ) : (
          <div data-testid="no-orders-container">
            <p className="text-base-regular">您目前沒有任何訂單。</p>
          </div>
        )}
      </div>
    </div>
  )
}

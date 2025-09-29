"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import OrderOverview from "@modules/account/components/order-overview"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"
import AccountLayout from "@modules/account/templates/account-layout"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"

export default function Orders() {
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[] | null>(null)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, customerResponse] = await Promise.all([
          sdk.store.order.list({
            fields: "*items,*items.product,*items.variant"
          }).catch(() => null),
          sdk.store.customer.retrieve().catch(() => null)
        ])
        
        if (ordersResponse?.orders) {
          setOrders(ordersResponse.orders)
        }
        
        if (customerResponse?.customer) {
          setCustomer(customerResponse.customer)
        }
      } catch (err) {
        console.error('獲取資料失敗:', err)
        setError('無法載入資料')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <AccountLayout customer={customer}>
        <div className="w-full flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AccountLayout>
    )
  }

  if (error || !orders) {
    notFound()
  }

  return (
    <AccountLayout customer={customer}>
      <div className="w-full" data-testid="orders-page-wrapper">
        <div className="mb-8 flex flex-col gap-y-4">
          <h1 className="text-2xl-semi">Orders</h1>
          <p className="text-base-regular">
            View your previous orders and their status. You can also create
            returns or exchanges for your orders if needed.
          </p>
        </div>
        <div>
          <OrderOverview orders={orders} />
          <Divider className="my-16" />
          <TransferRequestForm />
        </div>
      </div>
    </AccountLayout>
  )
}
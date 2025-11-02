"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import CartTotals from "../../../common/components/cart-totals/index"
import Help from "../../../order/components/help/index"
import Items from "../../../order/components/items/index"
import OrderDetails from "../../../order/components/order-details/index"
import ShippingDetails from "../../../order/components/shipping-details/index"
import PaymentDetails from "../../../order/components/payment-details/index"

// 客戶端訂單獲取函數
const fetchOrder = async (orderId: string): Promise<HttpTypes.StoreOrder> => {
  // console.log("🔍 fetchOrder 開始獲取訂單:", orderId)
  
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      // console.error("❌ API 響應錯誤:", response.status, errorText)
      throw new Error(`Failed to fetch order: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    // console.log("✅ fetchOrder 成功獲取訂單:", data)
    
    return data.order || data
  } catch (error) {
    // console.error("❌ fetchOrder 錯誤:", error)
    throw error
  }
}

const OrderConfirmed = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams?.get("order_id")
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      // console.log("🎉 載入訂單確認頁面，訂單ID:", orderId)
      // console.log("🔍 開始呼叫 retrieveOrder...")
      fetchOrder(orderId)
        .then((orderData: HttpTypes.StoreOrder) => {
          // console.log("✅ 訂單資料載入成功:", orderData)
          if (orderData) {
            setOrder(orderData)
            // console.log("✅ 訂單狀態設置完成")
          } else {
            // console.error("❌ retrieveOrder 返回了空的資料")
          }
        })
        .catch((error: any) => {
          // console.error("❌ 載入訂單資料失敗:", error)
          // console.error("❌ 錯誤詳情:", error.message, error.stack)
        })
        .finally(() => {
          // console.log("🏁 retrieveOrder 完成，設置 loading = false")
          setLoading(false)
        })
    } else {
      // console.log("⚠️ 沒有訂單ID，無法載入訂單確認頁面")
      // console.log("🔍 當前 searchParams:", searchParams?.toString())
      setLoading(false)
    }
  }, [orderId, searchParams])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600 mb-2">無法載入訂單資訊</h2>
        <p className="text-gray-600">
          {orderId ? 
            `訂單ID: ${orderId} - 請檢查訂單是否存在，或稍後再試。` : 
            "沒有提供訂單ID，無法載入訂單資訊。"
          }
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>目前URL參數: {searchParams?.toString()}</p>
        </div>
      </div>
    )
  }

  // 直接複製 OrderCompletedTemplate 的內容，但移除服務器端功能
  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>謝謝您！</span>
            <span>您的訂單已成功提交。</span>
          </Heading>
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            摘要
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmed

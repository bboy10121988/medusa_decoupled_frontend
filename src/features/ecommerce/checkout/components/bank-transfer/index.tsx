"use client"

import React, { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, Button } from "@medusajs/ui"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { placeOrder } from "@lib/data/cart"
import ErrorMessage from "../error-message/index"

type BankTransferProps = {
  cart: HttpTypes.StoreCart
}

const BankTransfer: React.FC<BankTransferProps> = ({ cart }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  const createOrder = async () => {
    if (isCreatingOrder || orderId) return // 防止重複建立訂單
    
    setIsCreatingOrder(true)
    try {
      console.log("Creating order for bank transfer, cart:", cart.id)
      const order = await placeOrder(cart.id)
      
      if (order) {
        console.log("Order created successfully:", order)
        setOrderId(order.id)
        
        // 訂單創建成功後，跳轉到訂單確認步驟
        const params = new URLSearchParams(searchParams.toString())
        params.set('step', 'order-confirmed')
        params.set('order_id', order.id)
        
        const newUrl = `${pathname}?${params.toString()}`
        console.log("🚀 跳轉到訂單確認頁面:", newUrl)
        router.push(newUrl)
      } else {
        setError("訂單建立失敗，請重新嘗試")
      }
    } catch (err: any) {
      console.error("Order creation failed:", err)
      setError("訂單建立失敗：" + err.message)
    } finally {
      setIsCreatingOrder(false)
    }
  }

  useEffect(() => {
    // 檢查是否已有訂單ID
    const orderIdFromUrl = searchParams.get('order_id')
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl)
    } else {
      // 如果沒有訂單ID，自動建立訂單
      createOrder()
    }
  }, [searchParams])

  if (error) {
    return <ErrorMessage error={error} />
  }

  if (!orderId) {
    return (
      <div className="space-y-6">
        <Text>載入中...</Text>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Heading level="h2" className="text-xl font-semibold">
          訂單成立
        </Heading>
        <div className="flex items-center gap-2 mt-2">
          <Text className="text-gray-600">
            訂單編號：{orderId}
          </Text>
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
            未付款
          </span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <Heading level="h3" className="text-lg font-medium mb-4">
          銀行轉帳資訊
        </Heading>
        
        <div className="space-y-3">
          <div>
            <Text className="font-medium">銀行：</Text>
            <Text>玉山銀行 (808)</Text>
          </div>
          
          <div>
            <Text className="font-medium">戶名：</Text>
            <Text>TIM韓式料理餐飲有限公司</Text>
          </div>
          
          <div>
            <Text className="font-medium">帳號：</Text>
            <Text>1234-567-890123</Text>
          </div>
          
          <div>
            <Text className="font-medium">轉帳金額：</Text>
            <Text className="text-lg font-semibold">
              NT$ {cart.total ? (cart.total / 100).toLocaleString() : 0}
            </Text>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <Text className="text-yellow-800">
          <strong>注意事項：</strong>
          <br />
          • 請於3個工作天內完成轉帳
          <br />
          • 轉帳後請保留收據
          <br />
          • 我們將於收到款項後通知您
          <br />
          • 如有疑問請聯繫客服：02-1234-5678
        </Text>
      </div>

      <div className="space-y-3">
        <Text className="text-sm text-gray-600">
          感謝您的訂購！我們會在確認收到款項後儘快為您處理訂單。
        </Text>
      </div>
    </div>
  )
}

export default BankTransfer

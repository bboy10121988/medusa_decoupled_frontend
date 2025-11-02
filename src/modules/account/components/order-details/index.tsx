"use client"

import { useEffect, useState } from "react"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  orderId: string
  countryCode: string
}

const OrderDetails = ({ orderId, countryCode }: OrderDetailsProps) => {
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/customer/orders/${orderId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('訂單不存在')
          } else {
            setError('無法載入訂單詳情')
          }
          return
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (error) {
        // console.error('載入訂單詳情失敗:', error)
        setError('載入訂單詳情時發生錯誤')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>載入中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <LocalizedClientLink href={`/${countryCode}/account/orders`}>
          <Button variant="secondary">
            ← 返回訂單列表
          </Button>
        </LocalizedClientLink>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">訂單不存在</p>
        <LocalizedClientLink href={`/${countryCode}/account/orders`}>
          <Button variant="secondary">
            ← 返回訂單列表
          </Button>
        </LocalizedClientLink>
      </div>
    )
  }

  const orderStatus = order.status || 'pending'
  const paymentStatus = order.payment_status || 'pending'
  const fulfillmentStatus = order.fulfillment_status || 'not_fulfilled'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'fulfilled':
      case 'captured':
        return 'text-green-600 bg-green-50'
      case 'pending':
      case 'not_fulfilled':
        return 'text-yellow-600 bg-yellow-50'
      case 'canceled':
      case 'cancelled':
      case 'requires_action':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'pending': return '處理中'
      case 'canceled': return '已取消'
      case 'cancelled': return '已取消'
      case 'fulfilled': return '已出貨'
      case 'not_fulfilled': return '未出貨'
      case 'captured': return '已付款'
      case 'requires_action': return '需要處理'
      default: return status
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 返回按鈕 */}
      <div className="mb-6">
        <LocalizedClientLink href={`/${countryCode}/account/orders`}>
          <Button variant="secondary">
            ← 返回訂單列表
          </Button>
        </LocalizedClientLink>
      </div>

      {/* 訂單資訊 */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              訂單 #{order.display_id}
            </h2>
            <p className="text-gray-600 text-sm">
              下單時間: {new Date(order.created_at).toLocaleString('zh-TW')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">
              {convertToLocale({
                amount: order.total,
                currency_code: order.currency_code,
              })}
            </div>
          </div>
        </div>

        {/* 狀態標籤 */}
        <div className="flex gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderStatus)}`}>
            訂單狀態: {getStatusText(orderStatus)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(paymentStatus)}`}>
            付款狀態: {getStatusText(paymentStatus)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(fulfillmentStatus)}`}>
            出貨狀態: {getStatusText(fulfillmentStatus)}
          </span>
        </div>
      </div>

      {/* 訂單商品 */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">訂單商品</h3>
        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-16 h-16 flex-shrink-0">
                <Thumbnail thumbnail={item.thumbnail} images={[]} size="full" />
              </div>
              <div className="flex-grow">
                <h4 className="font-medium">{item.title}</h4>
                {item.variant?.title && (
                  <p className="text-sm text-gray-600">{item.variant.title}</p>
                )}
                <p className="text-sm text-gray-600">數量: {item.quantity}</p>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {convertToLocale({
                    amount: item.total || 0,
                    currency_code: order.currency_code,
                  })}
                </div>
                <div className="text-sm text-gray-600">
                  單價: {convertToLocale({
                    amount: Math.round((item.total || 0) / item.quantity),
                    currency_code: order.currency_code,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 收貨地址 */}
      {order.shipping_address && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">收貨地址</h3>
          <div className="text-sm space-y-1">
            <p className="font-medium">
              {order.shipping_address.first_name} {order.shipping_address.last_name}
            </p>
            {order.shipping_address.company && (
              <p>{order.shipping_address.company}</p>
            )}
            <p>{order.shipping_address.address_1}</p>
            {order.shipping_address.address_2 && (
              <p>{order.shipping_address.address_2}</p>
            )}
            <p>
              {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}
            </p>
            <p>{order.shipping_address.country_code?.toUpperCase()}</p>
            {order.shipping_address.phone && (
              <p>電話: {order.shipping_address.phone}</p>
            )}
          </div>
        </div>
      )}

      {/* 訂單摘要 */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">訂單摘要</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>小計</span>
            <span>
              {convertToLocale({
                amount: order.subtotal || 0,
                currency_code: order.currency_code,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>運費</span>
            <span>
              {convertToLocale({
                amount: order.shipping_total || 0,
                currency_code: order.currency_code,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>稅金</span>
            <span>
              {convertToLocale({
                amount: order.tax_total || 0,
                currency_code: order.currency_code,
              })}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>總計</span>
            <span>
              {convertToLocale({
                amount: order.total,
                currency_code: order.currency_code,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
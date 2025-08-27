"use client"

import { transferCart } from "@lib/data/customer"
import { ExclamationCircleSolid } from "@medusajs/icons"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useState, useEffect } from "react"

function CartMismatchBanner(props: {
  customer: StoreCustomer
  cart: StoreCart
}) {
  const { customer, cart } = props
  const [isPending, setIsPending] = useState(false)
  const [actionText, setActionText] = useState("重新同步購物車")
  const [shouldShow, setShouldShow] = useState(false)
  const [autoRetryCount, setAutoRetryCount] = useState(0)

  // 檢查是否需要顯示橫幅
  useEffect(() => {
    if (!customer || !!cart.customer_id || autoRetryCount >= 3) {
      setShouldShow(false)
      return
    }

    // 自動嘗試修復購物車關聯
    const autoFix = async () => {
      if (autoRetryCount < 2) {
        console.log(`自動修復購物車關聯 (嘗試 ${autoRetryCount + 1})`)
        try {
          await transferCart()
          // 如果成功，組件會重新渲染且不會顯示
        } catch (error) {
          console.error("自動修復失敗:", error)
          setAutoRetryCount(prev => prev + 1)
          
          // 第二次失敗後才顯示手動修復選項
          if (autoRetryCount >= 1) {
            setShouldShow(true)
          } else {
            // 等待 2 秒後再次嘗試
            setTimeout(autoFix, 2000)
          }
        }
      } else {
        setShouldShow(true)
      }
    }

    autoFix()
  }, [customer, cart.customer_id, autoRetryCount])

  if (!shouldShow) {
    return null
  }

  const handleSubmit = async () => {
    try {
      setIsPending(true)
      setActionText("同步中...")

      await transferCart()
      // 成功後隱藏橫幅
      setShouldShow(false)
    } catch {
      setActionText("重新同步購物車")
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center justify-center small:p-4 p-2 text-center bg-blue-50 small:gap-2 gap-1 text-sm mt-2 text-blue-800 border border-blue-200">
      <div className="flex flex-col small:flex-row small:gap-2 gap-1 items-center">
        <span className="flex items-center gap-1">
          <ExclamationCircleSolid className="inline" />
          購物車同步出現問題，正在嘗試修復...
        </span>

        <span>·</span>

        <Button
          variant="transparent"
          className="hover:bg-blue-100 active:bg-blue-100 focus:bg-blue-100 disabled:text-blue-400 text-blue-700 p-0 bg-transparent"
          size="base"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default CartMismatchBanner

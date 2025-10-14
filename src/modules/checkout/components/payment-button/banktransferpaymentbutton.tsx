"use client"

import { useState } from "react"
import { Button } from "@medusajs/ui"
import ErrorMessage from "../error-message"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"

type Props = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

const BankTransferPaymentButton = ({ cart, notReady, "data-testid": dataTestId }: Props) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    
    console.log("🏦 開始銀行轉帳訂單處理")
    
    try {
      const result = await placeOrder()
      console.log("✅ 銀行轉帳訂單建立成功:", result)
      // placeOrder 成功會自動跳轉到 order confirmed 頁面
    } catch (err: any) {
      console.error("❌ 銀行轉帳訂單建立失敗:", err)
      
      // 設置錯誤訊息
      let displayMessage = "訂單建立失敗，請稍後再試"
      
      if (err?.message) {
        displayMessage = err.message
      } else if (err?.response?.data?.message) {
        displayMessage = err.response.data.message
      }
      
      setErrorMessage(displayMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        {submitting ? "處理中..." : "確認訂單"}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="bank-transfer-payment-error-message"
      />
    </>
  )
}

export default BankTransferPaymentButton


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
    try {
      const result = await placeOrder()
      console.log("銀行轉帳訂單建立成功:", result)
      // placeOrder 成功會自動跳轉到 order confirmed 頁面
      // 不需要手動跳轉
    } catch (err: any) {
      console.error("銀行轉帳訂單建立失敗:", err)
      // 嘗試顯示更詳細的錯誤內容
      if (err?.response) {
        // 若有 response 物件（如 axios），顯示 response.data
        //setErrorMessage(JSON.stringify(err.response.data));
      } else if (err?.message) {
        //setErrorMessage(err.message);
      } else {
        setErrorMessage("建立訂單失敗");
      }
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


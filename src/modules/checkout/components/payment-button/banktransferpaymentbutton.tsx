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
  // 取得 Next.js router
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)
    try {
      await placeOrder()
      // 跳轉到 review（第四步驟）
      if (router) {
        router.push("?step=review")
      } else {
        window.location.search = "?step=review"
      }
    } catch (err: any) {
      // 嘗試顯示更詳細的錯誤內容
      if (err?.response) {
        // 若有 response 物件（如 axios），顯示 response.data
        setErrorMessage(JSON.stringify(err.response.data));
      } else if (err?.message) {
        setErrorMessage(err.message);
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
        {submitting ? "處理中..." : "繼續檢視訂單"}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="bank-transfer-payment-error-message"
      />
    </>
  )
}

export default BankTransferPaymentButton


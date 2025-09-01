"use client"

import { isManual, isStripe } from "@lib/constants"
// 與 payment/index.tsx 一致，檢查 providerId 是否為綠界
const isEcpay = (providerId: string | undefined) => {
  return providerId?.includes("ecpay_")
}
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  // 銀行轉帳（ecpay_bank_transfer）直接建立訂單並跳轉 review
  if (paymentSession?.provider_id === "ecpay_bank_transfer") {
    return <BankTransferPaymentButton notReady={notReady} cart={cart} data-testid={dataTestId} />
  }

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isEcpay(paymentSession?.provider_id):
      return (
        <ECPayPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>請選擇付款方式</Button>
  }
}

// 銀行轉帳付款按鈕元件
const BankTransferPaymentButton = ({ cart, notReady, "data-testid": dataTestId }: { cart: HttpTypes.StoreCart, notReady: boolean, "data-testid"?: string }) => {
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

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        送出訂單
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ECPayPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    if (!cart || !paymentSession) {
      setSubmitting(false)
      setErrorMessage("付款資訊不完整")
      return
    }

    try {
      // 建立ECPay付款
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        },
        credentials: "include",
        body: JSON.stringify({
          cart: {
            id: cart.id,
            items: cart.items,
            total: cart.total,
            subtotal: cart.subtotal,
            tax_total: cart.tax_total,
            shipping_total: cart.shipping_total,
            region: cart.region,
            email: cart.email,
            shipping_address: cart.shipping_address,
            billing_address: cart.billing_address,
            shipping_methods: cart.shipping_methods
          },
          customer: cart.customer_id ? { id: cart.customer_id } : null,
          shippingAddress: cart.shipping_address,
          shippingMethod: cart.shipping_methods?.[0],
          choosePayment: paymentSession.provider_id,
        }),
      })

      if (!response.ok) {
        throw new Error("建立付款失敗")
      }

      const data = await response.json()

      if (data.form_html) {
        // 創建臨時div來解析HTML表單
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = data.form_html
        const form = tempDiv.querySelector("form")
        
        if (form) {
          // 設置表單提交方式為POST
          form.method = "POST"
          
          // 創建隱藏iframe來處理表單提交
          const iframe = document.createElement("iframe")
          iframe.name = "ecpay_iframe"
          iframe.style.display = "none"
          document.body.appendChild(iframe)
          
          // 設置表單target為iframe
          form.target = "ecpay_iframe"
          
          // 添加表單到DOM並提交
          document.body.appendChild(form)
          form.submit()
          
          // 監聽iframe加載完成事件
          iframe.onload = () => {
            // 檢查iframe內容是否為綠界頁面
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
              if (iframeDoc && iframeDoc.location.href.includes('ecpay.com.tw')) {
                // 如果iframe加載了綠界頁面，則打開新窗口
                const paymentWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
                if (paymentWindow) {
                  paymentWindow.location.href = iframeDoc.location.href
                }
              }
            } catch (e) {
              console.log("無法訪問iframe內容:", e)
            }
            
            // 清理DOM
            setTimeout(() => {
              document.body.removeChild(form)
              document.body.removeChild(iframe)
            }, 1000)
            
            setSubmitting(false)
          }
          
          return
        }
      }

      // 如果沒有表單或其他付款方式，直接完成訂單
      await onPaymentCompleted()
      
    } catch (error: any) {
      console.error("ECPay payment error:", error)
      setErrorMessage(error.message || "付款處理失敗")
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
        {submitting ? "處理中..." : "確認付款"}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="ecpay-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        送出訂單
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton

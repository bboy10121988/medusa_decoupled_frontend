"use client"

import { HttpTypes } from "@medusajs/types"
import { Elements } from "@stripe/react-stripe-js"
import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { createContext } from "react"

type StripeWrapperProps = {
  paymentSession: HttpTypes.StorePaymentSession
  stripeKey?: string | undefined
  stripePromise: Promise<Stripe | null> | null
  children: React.ReactNode
}

export const StripeContext = createContext(false)

const StripeWrapper: React.FC<StripeWrapperProps> = ({
  paymentSession,
  stripeKey,
  stripePromise,
  children,
}) => {
  if (!stripeKey) {
    // console.warn("Stripe 已停用：未設定 NEXT_PUBLIC_STRIPE_KEY 環境變數")
    return <div>{children}</div>
  }

  if (!stripePromise) {
    // console.warn("Stripe 已停用：無法載入 Stripe")
    return <div>{children}</div>
  }

  if (!paymentSession?.data?.client_secret) {
    // console.warn("Stripe 客戶端密鑰遺失，無法初始化 Stripe")
    return <div>{children}</div>
  }

  const options: StripeElementsOptions = {
    clientSecret: paymentSession.data.client_secret as string,
  }

  return (
    <StripeContext.Provider value={true}>
      <Elements options={options} stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  )
}

export default StripeWrapper

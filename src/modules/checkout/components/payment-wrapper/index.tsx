"use client"

import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import StripeWrapper from "./stripe-wrapper"
import { HttpTypes } from "@medusajs/types"
import { isStripe } from "@lib/constants"
import EcpayCheckout from "@/components/checkout/ecpay-checkout"

type PaymentWrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  if (!paymentSession) {
    return <div>{children}</div>
  }

  // 如果是綠界支付
  if (paymentSession.provider_id === 'ecpay') {
    return (
      <div>
        {children}
        {cart.id && <EcpayCheckout orderId={cart.id} />}
      </div>
    )
  }

  // 如果是 Stripe 支付
  if (isStripe(paymentSession.provider_id) && stripePromise) {
    return (
      <StripeWrapper
        paymentSession={paymentSession}
        stripeKey={stripeKey}
        stripePromise={stripePromise}
      >
        {children}
      </StripeWrapper>
    )
  }

  return <div>{children}</div>
}

export default PaymentWrapper

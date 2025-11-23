"use client"

import { useState } from "react"
import { Button } from "@medusajs/ui"
import ErrorMessage from "../error-message"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import { useElements, useStripe } from "@stripe/react-stripe-js"

type Props = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: Props) => {
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
              ...(cart.billing_address?.city ? { city: cart.billing_address.city } : {}),
              ...(cart.billing_address?.country_code ? { country: cart.billing_address.country_code } : {}),
              ...(cart.billing_address?.address_1 ? { line1: cart.billing_address.address_1 } : {}),
              ...(cart.billing_address?.address_2 ? { line2: cart.billing_address.address_2 } : {}),
              ...(cart.billing_address?.postal_code ? { postal_code: cart.billing_address.postal_code } : {}),
              ...(cart.billing_address?.province ? { state: cart.billing_address.province } : {}),
            },
            ...(cart.email ? { email: cart.email } : {}),
            ...(cart.billing_address?.phone ? { phone: cart.billing_address.phone } : {}),
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi?.status === "requires_capture") ||
            (pi?.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent?.status === "requires_capture") ||
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

export default StripePaymentButton


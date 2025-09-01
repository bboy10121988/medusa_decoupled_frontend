"use client"

import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import Addresses from "@modules/checkout/components/addresses"
import Shipping from "@modules/checkout/components/shipping"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import OrderSummary from "@modules/checkout/templates/order-summary"

type CheckoutTemplateProps = {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}

const CheckoutTemplate = ({ cart, customer }: CheckoutTemplateProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const step = searchParams?.get("step") || "address"
  const [availableShippingMethods, setAvailableShippingMethods] = useState<HttpTypes.StoreCartShippingOption[]>([])

  useEffect(() => {
    console.log("🛒 CheckoutTemplate - cart.id:", cart?.id)
    if (cart?.id) {
      console.log("📞 呼叫 listCartShippingMethods...")
      listCartShippingMethods(cart.id).then((methods) => {
        console.log("📦 收到 shipping methods:", methods)
        if (methods) {
          setAvailableShippingMethods(methods)
        }
      }).catch((error) => {
        console.error("❌ listCartShippingMethods 錯誤:", error)
      })
    }
  }, [cart?.id])

  if (!cart) {
    return null
  }

  return (
    <div className="min-h-screen bg-ui-bg-subtle" data-testid="checkout-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-40 py-12">
          {/* Left side - Checkout form */}
          <div className="w-full" data-testid="checkout-form">
            {/* Steps indicator */}
            <div className="mb-8">
              <StepsIndicator currentStep={step} cart={cart} router={router} pathname={pathname} />
            </div>

            {/* Step content */}
            <div className="min-h-[400px]">
              {step === "address" && (
                <Addresses
                  cart={cart}
                  customer={customer}
                />
              )}
              {step === "delivery" && (
                <Shipping cart={cart} availableShippingMethods={availableShippingMethods} />
              )}
              {step === "payment" && (
                <Payment cart={cart} availablePaymentMethods={[]} />
              )}
              {step === "review" && (
                <Review cart={cart} />
              )}
            </div>
          </div>

          {/* Right side - Order summary */}
          <div className="relative" data-testid="checkout-summary">
            <div className="flex flex-col sticky top-8">
              <OrderSummary cart={cart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type StepsIndicatorProps = {
  currentStep: string
  cart: HttpTypes.StoreCart
  router: any
  pathname: string
}

const StepsIndicator = ({ currentStep, cart, router, pathname }: StepsIndicatorProps) => {
  const steps = [
    { id: "address", name: "配送地址", completed: false },
    { id: "delivery", name: "配送方式", completed: false },
    { id: "payment", name: "付款方式", completed: false },
    { id: "review", name: "確認訂單", completed: false },
  ]

  // Determine completion status based on cart state
  const hasAddress = !!(cart.shipping_address && cart.email)
  const hasShipping = !!(cart.shipping_methods && cart.shipping_methods.length > 0)
  const hasPayment = !!(cart.payment_collection?.payment_sessions && cart.payment_collection.payment_sessions.length > 0)

  steps[0].completed = !!hasAddress
  steps[1].completed = !!(hasAddress && hasShipping)
  steps[2].completed = !!(hasAddress && hasShipping && hasPayment)

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <nav aria-label="結帳步驟" className="mb-8">
      <ol className="flex items-center space-x-8">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep
          const isCompleted = step.completed
          const isAccessible = index <= currentStepIndex || isCompleted

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                    ${
                      isCurrent
                        ? "bg-ui-bg-interactive border-ui-border-interactive text-white"
                        : isCompleted
                        ? "bg-ui-bg-interactive border-ui-border-interactive text-white"
                        : "bg-ui-bg-subtle border-ui-border-base text-ui-fg-muted"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    ml-3 text-sm font-medium
                    ${
                      isCurrent
                        ? "text-ui-fg-base"
                        : isCompleted
                        ? "text-ui-fg-subtle"
                        : "text-ui-fg-muted"
                    }
                  `}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="ml-8 w-8 h-px bg-ui-border-base" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default CheckoutTemplate

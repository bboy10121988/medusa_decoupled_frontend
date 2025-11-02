"use client"

import { useSearchParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { listCartShippingMethods } from "../../../lib/data/fulfillment"
import { listCartPaymentMethods } from "../../../lib/data/payment"
import Addresses from "../components/addresses"
import Shipping from "../components/shipping"
import Payment from "../components/payment"
import OrderConfirmed from "../components/order-confirmed"
import Review from "../components/review"
import OrderSummary from "./order-summary"

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
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([])

  useEffect(() => {
    // console.log("🛒 CheckoutTemplate - cart.id:", cart?.id)
    if (cart?.id) {
      // console.log("📞 呼叫 listCartShippingMethods...")
      listCartShippingMethods(cart.id).then((methods) => {
        // console.log("📦 收到 shipping methods:", methods)
        if (methods && Array.isArray(methods)) {
          setAvailableShippingMethods(methods)
        } else {
          // console.log("⚠️ 配送方式為空或無效，設置為空陣列")
          setAvailableShippingMethods([])
        }
      }).catch((error) => {
        // console.error("❌ listCartShippingMethods 錯誤:", error)
        // 即使出錯也設置為空陣列，不阻止用戶操作
        setAvailableShippingMethods([])
      })

      // 加載付款方式 - 目前主要提供銀行轉帳
      if (cart.region?.id) {
        // console.log("💳 呼叫 listCartPaymentMethods...")
        listCartPaymentMethods(cart.region.id).then((methods) => {
          // console.log("💳 收到 payment methods:", methods)
          
          // 總是提供銀行轉帳選項，無論後端返回什麼
          const bankTransferMethod = {
            id: 'pp_bank_transfer',
            provider_id: 'pp_bank_transfer',
            is_enabled: true
          }
          
          if (methods && Array.isArray(methods) && methods.length > 0) {
            // 合併後端方法和銀行轉帳
            const combinedMethods = [bankTransferMethod, ...methods]
            setAvailablePaymentMethods(combinedMethods)
            // console.log("💳 設置組合付款方式:", combinedMethods)
          } else {
            // 只提供銀行轉帳
            setAvailablePaymentMethods([bankTransferMethod])
            // console.log("💳 只設置銀行轉帳選項")
          }
        }).catch((error) => {
          // console.error("❌ listCartPaymentMethods 錯誤:", error)
          // 出錯時提供銀行轉帳
          const fallbackMethods = [
            {
              id: 'pp_bank_transfer', 
              provider_id: 'pp_bank_transfer',
              is_enabled: true
            }
          ]
          setAvailablePaymentMethods(fallbackMethods)
          // console.log("💳 錯誤回退，設置銀行轉帳")
        })
      } else {
        // 沒有region時也提供銀行轉帳
        setAvailablePaymentMethods([
          {
            id: 'pp_bank_transfer',
            provider_id: 'pp_bank_transfer', 
            is_enabled: true
          }
        ])
        // console.log("💳 無region，預設銀行轉帳")
      }
    } else {
      // console.log("⚠️ 沒有 cart.id，無法獲取配送方式")
      setAvailableShippingMethods([])
      setAvailablePaymentMethods([])
    }
  }, [cart?.id, cart?.region?.id])

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
                <Payment cart={cart} availablePaymentMethods={availablePaymentMethods} />
              )}
              {step === "order-confirmed" && (
                <OrderConfirmed />
              )}
              {step === "review" && (
                <Review cart={cart} />
              )}
              {step === "step4" && (
                /* 這裡可以放步驟4的內容 */
                <div>hahah</div>
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
    { id: "review", name: "檢視訂單", completed: false },
  ]

  // Determine completion status based on cart state
  const hasAddress = !!(cart.shipping_address && cart.email)
  const hasShipping = !!(cart.shipping_methods && cart.shipping_methods.length > 0)
  // 支付完成判斷：檢查 metadata 中的支付方式選擇 或 payment_sessions
  const hasPayment = !!(
    cart.metadata?.selected_payment_provider || 
    (cart.payment_collection?.payment_sessions && cart.payment_collection.payment_sessions.length > 0)
  )

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  // 根據當前步驟和購物車狀態決定完成狀態
  // 只有在已完成且不是當前步驟時才標記為完成
  steps[0].completed = hasAddress && currentStepIndex > 0
  steps[1].completed = hasAddress && hasShipping && currentStepIndex > 1
  steps[2].completed = hasAddress && hasShipping && hasPayment && currentStepIndex > 2
  steps[3].completed = hasAddress && hasShipping && hasPayment && currentStep === "review"

  return (
    <nav aria-label="結帳步驟" className="mb-8">
      <ol className="flex items-center space-x-8">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep
          const isCompleted = step.completed
          // 只允許訪問當前步驟及之前的步驟（如果已完成的話）
          const isAccessible = index <= currentStepIndex || isCompleted
          // 如果用戶返回到之前的步驟，後面的步驟不應顯示為已完成
          const shouldShowAsCompleted = isCompleted && !isCurrent

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                    ${
                      isCurrent
                        ? "bg-gray-900 border-gray-900 text-white"
                        : shouldShowAsCompleted
                        ? "bg-gray-900 border-gray-900 text-white"
                        : "bg-gray-200 border-gray-300 text-gray-700"
                    }
                  `}
                >
                  {shouldShowAsCompleted ? (
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
                        : shouldShowAsCompleted
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

"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripe as isStripeFunc, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"

import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, { StripeCardContainer } from "@modules/checkout/components/payment-container"
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

// 檢查是否為綠界支付方式
const isEcpay = (providerId: string | undefined) => {
  return providerId?.includes("ecpay_")
}

// 檢查是否為獨立銀行轉帳
const isBankTransfer = (providerId: string | undefined) => {
  return providerId === "pp_bank_transfer"  // 前端使用這個識別符
}

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isStripe = isStripeFunc(selectedPaymentMethod)
  const isEcpayMethod = isEcpay(selectedPaymentMethod)
  const isBankTransferMethod = isBankTransfer(selectedPaymentMethod)

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    
    // 銀行轉帳不需要初始化payment session，只設置選擇狀態
    if (method === 'pp_bank_transfer') {
      // 只設置選擇狀態，不跳轉
      return
    }
    
    if (isStripeFunc(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    } else if (isEcpay(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || 
    paidByGiftcard ||
    (selectedPaymentMethod === 'pp_bank_transfer' && cart?.shipping_methods.length !== 0) // 銀行轉帳不需要payment session

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // 銀行轉帳路線 - 直接創建訂單並跳轉到第四步驟
      if (selectedPaymentMethod === 'pp_bank_transfer') {
        console.log("Bank transfer selected, creating order directly, cart:", cart.id)
        
        try {
          // 銀行轉帳使用系統默認的 payment session
          await initiatePaymentSession(cart, {
            provider_id: 'pp_system_default', // 實際使用系統默認provider
          })
          
          // 直接創建訂單
          console.log("Creating order for bank transfer...")
          const order = await placeOrder(cart.id)
          
          if (order) {
            console.log("Order created successfully:", order)
            
            // 直接跳轉到第四步驟（訂單確認）
            const params = new URLSearchParams(searchParams)
            params.set('step', 'order-confirmed')
            params.set('order_id', order.id)
            
            const newUrl = `${pathname}?${params.toString()}`
            console.log("🚀 跳轉到訂單確認步驟:", newUrl)
            
            return router.push(newUrl, { scroll: false })
          } else {
            throw new Error("訂單建立失敗")
          }
        } catch (bankTransferError: any) {
          console.error("Bank transfer order creation failed:", bankTransferError)
          setError("銀行轉帳訂單建立失敗：" + bankTransferError.message)
        } finally {
          setIsLoading(false)
        }
        return
      }
      
      // 綠界付款路線 - 獨立處理
      if (selectedPaymentMethod.startsWith('ecpay_')) {
        // 綠界付款直接跳到 review 步驟
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
      
      // Stripe付款路線 - 原有邏輯
      const shouldInputCard =
        isStripeFunc(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-2xl gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          付款方式
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-600-hover"
              data-testid="edit-payment-button"
            >
              編輯
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && (
            <>
              {/* 只顯示兩個硬編碼選項：綠界支付（含刷卡）與銀行轉帳 */}
              <RadioGroup value={selectedPaymentMethod} onChange={setPaymentMethod}>
                <RadioGroup.Option value="ecpay_credit_card">
                  {({ checked }) => (
                    <div className={`border p-4 rounded mb-2 ${checked ? 'border-blue-500' : 'border-gray-200'}`}>
                      <Heading level="h3" className="text-base font-medium mb-1">綠界支付（含刷卡）</Heading>
                      <Text className="text-sm text-gray-600">信用卡 / 金融卡 (VISA、Mastercard、JCB)</Text>
                    </div>
                  )}
                </RadioGroup.Option>
                <RadioGroup.Option value="pp_bank_transfer">
                  {({ checked }) => (
                    <div className={`border p-4 rounded mb-2 ${checked ? 'border-blue-500' : 'border-gray-200'}`}>
                      <Heading level="h3" className="text-base font-medium mb-1">銀行轉帳</Heading>
                      <Text className="text-sm text-gray-600">手動銀行轉帳 (需要人工核帳)</Text>
                    </div>
                  )}
                </RadioGroup.Option>
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="text-sm text-gray-900 mb-1 font-medium">
                付款方式
              </Text>
              <Text
                className="text-xs text-gray-600"
                data-testid="payment-method-summary"
              >
                禮品卡
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripe && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard) ||
              !paymentReady
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeFunc(selectedPaymentMethod)
              ? "輸入信用卡資料"
              : selectedPaymentMethod === "pp_bank_transfer"
                ? "前往銀行轉帳"
                : selectedPaymentMethod === "ecpay_credit_card"
                  ? "繼續到綠界付款"
                  : selectedPaymentMethod === "ecpay_store_payment"
                    ? "確認超商取貨付款"
                    : "繼續檢視訂單"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="text-sm text-gray-900 mb-1 font-medium">
                  付款方式
                </Text>
                <Text
                  className="text-xs text-gray-600"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="text-sm text-gray-900 mb-1 font-medium">
                  付款詳情
                </Text>
                <div
                  className="flex gap-2 text-xs text-gray-600 items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-gray-200">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "將於下一步顯示"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-gray-900 mb-1">
                付款方式
              </Text>
              <Text
                className="txt-medium text-gray-600"
                data-testid="payment-method-summary"
              >
                禮品卡
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment

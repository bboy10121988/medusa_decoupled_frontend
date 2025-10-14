"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripe as isStripeFunc, paymentInfoMap } from "../../../../constants"
import { updateCart, createPaymentCollectionForBankTransfer } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"

import ErrorMessage from "@modules/checkout/components/error-message"
// import PaymentContainer, { StripeCardContainer } from "@modules/checkout/components/payment-container" // 🗑️ 未使用 - 已註解清理
import Divider from "@modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

// 🗑️ 檢查是否為綠界支付方式 - 未使用，已註解清理
// const isEcpay = (providerId: string | undefined) => {
//   return providerId === "ecpay_credit_card";
// }


const Payment = ({
  cart,
  // availablePaymentMethods, // 🗑️ 未使用參數 - 已註解清理
}: {
  cart: {
    id?: string
    total?: number
    gift_cards?: Array<{
      id: string
      code: string
      balance: number
    }>
    metadata?: Record<string, unknown>
    payment_collection?: {
      payment_sessions?: Array<{
        id: string
        provider_id: string
        status: string
      }>
    }
    shipping_methods: Array<{
      id: string
      shipping_option_id: string
    }>
  }
  // availablePaymentMethods: any[] // 🗑️ 未使用參數 - 已註解清理
}) => {

  // 硬編碼支付方式 ID - 確保值不會是 undefined
  const payment_method_default = "manual_manual"
  const payment_method_ecpay_credit = "ecpay_credit_card"

  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand] = useState<string | null>(null) // 📝 setter未使用，保留state供UI顯示
  const [cardComplete] = useState(false) // 📝 setter未使用，保留state供按鈕狀態判斷
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? payment_method_ecpay_credit // ✨ 使用 nullish coalescing
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isStripe = isStripeFunc(selectedPaymentMethod)
  // const isEcpayMethod = isEcpay(selectedPaymentMethod) // 🗑️ 未使用變數 - 已註解清理

  const setPaymentMethod = async (method: string) => {
    
    // const action: string = "setPaymentMethod" // 🔇 未使用變數 - 已註解
    
    // console.log(action,"選擇支付方式：",method) // 🔇 移除console輸出

    // 確保方法不是 undefined 或 null
    if (method) {
      setSelectedPaymentMethod(method)
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // 支付就緒判斷：有選擇支付方式並且有配送方式，或者使用禮品卡付款
  const paymentReady =
    ((selectedPaymentMethod && cart?.shipping_methods.length !== 0) || 
     (activeSession && cart?.shipping_methods.length !== 0) || 
     paidByGiftcard)

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
    
    // const action: string = "handleSubmit" // 🔇 未使用變數 - 已註解
  
    setIsLoading(true)

    // console.log(action,"支付方式(providerID):",selectedPaymentMethod) // 🔇 移除console輸出

    try {
      // 檢查是否有必要的購物車數據
      if (!cart?.id) {
        throw new Error("購物車不存在，請重新刷新頁面")
      }

      // console.log(action,":保存選擇的支付方式到購物車") // 🔇 移除console輸出

      // 將選擇的支付方式保存到購物車 metadata 中
      await updateCart({
        metadata: {
          ...cart.metadata,
          selected_payment_provider: selectedPaymentMethod
        }
      })

      // 如果選擇銀行轉帳，創建 payment collection 以滿足 Medusa v2 要求
      if (selectedPaymentMethod === payment_method_default) {
        console.log("🏦 創建銀行轉帳 payment collection")
        await createPaymentCollectionForBankTransfer(cart.id)
      }

      return router.push(
        pathname + "?" + createQueryString("step", "review"),
        {
          scroll: false,
        }
      )
      
    } catch (err: unknown) {
      // console.log(action,"錯誤詳情:",err) // 🔇 移除console輸出
      const errorMessage = err instanceof Error ? err.message : "設置支付方式時發生未知錯誤"
      setError(errorMessage)
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
              <RadioGroup 
                value={selectedPaymentMethod ?? payment_method_ecpay_credit} // ✨ 使用 nullish coalescing 
                onChange={setPaymentMethod}
              >
                <RadioGroup.Option value={payment_method_ecpay_credit}>
                  {({ checked }) => (
                    <div className={`border p-4 rounded mb-2 ${checked ? 'border-blue-500' : 'border-gray-200'}`}>
                      <Heading level="h3" className="text-base font-medium mb-1">綠界支付（含刷卡）</Heading>
                      <Text className="text-sm text-gray-600">信用卡 / 金融卡 (VISA、Mastercard、JCB)</Text>
                    </div>
                  )}
                </RadioGroup.Option>
                <RadioGroup.Option value={payment_method_default}>
                  {({ checked }) => (
                    <div className={`border p-4 rounded mb-2 ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <Heading level="h3" className="text-base font-medium mb-1">銀行轉帳</Heading>
                      <Text className="text-sm text-gray-600 mb-2">手動銀行轉帳 (需要人工核帳)</Text>
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

          <div className="flex gap-4 mt-6">
            <Button
              variant="secondary"
              onClick={() => router.push(pathname + "?" + createQueryString("step", "delivery"), { scroll: false })}
              className="flex-1"
            >
              上一步：修改配送方式
            </Button>
            <div className="flex-2">
              <Button
                size="large"
                className="w-full"
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={
                  (isStripe && !cardComplete) ??
                  (!selectedPaymentMethod && !paidByGiftcard)
                }
                data-testid="submit-payment-button"
              >
                繼續檢視訂單
              </Button>
            </div>
          </div>
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
                  {paymentInfoMap[activeSession?.provider_id]?.title ??
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

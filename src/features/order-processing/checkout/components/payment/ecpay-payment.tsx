"use client"

import { RadioGroup } from "@headlessui/react"
import { useState } from "react"
import { Heading, Text, clx } from "@medusajs/ui"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"

interface EcpayPaymentProps {
  cart: any
  onPaymentMethodChange: (method: string) => Promise<void>
  selectedPaymentMethod: string
  onError?: (error: string) => void
}

const EcpayPayment: React.FC<EcpayPaymentProps> = ({
  cart,
  onPaymentMethodChange,
  selectedPaymentMethod,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // 檢查是否選擇了超商配送
  const isConvenienceStoreDelivery = cart?.shipping_methods?.some(
    (method: any) => method.shipping_option?.name?.includes("超商") || 
                     method.shipping_option?.name?.includes("便利商店")
  )

  // 支付選項
  const paymentOptions = [
    {
      id: "ecpay_credit_card",
      name: "信用卡付款",
      description: "VISA/Master/JCB",
      icon: <CreditCard className="w-5 h-5" />,
      available: true
    },
    {
      id: "ecpay_atm",
      name: "ATM 轉帳",
      description: "線上產生專屬虛擬帳號",
      icon: <span className="w-5 h-5 rounded flex items-center justify-center text-white text-xs" style={{ backgroundColor: "var(--color-primary)" }}>ATM</span>,
      available: true
    },
    {
      id: "ecpay_store_payment",
      name: "超商取貨付款",
      description: "僅適用於超商取貨",
      icon: <span className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-white text-xs">超商</span>,
      available: isConvenienceStoreDelivery
    }
  ]

  // 處理支付方式變更
  const handlePaymentMethodChange = async (method: string) => {
    setIsLoading(true)
    setLocalError(null)
    
    try {
      // 驗證選擇
      if (method === "ecpay_store_payment" && !isConvenienceStoreDelivery) {
        throw new Error("超商取貨付款僅適用於超商取貨配送方式")
      }

      await onPaymentMethodChange(method)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "選擇付款方式時發生錯誤"
      setLocalError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Heading level="h3" className="text-base font-medium">
        綠界支付
      </Heading>

      {localError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <Text className="text-rose-500 text-sm">{localError}</Text>
        </div>
      )}

      <RadioGroup 
        value={selectedPaymentMethod} 
        onChange={handlePaymentMethodChange}
        className="space-y-4"
        disabled={isLoading}
      >
        <div className="space-y-2">
          {paymentOptions.map((option) => (
            <RadioGroup.Option
              key={option.id}
              value={option.id}
              disabled={!option.available || isLoading}
            >
              {({ active, checked, disabled }) => (
                <div
                  className={clx(
                    "relative flex cursor-pointer rounded-lg px-5 py-4 shadow-sm focus:outline-none border-2",
                    {
                      "bg-gray-50 cursor-not-allowed": disabled,
                    }
                  )}
                  style={{
                    backgroundColor: disabled ? "#f9fafb" : checked ? "var(--bg-secondary)" : "var(--bg-primary)",
                    borderColor: checked ? "var(--color-primary)" : "var(--border-primary)",
                    boxShadow: active && !disabled ? "0 0 0 2px var(--color-primary-light)" : undefined
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <RadioGroup.Label
                          as="p"
                          className={clx(
                            "font-medium",
                            {
                              "text-gray-900": !disabled,
                              "text-gray-400": disabled
                            }
                          )}
                        >
                          {option.name}
                        </RadioGroup.Label>
                        <RadioGroup.Description
                          as="span"
                          className={clx(
                            "inline text-sm",
                            {
                              "text-gray-500": !disabled,
                              "text-gray-400": disabled
                            }
                          )}
                        >
                          {option.description}
                        </RadioGroup.Description>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                  </div>
                  {checked && (
                    <div className="absolute top-4 right-4">
                      <CheckCircleSolid 
                        className="h-5 w-5"
                        style={{ color: "var(--color-primary)" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

export default EcpayPayment
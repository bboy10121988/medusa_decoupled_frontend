"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

type ShippingOption = {
  id: string
  name: string
  description?: string
  amount: number
  metadata?: Record<string, any>
}

type EnhancedShippingProps = {
  cart: any
  shippingOptions: ShippingOption[]
  onShippingMethodChange?: (methodId: string, type?: string) => void
  selectedShippingMethod?: string
}

const EnhancedShipping: React.FC<EnhancedShippingProps> = ({
  cart,
  shippingOptions = [],
  onShippingMethodChange,
  selectedShippingMethod = ""
}) => {
  const [internalSelection, setInternalSelection] = useState<string>(selectedShippingMethod)

  // 調試信息：顯示收到的運輸選項
  console.log('🚚 EnhancedShipping 收到的選項:', shippingOptions)
  console.log('🚚 選項數量:', shippingOptions.length)
  shippingOptions.forEach((option, index) => {
    console.log(`🚚 選項 ${index + 1}:`, option)
  })

  const handleOptionChange = (optionId: string) => {
    setInternalSelection(optionId)
    onShippingMethodChange?.(optionId, "home_delivery")
  }

  const formatPrice = (amount: number) => {
    return amount === 0 ? "免費" : `NT$${amount}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-sans h3-core text-base font-medium mb-4 text-gray-900">
          選擇配送方式
        </h3>
        
        <RadioGroup 
          value={internalSelection} 
          onChange={handleOptionChange}
          className="space-y-3"
        >
          <div className="space-y-3">
            {shippingOptions.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-800 font-medium">載入配送方式中...</p>
              </div>
            ) : (
              shippingOptions.map((option) => (
                <RadioGroup.Option
                  key={option.id}
                  value={option.id}
                  className={({ active, checked }) => clx(
                    "relative flex cursor-pointer rounded-lg p-4 focus:outline-none border-2 transition-all",
                    {
                      "border-gray-900 bg-gray-50": checked,
                      "border-gray-200 hover:border-gray-400 bg-white": !checked,
                      "ring-2 ring-gray-300 ring-opacity-50": active,
                    }
                  )}
                >
                  {({ checked }) => (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold bg-gray-900 text-white">
                          宅
                        </div>
                        <div>
                          <p className="font-sans txt-medium font-medium text-gray-900">
                            {option.name}
                          </p>
                          <p className="font-normal font-sans txt-medium text-sm text-gray-600">
                            宅配到府服務
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-sans txt-medium font-medium text-gray-900">
                          {formatPrice(option.amount)}
                        </p>
                        {checked && (
                          <CheckCircleSolid className="h-5 w-5 text-gray-900" />
                        )}
                      </div>
                    </div>
                  )}
                </RadioGroup.Option>
              ))
            )}
          </div>
        </RadioGroup>

        {/* 選擇提示 */}
        {internalSelection && (
          <div className="mt-4 p-3 rounded-lg border border-gray-900 bg-gray-50">
            <p className="font-normal font-sans txt-medium text-sm text-gray-900">
              ✓ 已選擇配送方式，請點擊下方「確認選擇」按鈕繼續
            </p>
          </div>
        )}

        {/* 配送說明 */}
        {internalSelection && (
          <div 
            className="mt-4 p-4 rounded-lg"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>配送說明：</strong>
              <div className="mt-2 space-y-1">
                <div>• 配送時間：週一至週五 09:00-18:00</div>
                <div>• 請確保配送地址正確且有人收件</div>
                <div>• 如無人收件將安排重新配送</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedShipping

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="product-option-group">
      <div className="product-option-label">
        <span>{title || '選項'}</span>
      </div>
      <div
        className="product-option-buttons"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "relative px-4 py-3 min-w-16 text-sm font-medium rounded-lg border-2 transition-all duration-300 ease-spring",
                {
                  // 選中狀態 - 黑色主題
                  "border-black bg-black text-white shadow-lg transform scale-105": isSelected,
                  // 未選中狀態 - 簡潔風格
                  "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 hover:scale-102": !isSelected && !disabled,
                  // 禁用狀態
                  "opacity-50 cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400": disabled,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
              {/* 選中指示器 - 右上角小圓點 */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-black animate-indicator-appear">
                  <div className="w-full h-full bg-black rounded-full scale-50"></div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect

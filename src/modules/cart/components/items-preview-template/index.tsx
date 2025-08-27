"use client"

import { convertToLocale } from "@lib/util/money"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemsPreviewTemplateProps = {
  items: any[]
}

const ItemsPreviewTemplate = ({ items }: ItemsPreviewTemplateProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-ui-fg-subtle py-4">
        購物車是空的
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-3">
          {/* Product image */}
          <div className="flex-shrink-0 w-12 h-12 bg-ui-bg-subtle rounded-lg overflow-hidden">
            <Thumbnail
              thumbnail={item.thumbnail || item.variant?.product?.thumbnail}
              images={item.variant?.product?.images}
              size="square"
              className="w-full h-full p-0 bg-transparent shadow-none"
            />
          </div>

          {/* Product details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-ui-fg-base truncate">
              {item.title}
            </h3>
            {item.variant?.title && item.variant.title !== "Default Variant" && (
              <p className="text-xs text-ui-fg-subtle">
                {item.variant.title}
              </p>
            )}
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-ui-fg-subtle">
                數量: {item.quantity}
              </span>
              <span className="text-sm font-medium text-ui-fg-base">
                {convertToLocale({
                  amount: item.total || 0,
                  currency_code: item.variant?.calculated_price?.currency_code || "TWD",
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ItemsPreviewTemplate

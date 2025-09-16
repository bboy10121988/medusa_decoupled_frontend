"use client"

import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@shared/utilities/money"
import Image from "next/image"

type ItemsPreviewTemplateProps = {
  items: HttpTypes.StoreCartLineItem[]
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
          <div className="flex-shrink-0 w-12 h-12 bg-ui-bg-subtle rounded-lg overflow-hidden relative">
            {item.variant?.product?.thumbnail || item.thumbnail ? (
              <Image
                src={item.variant?.product?.thumbnail || item.thumbnail || ""}
                alt={item.title || "Product image"}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback-placeholder') as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className="fallback-placeholder w-full h-full bg-ui-bg-subtle absolute inset-0 items-center justify-center" style={{ display: (item.variant?.product?.thumbnail || item.thumbnail) ? 'none' : 'flex' }}>
              <span className="text-ui-fg-muted text-xs">無圖片</span>
            </div>
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

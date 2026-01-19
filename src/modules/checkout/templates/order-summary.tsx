"use client"

import { HttpTypes } from "@medusajs/types"
import CartTotals from "@modules/common/components/cart-totals"
import ItemsPreviewTemplate from "@modules/cart/components/items-preview-template"
import { cartTranslations, checkoutTranslations } from "@/lib/translations"

type OrderSummaryProps = {
  cart: HttpTypes.StoreCart
  countryCode: string
}

const OrderSummary = ({ cart, countryCode }: OrderSummaryProps) => {
  const itemCount = cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const t = checkoutTranslations[countryCode as keyof typeof checkoutTranslations] || checkoutTranslations.tw
  const tCart = cartTranslations[countryCode as keyof typeof cartTranslations] || cartTranslations.tw

  return (
    <div className="bg-white rounded-lg border border-ui-border-base p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-ui-border-base">
        <h2 className="text-xl font-semibold text-ui-fg-base">
          {t.orderSummary}
        </h2>
        <span className="text-sm text-ui-fg-subtle">
          {itemCount} {t.items}
        </span>
      </div>

      {/* Items preview */}
      <div className="mb-6">
        <ItemsPreviewTemplate items={cart.items || []} />
      </div>

      {/* Divider */}
      <div className="border-t border-ui-border-base mb-6" />

      {/* Cart totals */}
      <div className="space-y-4">
        <CartTotals totals={cart} />
      </div>

      {/* Additional info */}
      <div className="mt-6 pt-4 border-t border-ui-border-base">
        <div className="text-xs text-ui-fg-subtle space-y-1">
          <p>{t.taxIncluded}</p>
          <p>{t.shippingCalculatedAtStep}</p>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary

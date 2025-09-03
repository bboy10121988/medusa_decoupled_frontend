"use client"

import { VariantPrice } from "../../../../types/global"

export default function ClientPreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <div className="flex items-center gap-x-2">
      {price.price_type === "sale" && (
        <span
          className="line-through text-gray-500 text-sm md:text-xs"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={`text-sm md:text-xs font-medium ${
          price.price_type === "sale" ? "text-red-600" : "text-gray-700"
        }`}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </div>
  )
}

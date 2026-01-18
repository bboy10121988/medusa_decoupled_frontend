"use client"

import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { getTranslation } from "@lib/translations"

type ProductDisplayProps = {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function ProductDisplay({ products, region }: ProductDisplayProps) {
  const countryCode = region.countries?.[0]?.iso_2 || 'tw'
  const t = getTranslation(countryCode)

  if (products?.length === 0) {
    return (
      <div className="w-full py-8 text-center text-gray-500">
        {(t as any).product?.no_products || '此分類暫無商品'}
      </div>
    )
  }

  return (
    <div className="w-full">
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <li key={product.id} className="relative group">
            <ProductPreview product={product} countryCode={region.countries?.[0]?.iso_2 || "tw"} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}

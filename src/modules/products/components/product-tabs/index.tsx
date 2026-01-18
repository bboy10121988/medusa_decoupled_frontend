"use client"

import CollapsibleSection from "../collapsible-section/index"
import CategoriesAndTagsTab from "../categories-and-tags-tab/index"
import ShippingInfoTab from "../shipping-info-tab/index"
import { getTranslation } from "@lib/translations"

type ProductTabsProps = {
  product: any
  countryCode?: string
}

const ProductTabs = ({ product, countryCode = 'tw' }: ProductTabsProps) => {
  const t = getTranslation(countryCode)

  return (
    <div className="w-full">
      <CollapsibleSection title={t.productInfo || "Product Information"} defaultOpen={false}>
        <ProductInfoTab product={product} countryCode={countryCode} />
      </CollapsibleSection>

      <CollapsibleSection title={t.categoriesAndTags || "Categories & Tags"} defaultOpen={false}>
        <CategoriesAndTagsTab product={product} />
      </CollapsibleSection>

      <CollapsibleSection title={t.returnPolicy || "Return Policy"} defaultOpen={false}>
        <ShippingInfoTab product={product} countryCode={countryCode} />
      </CollapsibleSection>
    </div>
  )
}

const ProductInfoTab = ({ product, countryCode = 'tw' }: ProductTabsProps) => {
  const t = getTranslation(countryCode)

  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-6">
        <div>
          <span className="font-semibold text-base">{t.description || "Description"}</span>
          <p className="mt-2 text-base text-gray-700 whitespace-pre-line">
            {product.description || (t.noDescription || "No description available")}
          </p>
        </div>
        {product.material && (
          <div>
            <span className="font-semibold text-base">{t.material || "Material"}</span>
            <p className="mt-2 text-base text-gray-700">{product.material}</p>
          </div>
        )}
        {product.weight && (
          <div>
            <span className="font-semibold text-base">{t.weight || "Weight"}</span>
            <p className="mt-2 text-base text-gray-700">{product.weight}g</p>
          </div>
        )}
        {product.dimensions && (
          <div>
            <span className="font-semibold text-base">{t.dimensions || "Dimensions"}</span>
            <p className="mt-2 text-base text-gray-700">
              {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTabs


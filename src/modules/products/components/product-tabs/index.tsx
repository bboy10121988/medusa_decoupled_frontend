"use client"

import CollapsibleSection from "../collapsible-section/index"
import CategoriesAndTagsTab from "../categories-and-tags-tab/index"
import ShippingInfoTab from "../shipping-info-tab/index"

type ProductTabsProps = {
  product: any
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  return (
    <div className="w-full">
      <CollapsibleSection title="商品資訊" defaultOpen={false}>
        <ProductInfoTab product={product} />
      </CollapsibleSection>
      
      <CollapsibleSection title="分類與標籤" defaultOpen={false}>
        <CategoriesAndTagsTab product={product} />
      </CollapsibleSection>
      
      <CollapsibleSection title="退換貨規則" defaultOpen={false}>
        <ShippingInfoTab product={product} />
      </CollapsibleSection>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-6">
        <div>
          <span className="font-semibold text-base">商品描述</span>
          <p className="mt-2 text-base text-gray-700 whitespace-pre-line">
            {product.description || "暫無商品描述"}
          </p>
        </div>
        {product.material && (
          <div>
            <span className="font-semibold text-base">材質</span>
            <p className="mt-2 text-base text-gray-700">{product.material}</p>
          </div>
        )}
        {product.weight && (
          <div>
            <span className="font-semibold text-base">重量</span>
            <p className="mt-2 text-base text-gray-700">{product.weight}g</p>
          </div>
        )}
        {product.dimensions && (
          <div>
            <span className="font-semibold text-base">尺寸</span>
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

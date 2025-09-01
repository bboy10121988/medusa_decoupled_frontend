import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
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
        {(product as any).material && (
          <div>
            <span className="font-semibold text-base">材質</span>
            <p className="mt-2 text-base text-gray-700">{(product as any).material}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfoTab

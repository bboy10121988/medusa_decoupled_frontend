import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"

type CheckoutItemProps = {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}

const CheckoutItem = ({ item, currencyCode }: CheckoutItemProps) => {
  const productVariantTitle = item.variant?.title || ""
  
  return (
    <div className="flex gap-4">
      {/* Product image */}
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className="flex-shrink-0"
      >
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className="w-full h-full object-cover"
          />
        </div>
      </LocalizedClientLink>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <Text className="font-medium text-gray-900 text-sm leading-tight">
            {item.product_title}
          </Text>
          {productVariantTitle && (
            <Text className="text-xs text-gray-500 mt-1">
              {productVariantTitle}
            </Text>
          )}
        </div>
        
        {/* Price and quantity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Text className="text-xs text-gray-500">數量</Text>
            <Text className="text-sm font-medium text-gray-900">{item.quantity}</Text>
          </div>
          
          <div className="flex items-center justify-between">
            <Text className="text-xs text-gray-500">單價</Text>
            <div className="text-right">
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
            <Text className="text-sm font-medium text-gray-900">小計</Text>
            <div className="text-right">
              <LineItemPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
                className="text-sm font-semibold text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutItem

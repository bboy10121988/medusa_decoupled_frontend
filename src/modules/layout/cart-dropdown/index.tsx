"use client"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

const CartDropdown = ({
  cart: cartState,
  onClose,
}: {
  cart?: HttpTypes.StoreCart | null
  onClose?: () => void
}) => {
  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0

  return (
    <div className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-white border-x border-b border-gray-200 w-[420px] text-ui-fg-base z-50 shadow-lg">
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <h3 className="text-base font-semibold">購物車</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
            aria-label="關閉購物車"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
      {cartState && cartState.items?.length ? (
        <>
          <div className="overflow-y-scroll max-h-[350px] px-6 py-4 grid grid-cols-1 gap-y-6 no-scrollbar">
            {cartState.items
              .sort((a, b) => {
                return (a.created_at ?? "") > (b.created_at ?? "")
                  ? -1
                  : 1
              })
              .map((item) => (
                <div
                  className="grid grid-cols-[90px_1fr_100px] gap-x-3 pr-4"
                  key={item.id}
                  data-testid="cart-item"
                >
                  <LocalizedClientLink
                    href={`/products/${item.product_handle}`}
                    className="w-24"
                  >
                    <Thumbnail
                      thumbnail={item.thumbnail}
                      images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                  <div className="flex flex-col justify-between flex-1 min-h-[80px]">
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium leading-tight break-words">
                          <LocalizedClientLink
                            href={`/products/${item.product_handle}`}
                            data-testid="product-link"
                          >
                            {item.title}
                          </LocalizedClientLink>
                        </h4>
                        <div className="flex flex-col gap-1 mt-2">
                          <LineItemOptions
                            variant={item.variant}
                            data-testid="cart-item-variant"
                            data-value={item.variant}
                          />
                          <div className="flex items-center gap-3">
                            <span
                              className="text-xs text-gray-600"
                              data-testid="cart-item-quantity"
                              data-value={item.quantity}
                            >
                              數量: {item.quantity}
                            </span>
                            <DeleteButton
                              id={item.id}
                              className="text-xs p-0 hover:text-red-600 transition-colors"
                              data-testid="cart-item-remove-button"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-start items-end">
                    <LineItemPrice
                      item={item}
                      style="tight"
                      currencyCode={cartState.currency_code}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div className="p-6 border-t border-gray-100 flex flex-col gap-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">
                小計{" "}
                <span className="font-normal text-xs text-gray-500">(未含稅)</span>
              </span>
              <span
                className="text-base font-semibold"
                data-testid="cart-subtotal"
                data-value={subtotal}
              >
                {convertToLocale({
                  amount: subtotal,
                  currency_code: cartState.currency_code,
                })}
              </span>
            </div>
            <LocalizedClientLink href="/cart" passHref>
              <Button
                className="w-full"
                size="large"
                data-testid="go-to-cart-button"
              >
                前往購物車
              </Button>
            </LocalizedClientLink>
          </div>
        </>
      ) : (
        <div className="px-6 py-12">
          <div className="flex flex-col gap-y-6 items-center justify-center text-center">
            <div className="bg-gray-100 text-gray-600 text-sm flex items-center justify-center w-12 h-12 rounded-full">
              <span>0</span>
            </div>
            <span className="text-sm text-gray-600">您的購物車是空的</span>
            <div>
              <LocalizedClientLink href="/store">
                <>
                  <span className="sr-only">前往所有商品頁面</span>
                  <Button size="base">探索商品</Button>
                </>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartDropdown

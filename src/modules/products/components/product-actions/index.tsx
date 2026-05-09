"use client"

import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import isEqual from "lodash/isEqual"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { getTranslation, cartTranslations } from "@lib/translations"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const t = getTranslation(countryCode)

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
      // console.log("🔧 自動預選單一變體:", {
      // productTitle: product.title,
      // variantId: product.variants[0].id,
      // variantTitle: product.variants[0].title,
      // options: variantOptions,
      // calculated_price: product.variants[0].calculated_price
      // })
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    const variant = product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })

    // console.log("🔍 變體選擇檢查:", {
    // productTitle: product.title,
    // totalVariants: product.variants.length,
    // currentOptions: options,
    // selectedVariantId: variant?.id,
    // selectedVariantTitle: variant?.title,
    // hasCalculatedPrice: !!(variant as any)?.calculated_price?.calculated_amount
    // })

    return variant
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  // 檢查選中的變體是否有價格設定
  const hasPrice = useMemo(() => {
    if (!selectedVariant) {
      return false
    }

    // 檢查是否有 calculated_price - 支援多種價格結構
    const variant = selectedVariant as any
    // console.log("🔍 價格檢查:", {
    // variantId: selectedVariant.id,
    // calculated_price: variant.calculated_price,
    // hasCalculatedAmount: !!(variant.calculated_price?.calculated_amount),
    // hasAmount: !!(variant.calculated_price?.amount),
    // fullVariant: variant
    // })

    return !!(
      variant.calculated_price?.calculated_amount ||
      variant.calculated_price?.amount ||
      (variant.prices && variant.prices.length > 0)
    )
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return

    // console.log("🛒 正在加入購物車:", {
    // variantId: selectedVariant.id,
    // quantity: 1,
    // countryCode,
    // selectedVariant
    // })

    setIsAdding(true)

    try {
      // 使用新的 API route
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity: 1,
          countryCode,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '加入購物車失敗')
      }

      // console.log("✅ 成功加入購物車:", result)

      // 如果 API 回傳 cartId，也在前端設定
      if (result.cartId && typeof window !== 'undefined') {
        localStorage.setItem('_medusa_cart_id', result.cartId)
        document.cookie = `_medusa_cart_id=${result.cartId}; max-age=${60 * 60 * 24 * 7}; path=/; samesite=lax`
        // console.log("📱 前端儲存 Cart ID:", result.cartId)
      }

      // console.log("💡 商品已加入購物車！")

      // 觸發購物車更新事件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdate'))
      }
      setAddedToCart(true)
    } catch (error) {
      // 可以在這裡添加用戶友好的錯誤提示
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option, index) => {
                return (
                  <div key={option.id ? `${option.id}-${option.title}` : `option-${index}-${option.title}`}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        {addedToCart ? (
          <Button
            onClick={() => router.push(`/${countryCode}/cart`)}
            variant="secondary"
            className="w-full h-10"
            data-testid="go-to-cart-button"
          >
            {(cartTranslations[countryCode as keyof typeof cartTranslations] || cartTranslations.tw)?.goToCart || "前往購物車"}
          </Button>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !hasPrice ||
              !!disabled ||
              isAdding ||
              !isValidVariant
            }
            variant="primary"
            className="w-full h-10"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant && !options
              ? (t.selectOptions || "Select Options")
              : !selectedVariant && options
                ? (t.selectOptions || "Select Options")
                : !hasPrice
                  ? (t.priceNotAvailable || "Price Not Available")
                  : !inStock || !isValidVariant
                    ? (t.outOfStock || "Out of Stock")
                    : (t.addToCart || "Add to Cart")}
          </Button>
        )}
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock && hasPrice}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}

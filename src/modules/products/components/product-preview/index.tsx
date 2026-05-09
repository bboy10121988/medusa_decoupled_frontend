"use client"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "../../../common/components/localized-client-link/index"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Thumbnail from "../thumbnail/index"
import ClientPreviewPrice from "./client-price"
import { getTranslation, cartTranslations } from "../../../../lib/translations"

/*
type ProductOption = {
  id: string
  title: string
  values: string[]
}
*/

type SelectedOptions = {
  [key: string]: string | null
}

export default function ProductPreview({
  product,
  isFeatured,
  countryCode = "tw",
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  countryCode?: string
}) {
  const t = getTranslation(countryCode)
  const { cheapestPrice } = getProductPrice({
    product,
  })

  // 簡化的庫存狀態檢查
  const productStockStatus = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return { isSoldOut: false, canPreorder: false }
    }

    const allVariantsOutOfStock = product.variants.every(variant => {
      return variant.manage_inventory && (variant.inventory_quantity || 0) === 0
    })

    const canPreorder = product.variants.some(variant => {
      return variant.allow_backorder === true
    })

    return {
      isSoldOut: allVariantsOutOfStock && !canPreorder,
      canPreorder: allVariantsOutOfStock && canPreorder
    }
  }, [product])

  // 為了向後相容，保留 isProductSoldOut
  const isProductSoldOut = productStockStatus.isSoldOut

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageTransitioning, setIsImageTransitioning] = useState(false)
  // const [showVariantSelector, setShowVariantSelector] = useState(false)
  const [showMobileOptions, setShowMobileOptions] = useState(false)
  // const [isHovered, setIsHovered] = useState(false)

  // 獲取所有可用圖片
  const allImages = useMemo(() => {
    const images = []
    if (product.thumbnail) {
      images.push(product.thumbnail)
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img.url && img.url !== product.thumbnail) {
          images.push(img.url)
        }
      })
    }
    return images
  }, [product.thumbnail, product.images])

  // 切換圖片的通用函數，帶淡出淡入效果
  const changeImage = (newIndex: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (allImages.length > 1 && newIndex !== currentImageIndex) {
      setIsImageTransitioning(true)
      setTimeout(() => {
        setCurrentImageIndex(newIndex)
        setIsImageTransitioning(false)
      }, 150) // 淡出時間
    }
  }

  // 切換到下一張圖片
  const nextImage = (e: React.MouseEvent) => {
    const newIndex = (currentImageIndex + 1) % allImages.length
    changeImage(newIndex, e)
  }

  // 切換到上一張圖片
  const prevImage = (e: React.MouseEvent) => {
    const newIndex = (currentImageIndex - 1 + allImages.length) % allImages.length
    changeImage(newIndex, e)
  }
  // const [isHovered, setIsHovered] = useState(false)

  // 使用 useMemo 優化產品選項的計算
  const productOptions = useMemo(() => {
    if (!product.options?.length) return []

    // 直接使用產品的 options 結構，並按照特定順序排序
    return product.options
      .slice() // 創建副本避免修改原始數據
      .sort((a, b) => {
        // 確保特定選項的順序：尺寸 -> 顏色 -> 其他
        const getOptionPriority = (title: string) => {
          const lowerTitle = title.toLowerCase()
          if (lowerTitle.includes('尺寸') || lowerTitle.includes('size')) return 1
          if (lowerTitle.includes('顏色') || lowerTitle.includes('color')) return 2
          return 3
        }

        const priorityA = getOptionPriority(a.title)
        const priorityB = getOptionPriority(b.title)

        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }

        // 如果優先級相同，按照創建時間排序
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeA - timeB
      })
      .map(option => ({
        title: option.title,
        values: option.values?.map(v => v.value) || []
      }))
  }, [product.options])

  // 自動選擇單一選項值
  const autoSelectSingleOptions = useMemo(() => {
    const autoSelected: SelectedOptions = {}

    productOptions.forEach(option => {
      if (option.values.length === 1) {
        autoSelected[option.title] = option.values[0]
      }
    })

    return autoSelected
  }, [productOptions])

  // 在組件載入時自動選擇單一選項值
  useEffect(() => {
    if (Object.keys(autoSelectSingleOptions).length > 0) {
      setSelectedOptions(prev => ({
        ...autoSelectSingleOptions,
        ...prev
      }))
    }
  }, [autoSelectSingleOptions])

  // 根據選擇的選項找到對應的變體
  const findVariantId = (selectedOpts: SelectedOptions): string | undefined => {
    if (!product.variants || product.variants.length === 0) {
      return undefined
    }

    // 如果商品沒有選項，直接返回第一個變體
    if (productOptions.length === 0) {
      return product.variants[0]?.id
    }

    // 檢查是否有選擇的選項
    const selectedEntries = Object.entries(selectedOpts).filter(([_, value]) => value !== null)

    // 如果沒有選擇任何選項，返回 undefined
    if (selectedEntries.length === 0) return undefined

    // 如果選項數量不完整，也返回 undefined
    if (selectedEntries.length < productOptions.length) return undefined

    // 尋找匹配的變體
    const matchedVariant = product.variants.find(variant => {
      if (!variant.options) return false

      // 檢查變體的選項是否與選擇的選項匹配
      return selectedEntries.every(([optionTitle, selectedValue]) => {
        return variant.options?.some(variantOption =>
          variantOption.option?.title === optionTitle &&
          variantOption.value === selectedValue
        )
      }) && variant.options.length === selectedEntries.length
    })

    return matchedVariant?.id
  }

  const handleOptionSelect = async (optionTitle: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionTitle]: value
    }))
  }

  const handleAddToCart = async (e?: React.MouseEvent) => {
    // 如果有傳入事件物件，則阻止預設行為
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // 防止重複點擊
    if (isAdding) {
      // console.log("⚠️ 正在添加中，忽略重複點擊")
      return
    }

    // console.log("🔍 ProductPreview 加入購物車檢查:", {
    // productTitle: product.title,
    // selectedOptions,
    // productOptions
    // })

    const variantId = findVariantId(selectedOptions)
    // console.log("🔍 找到的變體 ID:", variantId)

    if (!variantId) {
      // console.log("❌ 沒有找到匹配的變體")
      setError(t.pleaseSelectOptions)
      return
    }

    try {
      setError(null)
      setIsAdding(true)
      // console.log("🛒 ProductPreview 開始加入購物車:", {
      // variantId,
      // quantity: 1,
      // countryCode
      // })

      // 使用新的 API endpoint
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId,
          quantity: 1,
          countryCode,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '加入購物車失敗')
      }

      // console.log("✅ ProductPreview 成功加入購物車:", result)

      // 如果 API 回傳 cartId，也在前端設定
      if (result.cartId && typeof window !== 'undefined') {
        localStorage.setItem('_medusa_cart_id', result.cartId)
        document.cookie = `_medusa_cart_id=${result.cartId}; max-age=${60 * 60 * 24 * 7}; path=/; samesite=lax`
        // console.log("📱 前端儲存 Cart ID:", result.cartId)
      }

      setError(null)
      // 觸發購物車更新事件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdate'))
      }
      setAddedToCart(true)
    } catch (error) {
      // console.error("❌ ProductPreview 添加到購物車失敗:", error)
      setError(t.failedToAddToCart)
    } finally {
      setIsAdding(false)
    }
  }

  // 手機版按鈕點擊處理
  const handleMobileButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // 如果已加入購物車，跳轉到購物車頁面
    if (addedToCart) {
      router.push(`/${countryCode}/cart`)
      return
    }

    // 檢查是否需要選擇選項
    const hasMultipleOptions = productOptions.filter(option => option.values.length > 1).length > 0
    const variantId = findVariantId(selectedOptions)

    if (hasMultipleOptions && !variantId) {
      // 如果有多個選項且沒有選擇，顯示選項彈窗
      setShowMobileOptions(true)
      return
    }

    // 否則直接加入購物車
    handleAddToCart(e)
  }

  return (
    <div className={`product-preview relative group w-full border-0 shadow-none hover:shadow-none ${isFeatured ? 'featured-product-card' : ''}`}>
      {/* 成功提示彈窗 */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 animate-fade-in-down">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs">{t.addedToCart}</span>
        </div>
      )}

      {/* 手機版選項彈窗 */}
      {showMobileOptions && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center md:hidden p-4">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileOptions(false)}
          />

          {/* 彈窗內容 */}
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 animate-slide-up max-h-[70vh] overflow-y-auto shadow-2xl">
            {/* 標題區域 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.selectOptions}</h3>
              <button
                onClick={() => setShowMobileOptions(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 商品資訊 */}
            <div className="flex space-x-3 pb-4 border-b border-gray-100">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Thumbnail
                  thumbnail={allImages[0]}
                  images={allImages.map(url => ({ url }))}
                  size="square"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 text-center">{product.title}</h4>
                {cheapestPrice && (
                  <div className="mt-1">
                    <ClientPreviewPrice price={cheapestPrice} />
                  </div>
                )}
              </div>
            </div>

            {/* 選項選擇 */}
            <div className="space-y-4">
              {productOptions.filter(option => option.values.length > 1).map((option) => (
                <div key={option.title} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {option.title}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.title] === value
                      return (
                        <button
                          key={value}
                          onClick={() => handleOptionSelect(option.title, value)}
                          className={`px-3 py-2 text-sm border rounded-lg transition-colors ${isSelected
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* 加入購物車按鈕 */}
            {addedToCart ? (
              <button
                onClick={() => {
                  setShowMobileOptions(false)
                  router.push(`/${countryCode}/cart`)
                }}
                className="w-full px-4 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                {(cartTranslations[countryCode as keyof typeof cartTranslations] || cartTranslations.tw)?.goToCart || "前往購物車"}
              </button>
            ) : (
              <button
                onClick={() => {
                  const variantId = findVariantId(selectedOptions)
                  if (variantId) {
                    setShowMobileOptions(false)
                    handleAddToCart()
                  }
                }}
                disabled={isAdding || !findVariantId(selectedOptions)}
                className="w-full px-4 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
              >
                {isAdding ? t.adding :
                  productStockStatus.canPreorder ? t.preorder : t.addToCart}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative h-full flex flex-col">
        <div
          className="relative w-full pb-[133.33%] overflow-hidden bg-white"
          onMouseEnter={() => {
            // setIsHovered(true)
            // 如果有多張圖片，hover時使用淡出淡入切換到第二張圖片
            if (allImages.length > 1) {
              changeImage(1)
            }
          }}
          onMouseLeave={() => {
            // setIsHovered(false)
            // 離開hover時使用淡出淡入恢復到主圖
            changeImage(0)
          }}
        >
          {/* 商品圖片區塊 */}
          <LocalizedClientLink href={`/products/${product.handle}`} className="block absolute inset-0">
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isImageTransitioning ? 'opacity-0' : 'opacity-100'
              } ${isFeatured ? 'product-image' : ''}`}>
              <Thumbnail
                thumbnail={allImages[currentImageIndex]}
                images={allImages.map(url => ({ url }))}
                size="full"
                className="h-full w-full object-cover"
              />
            </div>

            {/* 圖片切換箭頭 - 只在有多張圖片時顯示 */}
            {allImages.length > 1 && (
              <>
                {/* 左箭頭 */}
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-40 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-label="上一張圖片"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* 右箭頭 */}
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-40 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-label="下一張圖片"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* 圖片指示器 */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`w-3 h-3 rounded-full ${index === currentImageIndex
                        ? 'bg-white scale-110'
                        : 'bg-white/50'
                        }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* 右上角庫存狀態標籤區域 */}
            <div className="absolute top-2 right-2 z-30">
              {(isProductSoldOut || productStockStatus.canPreorder) && (
                <div className={`px-2 py-1 text-xs font-semibold rounded-md
                    ${isProductSoldOut
                    ? 'bg-gray-600 text-white'
                    : 'bg-blue-600 text-white'
                  }`}>
                  {isProductSoldOut ? t.soldOut : t.preorder}
                </div>
              )}
            </div>

            {/* 售完狀態 - 只顯示反灰層 */}
            {isProductSoldOut && (
              <div className="absolute inset-0 z-20 pointer-events-none">
              </div>
            )}
          </LocalizedClientLink>

          {/* 手機版錯誤提示 */}
          {error && (
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-2 z-20">
              {error}
            </div>
          )}

          {/* 桌機版 - 選項和加入購物車區塊 (hover 顯示) */}
            <div className="hidden md:block absolute bottom-0 left-0 right-0">
              <div className="w-full bg-white/95 backdrop-blur-[2px]">
                {!isProductSoldOut && productOptions
                  .filter(option => option.values.length > 1) // 只顯示有多個選擇的選項
                  .map((option, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="text-xs text-black/60 px-2 md:px-8 py-1">
                        {option.title}
                      </div>
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: `repeat(${option.values.length}, minmax(0, 1fr))`
                        }}
                      >
                        {option.values.map((value, valueIndex) => (
                          <button
                            key={valueIndex}
                            onClick={(e) => {
                              e.preventDefault()
                              handleOptionSelect(option.title, value)
                            }}
                            className={`w-full py-3 text-sm min-h-[40px]
                            ${selectedOptions[option.title] === value
                                ? 'bg-black text-white'
                                : 'text-black'}`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                {/* 桌機版購物車按鈕 */}
                <div>
                  {addedToCart ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        router.push(`/${countryCode}/cart`)
                      }}
                      className="w-full px-4 py-3 bg-black text-white text-sm transition-colors min-h-[40px]"
                    >
                      {(cartTranslations[countryCode as keyof typeof cartTranslations] || cartTranslations.tw)?.goToCart || "前往購物車"}
                    </button>
                  ) : (
                    <button
                      onClick={isProductSoldOut ? undefined : handleAddToCart}
                      disabled={isProductSoldOut || isAdding || (productOptions.filter(option => option.values.length > 1).length > 0 && !findVariantId(selectedOptions))}
                      className="w-full px-4 py-3 border border-black text-sm hover:bg-black hover:text-white transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-200 min-h-[40px]"
                    >
                      {isProductSoldOut ? t.soldOut :
                        isAdding ? t.adding :
                        productStockStatus.canPreorder ? t.preorder : t.addToCart}
                    </button>
                  )}
                </div>
                {error && (
                  <div className="text-red-500 text-xs text-center p-2">
                    {error}
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* 商品資訊區塊 */}
        {/* 商品資訊區塊 */}
        <div className="px-3 md:px-8 py-3 mt-2 flex justify-between items-start gap-2">
          <LocalizedClientLink href={`/products/${product.handle}`} className="flex-1">
            <h3 className="text-sm md:text-xs leading-tight mb-1 text-center" data-testid="product-title">
              {product.title}
            </h3>
            {cheapestPrice && (
              <div className="mt-1 text-center">
                <ClientPreviewPrice price={cheapestPrice} />
              </div>
            )}
          </LocalizedClientLink>

            <button
              onClick={isProductSoldOut ? undefined : handleMobileButtonClick}
              disabled={isProductSoldOut || isAdding}
              className="md:hidden w-10 h-10 bg-black text-white rounded-md shadow-sm hover:bg-gray-800 transition-all duration-200 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed group/mbtn flex-shrink-0"
              aria-label={
                (() => {
                  if (isProductSoldOut) return t.soldOut
                  if (isAdding) return t.adding
                  const hasMultipleOptions = productOptions.filter(option => option.values.length > 1).length > 0
                  const variantId = findVariantId(selectedOptions)
                  if (hasMultipleOptions && !variantId) return t.selectOptions
                  return productStockStatus.canPreorder ? t.preorder : t.addToCart
                })()
              }
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : addedToCart ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2" style={{ display: 'block' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : isProductSoldOut ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  className="flex-shrink-0"
                  style={{ display: 'block' }}
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  className="flex-shrink-0"
                  style={{ display: 'block' }}
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              )}
            </button>
        </div>
      </div>
    </div>
  )
}

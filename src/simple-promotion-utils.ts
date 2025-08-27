import { HttpTypes } from "@medusajs/types"

// 簡化的促銷標籤類型
export type PromotionLabelType = 
  | 'auto-discount'      // 自動計算折扣
  | 'manual-discount'    // 手動設置折扣
  | 'promotion'          // 自定義促銷文字
  | 'campaign'           // 促銷活動
  | 'discount-code'      // 折扣碼提示
  | 'new'                // 新品
  | 'hot'                // 熱銷
  | 'limited'            // 限量
  | 'bestseller'         // 暢銷
  | 'featured'           // 精選
  | 'sale'               // 特價
  | 'special-event'      // 特殊活動
  | 'preorder'           // 預訂
  | 'sold-out'           // 售完
  | 'bundle'             // 組合優惠
  | 'buy-x-get-y'        // 買X送Y
  | 'flash-sale'         // 限時搶購
  | 'clearance'          // 清倉
  | 'exclusive'          // 獨家

export interface PromotionLabel {
  type: PromotionLabelType
  text: string
  priority: number
  className: string
  isDiscount?: boolean
}

// 標籤優先級配置
const LABEL_PRIORITIES: Record<PromotionLabelType, number> = {
  'auto-discount': 1,
  'manual-discount': 2,
  'promotion': 3,
  'campaign': 4,
  'discount-code': 5,
  'new': 10,
  'hot': 11,
  'limited': 12,
  'bestseller': 13,
  'featured': 14,
  'sale': 15,
  'special-event': 16,
  'preorder': 17,
  'sold-out': 18,
  'bundle': 19,
  'buy-x-get-y': 6,    // 買X送Y 標籤優先級較高
  'flash-sale': 20,
  'clearance': 21,
  'exclusive': 22
}

/**
 * 只從 Medusa API 獲取真實的促銷折扣標籤
 */
export async function getActivePromotionLabels(
  product: HttpTypes.StoreProduct,
  regionId: string = 'reg_01JW1S1F7GB4ZP322G2DMETETH'
): Promise<PromotionLabel[]> {
  const labels: PromotionLabel[] = []
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🧪 [${product.title}] 開始測試 Medusa API 促銷標籤`)
    }
    
    // 檢查商品變體
    const firstVariant = product.variants?.[0]
    if (!firstVariant) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚠️ [${product.title}] 商品沒有變體，跳過促銷測試`)
      }
      return labels
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 [${product.title}] 使用變體: ${firstVariant.title || firstVariant.id}`)
    }

    // 1. 創建測試購物車
    let cartResponse
    try {
      cartResponse = await fetch(`${baseUrl}/store/carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': publishableKey,
        },
        body: JSON.stringify({
          region_id: regionId
        })
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [${product.title}] 創建購物車網路錯誤:`, error)
      }
      return []
    }

    if (!cartResponse.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [${product.title}] 創建購物車失敗:`, cartResponse.status)
      }
      return labels
    }

    const cartData = await cartResponse.json()
    const cartId = cartData.cart.id
    if (process.env.NODE_ENV === 'development') {
      console.log(`🛒 [${product.title}] 購物車 ID: ${cartId}`)
    }

    // 2. 添加商品到購物車
    let addItemResponse
    try {
      addItemResponse = await fetch(`${baseUrl}/store/carts/${cartId}/line-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': publishableKey,
        },
        body: JSON.stringify({
          variant_id: firstVariant.id,
          quantity: 1
        })
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [${product.title}] 添加商品網路錯誤:`, error)
      }
      return []
    }

    if (!addItemResponse.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [${product.title}] 添加商品失敗:`, addItemResponse.status)
      }
      return labels
    }

    const cartWithItem = await addItemResponse.json()
    const cart = cartWithItem.cart
    
    // 3. 分析促銷資訊
    const originalPrice = cart.original_total || 0
    const finalPrice = cart.total || 0
    const discountTotal = cart.discount_total || 0
    const promotions = cart.promotions || []

    console.log(`💰 [${product.title}] 原價: NT$${originalPrice}, 實際: NT$${finalPrice}, 折扣: NT$${discountTotal}`)
    console.log(`🎯 [${product.title}] 促銷活動數量: ${promotions.length}`)

    // 4. 生成促銷標籤 - 避免重複標籤
    const addedLabels = new Set<string>() // 用於追蹤已添加的標籤文字
    
    if (promotions.length > 0) {
      // 分析促銷類型：根據 code 判斷是否為滿額折扣
      for (const promotion of promotions) {
        if (promotion.application_method) {
          const method = promotion.application_method
          const code = promotion.code || ''
          
          // 根據促銷 code 判斷是否為滿額折扣
          const isOrderLevel = code.toLowerCase().includes('order') || 
                              code.toLowerCase().includes('off order') ||
                              code.toLowerCase().includes('amount off') ||
                              code.toLowerCase().includes('滿額') ||
                              code.toLowerCase().includes('滿') ||
                              // 根據測試結果，包含 order 關鍵字的是滿額折扣
                              (promotion.rules && promotion.rules.some((rule: any) => 
                                rule.attribute === 'total' || rule.attribute === 'subtotal'
                              ))
          
          if (method.type === 'percentage') {
            const discountPercent = method.value
            const taiwanDiscount = (100 - discountPercent) / 10
            
            // 根據是否為訂單級別（滿額）折扣決定標籤文字
            const discountText = isOrderLevel
              ? (taiwanDiscount === Math.floor(taiwanDiscount) 
                  ? `滿額${taiwanDiscount}折` 
                  : `滿額${taiwanDiscount.toFixed(1)}折`)
              : (taiwanDiscount === Math.floor(taiwanDiscount) 
                  ? `商品${taiwanDiscount}折` 
                  : `商品${taiwanDiscount.toFixed(1)}折`)
            
            // 避免重複標籤
            if (!addedLabels.has(discountText)) {
              labels.push({
                type: isOrderLevel ? 'campaign' : 'auto-discount',
                text: discountText,
                priority: LABEL_PRIORITIES[isOrderLevel ? 'campaign' : 'auto-discount'],
                className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
                isDiscount: true
              })
              addedLabels.add(discountText)
              
              console.log(`✅ [${product.title}] 添加${isOrderLevel ? '滿額' : '商品'}百分比折扣標籤: ${discountText} (code: ${code})`)
            }
          } else if (method.type === 'fixed') {
            const discountAmount = method.value
            
            // 根據是否為訂單級別（滿額）折扣決定標籤文字
            const discountText = isOrderLevel
              ? `滿額-NT$${discountAmount}`
              : `商品-NT$${discountAmount}`
            
            // 避免重複標籤
            if (!addedLabels.has(discountText)) {
              labels.push({
                type: isOrderLevel ? 'campaign' : 'manual-discount',
                text: discountText,
                priority: LABEL_PRIORITIES[isOrderLevel ? 'campaign' : 'manual-discount'],
                className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
                isDiscount: true
              })
              addedLabels.add(discountText)
              
              console.log(`✅ [${product.title}] 添加${isOrderLevel ? '滿額' : '商品'}固定折扣標籤: ${discountText} (code: ${code})`)
            }
          }
        }
      }
    } else if (discountTotal > 0) {
      // 如果有總折扣但沒有具體促銷活動
      const discountPercent = Math.round((discountTotal / originalPrice) * 100)
      const taiwanDiscount = (100 - discountPercent) / 10
      const discountText = taiwanDiscount === Math.floor(taiwanDiscount) 
        ? `省${taiwanDiscount * 10}%` 
        : `省${(taiwanDiscount * 10).toFixed(1)}%`
      
      if (!addedLabels.has(discountText)) {
        labels.push({
          type: 'auto-discount',
          text: discountText,
          priority: LABEL_PRIORITIES['auto-discount'],
          className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
          isDiscount: true
        })
        addedLabels.add(discountText)
        
        console.log(`✅ [${product.title}] 添加通用折扣標籤: ${discountText}`)
      }
    }

    // 從 metadata 處理各種促銷標籤
    if (product.metadata) {
      // 處理 buy_x_get_y 標籤
      if (product.metadata.buyXGetY) {
        try {
          const buyXGetY = typeof product.metadata.buyXGetY === 'string' 
            ? JSON.parse(product.metadata.buyXGetY)
            : product.metadata.buyXGetY

          if (buyXGetY && typeof buyXGetY === 'object') {
            const freeItem = buyXGetY.free_item || buyXGetY.get_item || '贈品'
            const labelText = `送${freeItem}`
            
            if (!addedLabels.has(labelText)) {
              labels.push({
                type: 'buy-x-get-y',
                text: labelText,
                priority: LABEL_PRIORITIES['buy-x-get-y'],
                className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
                isDiscount: false
              })
              addedLabels.add(labelText)
              console.log(`✅ [${product.title}] 添加買X送Y標籤: ${labelText}`)
            }
          }
        } catch (error) {
          console.warn(`⚠️ [${product.title}] buyXGetY metadata 解析失敗:`, error)
        }
      }

      // 處理其他 metadata 促銷標籤
      const metadataLabels = [
        { key: 'promotion_text', type: 'promotion' as PromotionLabelType },
        { key: 'campaign_text', type: 'campaign' as PromotionLabelType },
        { key: 'special_event', type: 'special-event' as PromotionLabelType },
        { key: 'bundle_text', type: 'bundle' as PromotionLabelType },
        { key: 'flash_sale', type: 'flash-sale' as PromotionLabelType },
        { key: 'clearance', type: 'clearance' as PromotionLabelType },
        { key: 'exclusive', type: 'exclusive' as PromotionLabelType }
      ]

      for (const { key, type } of metadataLabels) {
        if (product.metadata[key]) {
          const labelText = String(product.metadata[key])
          
          if (!addedLabels.has(labelText)) {
            labels.push({
              type,
              text: labelText,
              priority: LABEL_PRIORITIES[type],
              className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
              isDiscount: false
            })
            addedLabels.add(labelText)
            console.log(`✅ [${product.title}] 添加 metadata 標籤 (${type}): ${labelText}`)
          }
        }
      }
    }

    // 從 tags 處理促銷標籤
    if (product.tags && product.tags.length > 0) {
      const tagLabels = [
        { value: 'new', type: 'new' as PromotionLabelType, text: '新品' },
        { value: 'hot', type: 'hot' as PromotionLabelType, text: '熱銷' },
        { value: 'limited', type: 'limited' as PromotionLabelType, text: '限量' },
        { value: 'bestseller', type: 'bestseller' as PromotionLabelType, text: '暢銷' },
        { value: 'featured', type: 'featured' as PromotionLabelType, text: '精選' },
        { value: 'sale', type: 'sale' as PromotionLabelType, text: '特價' },
        { value: 'preorder', type: 'preorder' as PromotionLabelType, text: '預訂' },
        { value: 'sold-out', type: 'sold-out' as PromotionLabelType, text: '售完' }
      ]

      for (const tag of product.tags) {
        const tagValue = tag.value?.toLowerCase()
        const matchedLabel = tagLabels.find(label => label.value === tagValue)
        
        if (matchedLabel && !addedLabels.has(matchedLabel.text)) {
          labels.push({
            type: matchedLabel.type,
            text: matchedLabel.text,
            priority: LABEL_PRIORITIES[matchedLabel.type],
            className: 'inline-block bg-stone-800/90 text-white px-2 py-1 shadow-sm text-xs font-medium tracking-widest uppercase whitespace-nowrap w-auto',
            isDiscount: false
          })
          addedLabels.add(matchedLabel.text)
          console.log(`✅ [${product.title}] 添加 tag 標籤 (${matchedLabel.type}): ${matchedLabel.text}`)
        }
      }
    }

    // 5. 清理測試購物車
    try {
      const deleteResponse = await fetch(`${baseUrl}/store/carts/${cartId}`, {
        method: 'DELETE',
        headers: {
          'x-publishable-api-key': publishableKey,
        },
      })
      
      if (deleteResponse.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🗑️ [${product.title}] 清理購物車完成`)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ [${product.title}] 清理購物車失敗 (status: ${deleteResponse.status})`)
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ [${product.title}] 清理購物車失敗:`, error)
      }
    }

    console.log(`📋 [${product.title}] 最終標籤數量: ${labels.length}`)
    labels.forEach((label, index) => {
      console.log(`   ${index + 1}. ${label.text} (${label.type})`)
    })

    return labels.sort((a, b) => a.priority - b.priority)

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ [${product.title}] Medusa API 調用失敗:`, error)
    }
    return labels
  }
}

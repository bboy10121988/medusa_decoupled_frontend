import { sdk } from "@lib/config"
import { NextRequest, NextResponse } from "next/server"

/**
 * 獲取商品的促銷資訊
 * GET /api/products/promotions?productId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // 獲取所有可用的促銷活動
    // const promotionsResponse = await sdk.store.promotion.list({
    //   is_automatic: true,
    //   // 可以添加其他篩選條件
    // })

    // const promotions = promotionsResponse.promotions || []
    const promotions: any[] = []
    
    // 篩選適用於該商品的促銷
    const productPromotions = promotions.filter((promotion: any) => {
      // 檢查促銷規則是否適用於該商品
      if (!promotion.rules?.length) return true // 如果沒有特定規則，則適用於所有商品
      
      return promotion.rules.some((rule: any) => {
        // 檢查規則類型和值
        if (rule.attribute === 'product.id' && rule.values?.includes(productId)) {
          return true
        }
        // 可以添加更多規則檢查邏輯
        return false
      })
    })

    // 格式化促銷資訊以供前端使用
    const formattedPromotions = productPromotions.map((promotion: any) => ({
      id: promotion.id,
      code: promotion.code,
      type: promotion.application_method?.type, // 'percentage' | 'fixed'
      value: promotion.application_method?.value,
      currency_code: promotion.application_method?.currency_code,
      is_automatic: promotion.is_automatic,
      starts_at: promotion.starts_at,
      ends_at: promotion.ends_at,
    }))

    return NextResponse.json({
      promotions: formattedPromotions,
      count: formattedPromotions.length
    })

  } catch (error) {
    // console.error("Error fetching product promotions:", error)
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    )
  }
}

/**
 * 獲取商品在購物車中的實際折扣資訊
 * POST /api/products/promotions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, variantId, quantity = 1, regionId } = body

    if (!productId || !variantId) {
      return NextResponse.json(
        { error: "Product ID and Variant ID are required" },
        { status: 400 }
      )
    }

    // 創建臨時購物車來計算促銷
    const tempCart = await sdk.store.cart.create({
      region_id: regionId,
      items: [{
        variant_id: variantId,
        quantity: quantity
      }]
    })

    const cart = tempCart.cart
    const lineItem = cart.items?.[0]
    
    if (!lineItem) {
      return NextResponse.json(
        { error: "Failed to add item to cart" },
        { status: 400 }
      )
    }

    // 計算折扣
    const originalPrice = lineItem.unit_price
    const discountedPrice = lineItem.total
    const totalDiscountAmount = (originalPrice * quantity) - discountedPrice
    
    let discountPercentage = 0
    if (originalPrice > 0 && totalDiscountAmount > 0) {
      discountPercentage = Math.round((totalDiscountAmount / (originalPrice * quantity)) * 100)
    }

    // 清理臨時購物車
    // try {
    //   await sdk.store.cart.delete(cart.id)
    // } catch (deleteError) {
    //   console.warn("Failed to delete temporary cart:", deleteError)
    // }

    return NextResponse.json({
      original_price: originalPrice,
      discounted_price: discountedPrice,
      discount_amount: totalDiscountAmount,
      discount_percentage: discountPercentage,
      has_discount: totalDiscountAmount > 0,
      promotions: cart.promotions || []
    })

  } catch (error) {
    // console.error("Error calculating product discount:", error)
    return NextResponse.json(
      { error: "Failed to calculate discount" },
      { status: 500 }
    )
  }
}

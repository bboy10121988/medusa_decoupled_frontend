import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function POST(request: NextRequest) {
  try {
    const { cartId } = await request.json()

    if (!cartId) {
      return NextResponse.json({ error: '購物車ID不能為空' }, { status: 400 })
    }

    // 首先獲取購物車
    const cart = await sdk.store.cart.retrieve(cartId)
    
    if (!cart) {
      return NextResponse.json({ error: '找不到購物車' }, { status: 404 })
    }

    // 創建訂單 - 使用銀行轉帳付款方式
    try {
      const result = await sdk.store.cart.complete(cartId, {})
      
      if (result.type === "order") {
        // 訂單創建成功
        return NextResponse.json({
          success: true,
          order: {
            id: result.order.id,
            display_id: result.order.display_id,
            total: result.order.total,
            status: result.order.status,
            payment_status: result.order.payment_status
          }
        })
      } else {
        // 還是購物車，可能需要付款方式
        return NextResponse.json({ 
          error: '無法完成訂單，可能缺少付款方式',
          type: result.type
        }, { status: 400 })
      }
      
    } catch (orderError: any) {
      // console.error('創建訂單失敗:', orderError)
      return NextResponse.json({ 
        error: '創建訂單失敗，請稍後重試',
        details: orderError.message 
      }, { status: 500 })
    }

  } catch (error: any) {
    // console.error('銀行轉帳API錯誤:', error)
    return NextResponse.json({ 
      error: '服務器錯誤',
      details: error.message 
    }, { status: 500 })
  }
}

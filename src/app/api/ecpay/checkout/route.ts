// Next.js API route handler
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { retrieveCart } from '@lib/data/cart'

// 設定綠界後端 API 的 URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

export async function POST(req: NextRequest) {
  try {
    // 取得請求資料
    const { cartId, paymentMethod } = await req.json()
    
    if (!cartId) {
      return NextResponse.json(
        { error: '購物車 ID 不能為空' },
        { status: 400 }
      )
    }
    
    // 從 cookies 取得購物車 (optional，如果你已經傳入 cartId)
    const cartCookie = (await cookies()).get('_medusa_cart_id')?.value
    const id = cartId || cartCookie
    
    if (!id) {
      return NextResponse.json(
        { error: '無法找到購物車' },
        { status: 400 }
      )
    }
    
    // 取得購物車詳細資料
    const cart = await retrieveCart(id)
    
    if (!cart) {
      return NextResponse.json(
        { error: '購物車不存在' },
        { status: 404 }
      )
    }
    
    // 準備發送到後端的資料
    const ecpayPaymentData = {
      MerchantTradeNo: `${id.substring(0, 8)}${Date.now()}`,
      TotalAmount: cart.total?.toString() || "0",
      TradeDesc: `訂單 ${id}`,
      ItemName: cart.items?.map((item: { title: string; quantity: number }) => 
        `${item.title} x ${item.quantity}`
      ).join('#') || '商品',
      CustomField1: id, // 用於儲存購物車 ID
      ClientBackURL: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkout/confirmation?cart_id=${id}`,
      // 根據支付方式設定不同參數
      ChoosePayment: paymentMethod === 'ecpay_credit_card' ? 'Credit' : 'ALL',
    }
    
    // 呼叫後端 API 建立付款
    const response = await fetch(`${BACKEND_API_URL}/ecpay/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ecpayPaymentData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || '建立付款時發生錯誤' },
        { status: response.status }
      )
    }
    
    // 取得後端回應
    const data = await response.json()
    
    // 回傳綠界付款表單 HTML
    return NextResponse.json({
      htmlForm: data.html,
      success: true,
    })
    
  } catch (error: any) {
    console.error('處理綠界付款請求時發生錯誤:', error)
    return NextResponse.json(
      { error: error.message || '處理付款時發生錯誤' },
      { status: 500 }
    )
  }
}

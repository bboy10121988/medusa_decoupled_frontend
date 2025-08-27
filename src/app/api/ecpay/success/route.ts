import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orderId = searchParams.get('order_id')
  const merchantTradeNo = searchParams.get('merchant_trade_no')
  
  console.log('🎉 ECPay payment success callback received:', {
    orderId,
    merchantTradeNo,
    timestamp: new Date().toISOString()
  })

  if (orderId) {
    // 重定向到訂單確認頁面
    return NextResponse.redirect(new URL(`/tw/order/${orderId}/confirmed`, request.url))
  } else if (merchantTradeNo) {
    // 如果沒有orderId但有merchantTradeNo，嘗試查詢訂單
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL
      const response = await fetch(`${backendUrl}/store/orders/by-merchant-trade-no/${merchantTradeNo}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.order?.id) {
          return NextResponse.redirect(new URL(`/tw/order/${data.order.id}/confirmed`, request.url))
        }
      }
    } catch (error) {
      console.error('Error fetching order by merchant trade no:', error)
    }
  }

  // 如果找不到訂單，重定向到首頁或錯誤頁面
  return NextResponse.redirect(new URL('/tw?payment_success=true', request.url))
}

export async function POST(request: NextRequest) {
  // 也處理POST請求，以防ECPay使用POST
  return GET(request)
}

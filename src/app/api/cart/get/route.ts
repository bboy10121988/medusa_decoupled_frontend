import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🛒 Get Cart API called')
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    // 從 cookie 獲取購物車 ID
    const cartId = request.cookies.get('_medusa_cart_id')?.value
    
    if (!cartId) {
      console.log('❌ No cart ID found in cookies')
      return NextResponse.json({ cart: null })
    }

    console.log('🔍 Found cart ID:', cartId)

    // 獲取購物車資料
    const response = await fetch(`${baseUrl}/store/carts/${cartId}?fields=*items,*region,*items.product,*items.variant,*items.variant.options,*items.variant.options.option,*items.thumbnail,*items.metadata,+items.total,*promotions,+shipping_methods.name`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || ''
      }
    })

    if (!response.ok) {
      console.log('❌ Cart not found or error:', response.status)
      return NextResponse.json({ cart: null })
    }

    const cartData = await response.json()
    console.log('✅ Cart data retrieved successfully')
    
    return NextResponse.json({ cart: cartData.cart })
    
  } catch (error) {
    console.error('❌ Get Cart API error:', error)
    return NextResponse.json({ cart: null })
  }
}

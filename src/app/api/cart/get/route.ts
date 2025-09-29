import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') console.log('🛒 Get Cart API called')
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || (process.env.NEXT_PUBLIC_ENV_MODE === 'local' ? 'http://localhost:9000' : 'https://timsfantasyworld.com')
    const { getPublishableKeyForBackend } = await import('@lib/medusa-publishable-key')
    const publishableKey = getPublishableKeyForBackend(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)

    // 從 cookie 獲取購物車 ID
    const cartId = request.cookies.get('_medusa_cart_id')?.value
    
    if (!cartId) {
      if (process.env.NODE_ENV === 'development') console.log('❌ No cart ID found in cookies')
      return NextResponse.json({ cart: null })
    }

    if (process.env.NODE_ENV === 'development') console.log('🔍 Found cart ID:', cartId)

    // 獲取購物車資料
    const response = await fetch(`${baseUrl}/carts/${cartId}?fields=*items,*region,*items.product,*items.variant,*items.variant.options,*items.variant.options.option,*items.thumbnail,*items.metadata,+items.total,*promotions,+shipping_methods.name`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || ''
      }
    })

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') console.log('❌ Cart not found or error:', response.status)
      return NextResponse.json({ cart: null })
    }

    const cartData = await response.json()
    if (process.env.NODE_ENV === 'development') console.log('✅ Cart data retrieved successfully')
    
    return NextResponse.json({ cart: cartData.cart })
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('❌ Get Cart API error:', error)
    return NextResponse.json({ cart: null })
  }
}

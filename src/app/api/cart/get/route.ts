import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // if (process.env.NODE_ENV === 'development') console.log('🛒 Get Cart API called')
  
  try {
    // 使用與 retrieveCart 相同的邏輯，確保認證一致
    const { retrieveCart } = await import('@lib/data/cart')
    
    const cart = await retrieveCart()
    
    if (process.env.NODE_ENV === 'development') {
      if (cart) {
        // console.log('✅ Cart data retrieved successfully via SDK')
      } else {
        // console.log('ℹ️ No cart found (this is normal for new users)')
      }
    }
    
    return NextResponse.json({ cart })
    
  } catch (error) {
    // if (process.env.NODE_ENV === 'development') console.error('❌ Get Cart API error:', error)
    return NextResponse.json({ cart: null })
  }
}

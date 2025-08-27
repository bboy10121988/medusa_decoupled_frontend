import { NextRequest, NextResponse } from 'next/server'
import { getCartId, getAuthHeaders, getCacheTag } from '@lib/data/cookies'
import { revalidateTag } from 'next/cache'
import { sdk } from '@lib/config'

export async function POST(request: NextRequest) {
  try {
    const cartId = await getCartId()
    
    if (!cartId) {
      return NextResponse.json({ message: 'No cart to transfer' })
    }
    
    const headers = await getAuthHeaders()
    
    if (!headers) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    await sdk.store.cart.transferCart(cartId, {}, headers)
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('購物車轉移錯誤:', error)
    return NextResponse.json({ error: 'Failed to transfer cart' }, { status: 500 })
  }
}

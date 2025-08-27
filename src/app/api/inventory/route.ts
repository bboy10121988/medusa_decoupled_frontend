import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const variantId = searchParams.get('variant_id')
  
  if (!variantId) {
    return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 })
  }

  try {
    // TODO: 實作實際的庫存檢查
    // 目前返回基本的庫存資訊，表示商品可用
    
    return NextResponse.json({
      available_quantity: 0, // TODO: 從 Medusa Admin API 獲取實際庫存
      reserved_quantity: 0,
      stocked_quantity: 0
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

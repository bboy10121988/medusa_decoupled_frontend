import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@lib/config'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json({ error: '缺少訂單 ID' }, { status: 400 })
    }

    // console.log('🔍 獲取訂單詳情:', orderId)

    // 使用 Medusa SDK 獲取訂單詳情
    const orderResponse = await sdk.store.order.retrieve(orderId)

    if (!orderResponse?.order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 })
    }

    // console.log('✅ 成功獲取訂單詳情:', orderResponse.order.id)

    return NextResponse.json({
      order: orderResponse.order
    })

  } catch (error: any) {
    // console.error('❌ 獲取訂單詳情失敗:', error)
    
    // 處理不同類型的錯誤
    if (error?.response?.status === 404) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 })
    }
    
    if (error?.response?.status === 401) {
      return NextResponse.json({ error: '未授權訪問' }, { status: 401 })
    }

    return NextResponse.json({ 
      error: '獲取訂單詳情失敗',
      details: error.message || String(error)
    }, { status: 500 })
  }
}
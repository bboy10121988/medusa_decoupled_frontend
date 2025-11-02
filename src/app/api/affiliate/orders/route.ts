import { NextResponse } from 'next/server'
import { retrieveAffiliate } from '../../../../lib/data/affiliate-auth'
import { getAllStats } from '../../../../lib/data/affiliate-stats'

// 訂單類型定義
type AffiliateOrder = {
  id: string
  clickId: string
  linkId: string
  linkName: string
  orderValue: number
  commission: number
  customerEmail?: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export async function GET() {
  try {
    const session = await retrieveAffiliate()
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    // 獲取統計資料中的轉換記錄
    const stats = await getAllStats()
    
    // 獲取聯盟連結資料（用於獲取連結名稱）
    const linkNames: { [linkId: string]: string } = {}
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/affiliate/links`, {
        headers: {
          'Cookie': `_affiliate_jwt=${Buffer.from(JSON.stringify(session)).toString('base64')}`
        }
      })
      if (response.ok) {
        const linksData = await response.json()
        const links = linksData?.links || []
        links.forEach((link: any) => {
          linkNames[link.id] = link.name
        })
      }
    } catch (error) {
      // console.warn('無法獲取連結資料:', error)
    }
    
    // 篩選該聯盟夥伴的已轉換點擊記錄
    const affiliateClicks = stats.clicks.filter(
      (click: any) => click.affiliateId === session.id && click.converted && click.conversionValue
    )

    // 生成訂單資料
    const orders: AffiliateOrder[] = affiliateClicks.map((click: any) => ({
      id: `order_${click.id}`,
      clickId: click.id,
      linkId: click.linkId,
      linkName: linkNames[click.linkId] || `連結 ${click.linkId}`,
      orderValue: click.conversionValue || 0,
      commission: (click.conversionValue || 0) * 0.1, // 10% 佣金
      customerEmail: click.customerEmail || '',
      createdAt: click.timestamp,
      status: 'confirmed' as const,
    }))

    // 按日期倒序排列
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const summary = {
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, order) => sum + order.orderValue, 0),
      totalCommission: orders.reduce((sum, order) => sum + order.commission, 0),
      pendingCommission: orders
        .filter(order => order.status === 'pending')
        .reduce((sum, order) => sum + order.commission, 0),
    }

    return NextResponse.json({
      summary,
      orders: orders.slice(0, 20), // 最近 20 筆訂單
    })

  } catch (error) {
    // console.error('獲取聯盟訂單失敗:', error)
    return NextResponse.json({ 
      summary: {
        totalOrders: 0,
        totalValue: 0,
        totalCommission: 0,
        pendingCommission: 0,
      },
      orders: []
    })
  }
}

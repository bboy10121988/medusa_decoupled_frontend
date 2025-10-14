import { NextResponse } from 'next/server'
import { getAffiliateStats } from '../../../../lib/data/affiliate-stats'
import { retrieveAffiliate } from '../../../../lib/data/affiliate-auth'

export async function GET(request: Request) {
  try {
    // 獲取聯盟會員會話
    const session = await retrieveAffiliate()
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    // 從 URL 參數獲取天數
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7', 10)

    // 獲取真實統計資料
    const stats = await getAffiliateStats(session.id, days)
    
    // 確保資料結構完整
    const safeStats = {
      period: stats.period || `最近 ${days} 天`,
      totalClicks: stats.totalClicks || 0,
      totalConversions: stats.totalConversions || 0,
      totalRevenue: stats.totalRevenue || 0,
      totalCommission: stats.totalCommission || 0,
      trend: stats.trend || [],
      linkStats: stats.linkStats || {},
    }
    
    return NextResponse.json(safeStats)
  } catch (error) {
    console.error('獲取統計資料失敗:', error)
    
    // 返回空資料結構而不是錯誤
    const fallbackStats = {
      period: '最近 7 天',
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalCommission: 0,
      trend: [],
      linkStats: {},
    }
    
    return NextResponse.json(fallbackStats)
  }
}

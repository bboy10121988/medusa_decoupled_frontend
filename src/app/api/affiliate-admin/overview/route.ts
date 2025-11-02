import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// 類型定義
interface AffiliateStats {
  affiliateStats: Record<string, any>
}

interface AffiliateSettlements {
  settlements: any[]
}

interface AffiliateSettings {
  settings: Record<string, any>
}

interface RecentActivity {
  id: string
  type: string
  affiliateId: string
  description: string
  timestamp: string
  amount?: number
}

const dataDir = path.join(process.cwd(), 'data')
const statsPath = path.join(dataDir, 'affiliate-stats.json')
const settlementsPath = path.join(dataDir, 'affiliate-settlements.json')
const settingsPath = path.join(dataDir, 'affiliate-settings.json')

export async function GET(request: Request) {
  try {
    // 讀取統計數據
    let stats: AffiliateStats = { affiliateStats: {} }
    if (fs.existsSync(statsPath)) {
      const statsContent = fs.readFileSync(statsPath, 'utf8')
      stats = JSON.parse(statsContent)
    }

    // 讀取結算數據
    let settlements: AffiliateSettlements = { settlements: [] }
    if (fs.existsSync(settlementsPath)) {
      const settlementsContent = fs.readFileSync(settlementsPath, 'utf8')
      settlements = JSON.parse(settlementsContent)
    }

    // 讀取設定數據
    let settings: AffiliateSettings = { settings: {} }
    if (fs.existsSync(settingsPath)) {
      const settingsContent = fs.readFileSync(settingsPath, 'utf8')
      settings = JSON.parse(settingsContent)
    }

    // 計算統計摘要
    const affiliateIds = Object.keys(stats.affiliateStats || {})
    const totalAffiliates = affiliateIds.length
    const activeAffiliates = affiliateIds.filter(id => {
      const affiliateStats = (stats.affiliateStats as Record<string, any>)?.[id]
      return affiliateStats?.orders?.length > 0
    }).length
    const pendingAffiliates = 0 // 需要實際的申請系統

    // 計算本月數據
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    let thisMonthOrders = 0
    let thisMonthRevenue = 0
    let totalCommission = 0
    let totalSettled = 0
    let pendingSettlement = 0

    affiliateIds.forEach(affiliateId => {
      const affiliateStats = stats.affiliateStats[affiliateId]
      if (!affiliateStats?.orders) return

      affiliateStats.orders.forEach((order: any) => {
        const orderDate = new Date(order.date)
        if (orderDate >= thisMonthStart) {
          thisMonthOrders++
          thisMonthRevenue += order.orderValue
        }
        totalCommission += order.commission
      })
    })

    // 計算已結算金額
    settlements.settlements.forEach((settlement: any) => {
      if (settlement.status === 'completed') {
        totalSettled += settlement.amount
      } else {
        pendingSettlement += settlement.amount
      }
    })

    // 生成最近活動
    const recentActivities: RecentActivity[] = []
    let activityId = 1

    // 從訂單中生成活動
    affiliateIds.forEach(affiliateId => {
      const affiliateStats = stats.affiliateStats[affiliateId]
      if (!affiliateStats?.orders) return

      affiliateStats.orders.slice(-3).forEach((order: any) => {
        recentActivities.push({
          id: `act_${activityId++}`,
          type: 'order' as const,
          description: `新訂單 #${order.orderId}`,
          amount: order.commission,
          timestamp: order.date,
          affiliateId: affiliateId
        })
      })
    })

    // 從結算中生成活動
    settlements.settlements.slice(-2).forEach((settlement: any) => {
      recentActivities.push({
        id: `act_${activityId++}`,
        type: 'settlement' as const,
        description: `結算處理 - ${settlement.status === 'completed' ? '已完成' : '待處理'}`,
        amount: settlement.amount,
        timestamp: settlement.createdAt,
        affiliateId: settlement.affiliateId
      })
    })

    // 按時間排序，取最新5個
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // 計算頂級聯盟商
    const topAffiliates = affiliateIds.map(affiliateId => {
      const affiliateStats = stats.affiliateStats[affiliateId]
      const affiliateSettings = settings.settings[affiliateId]
      
      let orders = 0
      let revenue = 0
      let commission = 0

      if (affiliateStats?.orders) {
        orders = affiliateStats.orders.length
        revenue = affiliateStats.orders.reduce((sum: number, order: any) => sum + order.orderValue, 0)
        commission = affiliateStats.orders.reduce((sum: number, order: any) => sum + order.commission, 0)
      }

      return {
        id: affiliateId,
        name: affiliateSettings?.profile?.displayName || affiliateSettings?.profile?.email || affiliateId,
        orders,
        revenue,
        commission
      }
    }).sort((a, b) => b.commission - a.commission)

    const adminOverviewData = {
      summary: {
        totalAffiliates,
        activeAffiliates,
        pendingAffiliates,
        totalCommission,
        totalSettled,
        pendingSettlement,
        thisMonthOrders,
        thisMonthRevenue
      },
      recentActivities: recentActivities.slice(0, 5),
      topAffiliates: topAffiliates.slice(0, 5)
    }

    return NextResponse.json(adminOverviewData)
  } catch (error) {
    // console.error('管理總覽API錯誤:', error)
    return NextResponse.json(
      { error: '無法獲取管理總覽數據' },
      { status: 500 }
    )
  }
}

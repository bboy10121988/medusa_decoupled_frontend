import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const statsPath = path.join(dataDir, 'affiliate-stats.json')
const settingsPath = path.join(dataDir, 'affiliate-settings.json')

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '30d'

    // 計算日期範圍
    const now = new Date()
    let startDate: Date
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // 讀取統計數據
    let stats = { affiliateStats: {} }
    if (fs.existsSync(statsPath)) {
      const statsContent = fs.readFileSync(statsPath, 'utf8')
      stats = JSON.parse(statsContent)
    }

    // 讀取設置數據
    let settings = { settings: {} }
    if (fs.existsSync(settingsPath)) {
      const settingsContent = fs.readFileSync(settingsPath, 'utf8')
      settings = JSON.parse(settingsContent)
    }

    // 收集所有在時間範圍內的訂單
    const allOrders: any[] = []
    const affiliatePerformance: { [key: string]: any } = {}
    const productPerformance: { [key: string]: any } = {}

    Object.keys(stats.affiliateStats).forEach(affiliateId => {
      const affiliateStats = stats.affiliateStats[affiliateId]
      const affiliateSettings = settings.settings[affiliateId] || {}
      
      if (!affiliateStats?.orders) return

      const filteredOrders = affiliateStats.orders.filter((order: any) => {
        const orderDate = new Date(order.date)
        return orderDate >= startDate && orderDate <= now
      })

      allOrders.push(...filteredOrders)

      if (filteredOrders.length > 0) {
        const totalRevenue = filteredOrders.reduce((sum: number, order: any) => sum + order.orderValue, 0)
        const totalCommission = filteredOrders.reduce((sum: number, order: any) => sum + order.commission, 0)
        
        affiliatePerformance[affiliateId] = {
          id: affiliateId,
          name: affiliateSettings.profile?.displayName || affiliateSettings.profile?.email || affiliateId,
          revenue: totalRevenue,
          orders: filteredOrders.length,
          commission: totalCommission,
          conversionRate: 0.05 // 模擬轉換率
        }
      }

      // 統計產品表現
      filteredOrders.forEach((order: any) => {
        const productId = order.productId || 'unknown'
        if (!productPerformance[productId]) {
          productPerformance[productId] = {
            productId,
            productName: order.productName || `產品 ${productId}`,
            orders: 0,
            revenue: 0
          }
        }
        productPerformance[productId].orders += 1
        productPerformance[productId].revenue += order.orderValue
      })
    })

    // 計算總覽數據
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.orderValue, 0)
    const totalCommission = allOrders.reduce((sum, order) => sum + order.commission, 0)
    const totalOrders = allOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const conversionRate = 0.05 // 模擬轉換率

    // 找出頂級聯盟商
    const topAffiliates = Object.values(affiliatePerformance)
      .sort((a: any, b: any) => b.commission - a.commission)

    const topPerformingAffiliate = topAffiliates.length > 0 
      ? (topAffiliates[0] as any).name 
      : '暫無'

    // 生成趨勢數據
    const trends = []
    const daysToShow = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.date)
        return orderDate.toDateString() === date.toDateString()
      })
      
      trends.push({
        date: date.toISOString(),
        revenue: dayOrders.reduce((sum, order) => sum + order.orderValue, 0),
        orders: dayOrders.length,
        commission: dayOrders.reduce((sum, order) => sum + order.commission, 0)
      })
    }

    const analyticsData = {
      overview: {
        totalRevenue,
        totalCommission,
        totalOrders,
        averageOrderValue,
        conversionRate,
        topPerformingAffiliate
      },
      trends,
      topAffiliates: topAffiliates.slice(0, 10),
      topProducts: Object.values(productPerformance)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10)
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('獲取分析數據錯誤:', error)
    return NextResponse.json(
      { error: '無法獲取分析數據' },
      { status: 500 }
    )
  }
}

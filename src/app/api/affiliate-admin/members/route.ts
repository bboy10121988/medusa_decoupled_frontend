import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const statsPath = path.join(dataDir, 'affiliate-stats.json')
const settingsPath = path.join(dataDir, 'affiliate-settings.json')

export async function GET() {
  try {
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

    // 合併會員數據
    const members = Object.keys(settings.settings).map(affiliateId => {
      const affiliateSettings = settings.settings[affiliateId] || {}
      const affiliateStats = stats.affiliateStats[affiliateId] || { orders: [] }
      
      // 計算統計資料
      const orders = affiliateStats.orders || []
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.orderValue || 0), 0)
      const totalCommission = orders.reduce((sum: number, order: any) => sum + (order.commission || 0), 0)
      
      // 獲取最後活動時間
      const lastOrderDate = orders.length > 0 
        ? Math.max(...orders.map((order: any) => new Date(order.date).getTime()))
        : new Date(affiliateSettings.createdAt || Date.now()).getTime()

      return {
        id: affiliateId,
        email: affiliateSettings.profile?.email || affiliateId,
        displayName: affiliateSettings.profile?.displayName || '',
        status: affiliateSettings.status || 'active', // 默認為活躍
        totalOrders,
        totalRevenue,
        totalCommission,
        registeredAt: affiliateSettings.createdAt || new Date().toISOString(),
        lastActive: new Date(lastOrderDate).toISOString()
      }
    })

    // 按註冊時間排序
    members.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())

    return NextResponse.json({ members })
  } catch (error) {
    console.error('獲取會員列表錯誤:', error)
    return NextResponse.json(
      { error: '無法獲取會員列表' },
      { status: 500 }
    )
  }
}

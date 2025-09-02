import { promises as fs } from 'fs'
import path from 'path'
import type { AffiliateStatPoint, AffiliateStatsSummary } from '../../types/affiliate'

const STATS_FILE = path.join(process.cwd(), 'affiliate-stats.json')

export interface ClickRecord {
  id: string
  affiliateId: string
  linkId: string
  timestamp: string
  ip?: string
  userAgent?: string
  referrer?: string
  converted?: boolean
  conversionValue?: number
  conversionTimestamp?: string
}

export interface AffiliateStatsData {
  clicks: ClickRecord[]
  lastUpdated: string
}

// 確保統計檔案存在
async function ensureStatsFile(): Promise<AffiliateStatsData> {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // 檔案不存在，創建初始資料
    const initialData: AffiliateStatsData = {
      clicks: [],
      lastUpdated: new Date().toISOString(),
    }
    await fs.writeFile(STATS_FILE, JSON.stringify(initialData, null, 2))
    return initialData
  }
}

// 儲存統計資料
async function saveStatsData(data: AffiliateStatsData): Promise<void> {
  data.lastUpdated = new Date().toISOString()
  await fs.writeFile(STATS_FILE, JSON.stringify(data, null, 2))
}

// 記錄點擊
export async function recordClick(
  affiliateId: string,
  linkId: string,
  ip?: string,
  userAgent?: string,
  referrer?: string
): Promise<string> {
  const stats = await ensureStatsFile()
  
  const clickId = `clk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const clickRecord: ClickRecord = {
    id: clickId,
    affiliateId,
    linkId,
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
    referrer,
    converted: false,
  }
  
  stats.clicks.push(clickRecord)
  await saveStatsData(stats)
  
  // 同時更新連結系統中的點擊數
  await updateLinkClickCount(linkId, affiliateId)
  
  console.log(`📊 記錄點擊: ${affiliateId} -> ${linkId}`)
  return clickId
}

// 更新連結點擊數（與連結系統整合）
async function updateLinkClickCount(linkId: string, affiliateId: string): Promise<void> {
  try {
    // 這裡可以調用連結 API 更新點擊數
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/affiliate/links/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ linkId, affiliateId })
    })
    
    if (!response.ok) {
      console.warn(`更新連結 ${linkId} 點擊數失敗`)
    }
  } catch (error) {
    console.warn('更新連結點擊數時發生錯誤:', error)
  }
}

// 記錄轉換
export async function recordConversion(
  clickId: string,
  conversionValue: number
): Promise<boolean> {
  const stats = await ensureStatsFile()
  
  const clickRecord = stats.clicks.find(click => click.id === clickId)
  if (!clickRecord) {
    console.error('找不到點擊記錄:', clickId)
    return false
  }
  
  clickRecord.converted = true
  clickRecord.conversionValue = conversionValue
  clickRecord.conversionTimestamp = new Date().toISOString()
  
  await saveStatsData(stats)
  
  console.log(`💰 記錄轉換: ${clickRecord.affiliateId} -> $${conversionValue}`)
  return true
}

// 獲取聯盟夥伴統計資料
export async function getAffiliateStats(
  affiliateId: string,
  days: number = 7
): Promise<AffiliateStatsSummary & { linkStats: { [linkId: string]: { clicks: number, conversions: number, revenue: number, commission: number } } }> {
  const stats = await ensureStatsFile()
  
  // 篩選指定聯盟夥伴的資料
  const affiliateClicks = stats.clicks.filter(click => click.affiliateId === affiliateId)
  
  // 計算日期範圍
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  
  // 篩選日期範圍內的資料
  const periodClicks = affiliateClicks.filter(click => {
    const clickDate = new Date(click.timestamp)
    return clickDate >= startDate && clickDate <= endDate
  })
  
  // 按日期分組統計
  const dailyStats = new Map<string, AffiliateStatPoint>()
  
  // 按連結分組統計
  const linkStats: { [linkId: string]: { clicks: number, conversions: number, revenue: number, commission: number } } = {}
  
  // 初始化每一天的資料
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const dateKey = date.toISOString().slice(0, 10)
    dailyStats.set(dateKey, {
      date: dateKey,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      commission: 0,
    })
  }
  
  // 統計實際資料
  periodClicks.forEach(click => {
    const dateKey = click.timestamp.slice(0, 10)
    const dayStats = dailyStats.get(dateKey)
    
    // 初始化連結統計
    if (!linkStats[click.linkId]) {
      linkStats[click.linkId] = {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        commission: 0
      }
    }
    
    if (dayStats) {
      dayStats.clicks += 1
      linkStats[click.linkId].clicks += 1
      
      if (click.converted && click.conversionValue) {
        const revenue = click.conversionValue
        const commission = revenue * 0.1 // 假設 10% 佣金率
        
        dayStats.conversions += 1
        dayStats.revenue += revenue
        dayStats.commission += commission
        
        linkStats[click.linkId].conversions += 1
        linkStats[click.linkId].revenue += revenue
        linkStats[click.linkId].commission += commission
      }
    }
  })
  
  const trend = Array.from(dailyStats.values()).sort((a, b) => a.date.localeCompare(b.date))
  
  return {
    period: `最近 ${days} 天`,
    totalClicks: trend.reduce((sum, day) => sum + day.clicks, 0),
    totalConversions: trend.reduce((sum, day) => sum + day.conversions, 0),
    totalRevenue: Number(trend.reduce((sum, day) => sum + day.revenue, 0).toFixed(2)),
    totalCommission: Number(trend.reduce((sum, day) => sum + day.commission, 0).toFixed(2)),
    trend,
    linkStats,
  }
}

// 獲取所有統計資料（管理員用）
export async function getAllStats(): Promise<AffiliateStatsData> {
  return await ensureStatsFile()
}

// 清除統計資料
export async function clearStats(): Promise<void> {
  const initialData: AffiliateStatsData = {
    clicks: [],
    lastUpdated: new Date().toISOString(),
  }
  await saveStatsData(initialData)
  console.log('🗑️  統計資料已清除')
}

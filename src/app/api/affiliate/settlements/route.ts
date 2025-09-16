import { NextResponse } from 'next/server'
import { retrieveAffiliate } from '@lib/data/affiliate-auth'
import { promises as fs } from 'fs'
import path from 'path'

// 結算記錄型別
type SettlementRecord = {
  id: string
  affiliateId: string
  amount: number
  currency: string
  status: 'pending' | 'settled'
  settlementDate: string
  period: string // 結算期間，如 "2025-08"
  method: 'bank_transfer' | 'paypal' | 'stripe'
  reference?: string
  note?: string
}

type SettlementData = {
  settlements: SettlementRecord[]
  lastUpdated: string
}

const SETTLEMENT_FILE = path.join(process.cwd(), 'data', 'affiliate-settlements.json')

// 確保數據文件存在
async function ensureSettlementFile(): Promise<SettlementData> {
  try {
    await fs.mkdir(path.dirname(SETTLEMENT_FILE), { recursive: true })
    const data = await fs.readFile(SETTLEMENT_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    const initialData: SettlementData = {
      settlements: [],
      lastUpdated: new Date().toISOString()
    }
    await saveSettlementData(initialData)
    return initialData
  }
}

// 儲存數據
async function saveSettlementData(data: SettlementData): Promise<void> {
  data.lastUpdated = new Date().toISOString()
  await fs.writeFile(SETTLEMENT_FILE, JSON.stringify(data, null, 2))
}

// 計算結算摘要
async function calculateSettlementSummary(affiliateId: string): Promise<{
  totalEarned: number
  totalSettled: number
  pendingSettlement: number
  nextSettlementDate: string
}> {
  try {
    const { getAffiliateStats } = await import('@lib/data/affiliate-stats')
    const stats = await getAffiliateStats(affiliateId, 365) // 一年內的數據
    
    const settlementData = await ensureSettlementFile()
    const affiliateSettlements = settlementData.settlements.filter(s => s.affiliateId === affiliateId)
    
    const totalSettled = affiliateSettlements
      .filter(s => s.status === 'settled')
      .reduce((sum, s) => sum + s.amount, 0)
    
    const pendingSettlement = Math.max(0, stats.totalCommission - totalSettled)
    
    // 計算下次結算日期（每月25號）
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    
    let nextMonth = month
    let nextYear = year
    
    if (day >= 25) {
      nextMonth += 1
      if (nextMonth > 11) {
        nextMonth = 0
        nextYear += 1
      }
    }
    
    const nextSettlementDate = new Date(nextYear, nextMonth, 25).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    return {
      totalEarned: stats.totalCommission,
      totalSettled,
      pendingSettlement,
      nextSettlementDate
    }
  } catch (error) {
    console.error('計算結算摘要失敗:', error)
    return {
      totalEarned: 0,
      totalSettled: 0,
      pendingSettlement: 0,
      nextSettlementDate: '計算中...'
    }
  }
}

// GET - 獲取結算資料
export async function GET() {
  try {
    const session = await retrieveAffiliate()
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const settlementData = await ensureSettlementFile()
    const affiliateSettlements = settlementData.settlements.filter(s => s.affiliateId === session.id)
    const summary = await calculateSettlementSummary(session.id)

    return NextResponse.json({
      summary,
      settlements: affiliateSettlements.sort((a, b) => 
        new Date(b.settlementDate).getTime() - new Date(a.settlementDate).getTime()
      )
    })

  } catch (error) {
    console.error('獲取結算資料失敗:', error)
    return NextResponse.json({ error: '獲取結算資料失敗' }, { status: 500 })
  }
}

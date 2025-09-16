import { NextRequest, NextResponse } from 'next/server'
import { retrieveAffiliate } from '../../../../lib/data/affiliate-auth'
import { promises as fs } from 'fs'
import path from 'path'

// 結算記錄型別
type PayoutRecord = {
  id: string
  affiliateId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'paid' | 'failed'
  requestedAt: string
  processedAt?: string
  method: 'bank_transfer' | 'paypal' | 'stripe'
  reference?: string
  note?: string
}

type PayoutData = {
  payouts: PayoutRecord[]
  lastUpdated: string
}

const PAYOUT_FILE = path.join(process.cwd(), 'data', 'affiliate-payouts.json')

// 確保數據文件存在
async function ensurePayoutFile(): Promise<PayoutData> {
  try {
    await fs.mkdir(path.dirname(PAYOUT_FILE), { recursive: true })
    const data = await fs.readFile(PAYOUT_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    const initialData: PayoutData = {
      payouts: [],
      lastUpdated: new Date().toISOString()
    }
    await savePayoutData(initialData)
    return initialData
  }
}

// 儲存數據
async function savePayoutData(data: PayoutData): Promise<void> {
  data.lastUpdated = new Date().toISOString()
  await fs.writeFile(PAYOUT_FILE, JSON.stringify(data, null, 2))
}

// 計算結算摘要
async function calculatePayoutSummary(affiliateId: string): Promise<{
  totalEarned: number
  totalPaid: number
  pendingAmount: number
  availableForPayout: number
  minimumPayout: number
  nextPayoutDate?: string
}> {
  // 從統計系統獲取總收入
  try {
    const { getAffiliateStats } = await import('../../../../lib/data/affiliate-stats')
    const stats = await getAffiliateStats(affiliateId, 365) // 一年內的數據
    
    const payoutData = await ensurePayoutFile()
    const affiliatePayouts = payoutData.payouts.filter(p => p.affiliateId === affiliateId)
    
    const totalPaid = affiliatePayouts
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const pendingAmount = affiliatePayouts
      .filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const availableForPayout = Math.max(0, stats.totalCommission - totalPaid - pendingAmount)
    
    return {
      totalEarned: stats.totalCommission,
      totalPaid,
      pendingAmount,
      availableForPayout,
      minimumPayout: 50,
      nextPayoutDate: '每月 15 日',
    }
  } catch (error) {
    console.error('計算結算摘要失敗:', error)
    return {
      totalEarned: 0,
      totalPaid: 0,
      pendingAmount: 0,
      availableForPayout: 0,
      minimumPayout: 50,
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

    const payoutData = await ensurePayoutFile()
    const affiliatePayouts = payoutData.payouts.filter(p => p.affiliateId === session.id)
    const summary = await calculatePayoutSummary(session.id)

    return NextResponse.json({
      summary,
      payouts: affiliatePayouts.sort((a, b) => 
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      )
    })

  } catch (error) {
    console.error('獲取結算資料失敗:', error)
    return NextResponse.json({ error: '獲取結算資料失敗' }, { status: 500 })
  }
}

// POST - 申請提款
export async function POST(request: NextRequest) {
  try {
    const session = await retrieveAffiliate()
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { amount, method } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: '無效的提款金額' }, { status: 400 })
    }

    if (!method || !['bank_transfer', 'paypal', 'stripe'].includes(method)) {
      return NextResponse.json({ error: '無效的提款方式' }, { status: 400 })
    }

    // 檢查可用餘額
    const summary = await calculatePayoutSummary(session.id)
    
    if (amount > summary.availableForPayout) {
      return NextResponse.json({ error: '提款金額超過可用餘額' }, { status: 400 })
    }

    if (amount < summary.minimumPayout) {
      return NextResponse.json({ 
        error: `最低提款金額為 $${summary.minimumPayout}` 
      }, { status: 400 })
    }

    // 創建提款記錄
    const payoutData = await ensurePayoutFile()
    const newPayout: PayoutRecord = {
      id: `payout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      affiliateId: session.id,
      amount,
      currency: 'USD',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      method,
    }

    payoutData.payouts.push(newPayout)
    await savePayoutData(payoutData)

    console.log(`💰 新提款申請: ${session.id} -> $${amount} (${method})`)

    return NextResponse.json({ 
      success: true,
      payout: newPayout
    })

  } catch (error) {
    console.error('提款申請失敗:', error)
    return NextResponse.json({ error: '提款申請失敗' }, { status: 500 })
  }
}

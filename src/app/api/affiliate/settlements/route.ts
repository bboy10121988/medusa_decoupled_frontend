import { NextResponse } from 'next/server'
import { retrieveAffiliate } from '../../../../lib/data/affiliate-auth'

// GET - 獲取結算資料
export async function GET() {
  try {
    const session = await retrieveAffiliate()
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { getAffiliateToken } = await import('../../../../lib/data/affiliate-auth')
    const token = await getAffiliateToken()
    const { MEDUSA_BACKEND_URL } = await import('../../../../lib/config')

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    }
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/me`, {
      headers,
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ error: '獲取後端資料失敗' }, { status: res.status })
    }

    const affiliate = await res.json()

    // Map backend settlements to frontend format
    const mappedSettlements = (affiliate.settlements || []).map((s: any) => ({
      id: s.id,
      amount: Number(s.amount || 0),
      currency: s.currency_code || 'TWD',
      status: s.status === 'paid' ? 'settled' : 'pending',
      settlementDate: s.created_at,
      period: new Date(s.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit' }),
      method: affiliate.settings?.payoutMethod || 'bank_transfer',
      note: s.metadata?.note || ''
    }))

    // 注入虛擬記錄以區分「已收取 (可結算)」與「未收取 (待處理)」
    const now = new Date()
    const balance = Number(affiliate.balance || 0)
    const pendingBalance = Number(affiliate.pending_balance || 0)

    if (balance > 0) {
      mappedSettlements.push({
        id: 'VIRTUAL_CAPTURED',
        amount: balance,
        currency: 'TWD',
        status: 'pending' as const,
        settlementDate: now.toISOString(),
        period: now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit' }),
        method: affiliate.settings?.payoutMethod || 'bank_transfer',
        note: '已收取款項 (可結算金額)'
      })
    }

    if (pendingBalance > 0) {
      mappedSettlements.push({
        id: 'VIRTUAL_PENDING',
        amount: pendingBalance,
        currency: 'TWD',
        status: 'pending' as const,
        settlementDate: now.toISOString(),
        period: now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit' }),
        method: affiliate.settings?.payoutMethod || 'bank_transfer',
        note: '未收取款項 (訂單處理中/待扣款)'
      })
    }

    // 計算下次結算日期（每月25號）
    const nextSettlementDate = calculateNextSettlementDate(now)

    const summary = {
      totalEarned: Number(affiliate.total_earnings || 0),
      totalSettled: Number(affiliate.total_settled || 0),
      pendingSettlement: Number(affiliate.balance || 0),
      nextSettlementDate
    }

    return NextResponse.json({
      summary,
      settlements: mappedSettlements.sort((a: any, b: any) =>
        new Date(b.settlementDate).getTime() - new Date(a.settlementDate).getTime()
      )
    })

  } catch (error) {
    console.error('獲取結算資料失敗:', error)
    return NextResponse.json({ error: '獲取結算資料失敗' }, { status: 500 })
  }
}

function calculateNextSettlementDate(now: Date) {
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

  return new Date(nextYear, nextMonth, 25).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

import { NextResponse } from 'next/server'
import type { AffiliateStatPoint, AffiliateStatsSummary } from 'types/affiliate'

export async function GET() {
  // Mock data for initial UI integration
  const trend: AffiliateStatPoint[] = Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
    clicks: Math.floor(50 + Math.random() * 50),
    conversions: Math.floor(5 + Math.random() * 10),
    revenue: Number((100 + Math.random() * 300).toFixed(2)),
    commission: Number((10 + Math.random() * 50).toFixed(2)),
  }))

  const res: AffiliateStatsSummary = {
    period: '最近 7 天',
    totalClicks: trend.reduce((s, p) => s + p.clicks, 0),
    totalConversions: trend.reduce((s, p) => s + p.conversions, 0),
    totalRevenue: Number(trend.reduce((s, p) => s + p.revenue, 0).toFixed(2)),
    totalCommission: Number(trend.reduce((s, p) => s + p.commission, 0).toFixed(2)),
    trend,
  }

  return NextResponse.json(res)
}

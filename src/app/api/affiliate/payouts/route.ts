import { NextResponse } from 'next/server'
import type { AffiliatePayout } from 'types/affiliate'

export async function GET() {
  const payouts: AffiliatePayout[] = [
    {
      id: 'pout_202408',
      amount: 120.5,
      currency: 'USD',
      status: 'paid',
      requestedAt: new Date(Date.now() - 86400000 * 40).toISOString(),
      paidAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    },
    {
      id: 'pout_202409',
      amount: 98.75,
      currency: 'USD',
      status: 'processing',
      requestedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ]

  return NextResponse.json({ payouts })
}

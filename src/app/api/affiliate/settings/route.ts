import { NextResponse } from 'next/server'
import type { AffiliateSettings } from 'types/affiliate'

export async function GET() {
  const settings: AffiliateSettings = {
    displayName: 'Affiliate User',
    website: 'https://affiliate.example.com',
    payoutMethod: 'paypal',
    paypalEmail: 'affiliate@example.com',
  }

  return NextResponse.json(settings)
}

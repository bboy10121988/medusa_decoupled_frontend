import { NextResponse } from 'next/server'
import type { AffiliateLink } from 'types/affiliate'

export async function GET() {
  const links: AffiliateLink[] = [
    {
      id: 'lnk_01',
      name: '首頁推廣',
      url: 'https://example.com/?ref=abc123',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      clicks: 523,
      conversions: 41,
    },
    {
      id: 'lnk_02',
      name: '夏季活動',
      url: 'https://example.com/summer?ref=abc123',
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      clicks: 213,
      conversions: 22,
    },
  ]

  return NextResponse.json({ links })
}

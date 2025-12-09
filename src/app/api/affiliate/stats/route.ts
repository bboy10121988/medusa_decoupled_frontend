import { NextResponse } from 'next/server'
import { getAffiliateToken } from '../../../../lib/data/affiliate-auth'
import { MEDUSA_BACKEND_URL } from '../../../../lib/config'

export async function GET(request: Request) {
  try {
    const token = await getAffiliateToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '7'

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    }

    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/stats?days=${days}`, {
      headers,
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

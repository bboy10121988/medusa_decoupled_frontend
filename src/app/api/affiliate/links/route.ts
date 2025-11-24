import { NextResponse, NextRequest } from 'next/server'
import { getAffiliateToken } from '../../../../lib/data/affiliate-auth'
import { MEDUSA_BACKEND_URL } from '../../../../lib/config'

export async function GET(_request: NextRequest) {
  try {
    const token = await getAffiliateToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/links`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch links' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAffiliateToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!res.ok) {
      const error = await res.json()
      return NextResponse.json({ error: error.message || 'Failed to create link' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

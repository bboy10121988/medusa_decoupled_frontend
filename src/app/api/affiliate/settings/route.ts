import { NextResponse, NextRequest } from 'next/server'
import { getAffiliateToken } from '../../../../lib/data/affiliate-auth'
import { MEDUSA_BACKEND_URL } from '../../../../lib/config'

export async function GET(request: NextRequest) {
  try {
    const token = await getAffiliateToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getAffiliateToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!res.ok) {
      const error = await res.json()
      return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

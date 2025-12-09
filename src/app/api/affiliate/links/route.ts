import { NextResponse, NextRequest } from 'next/server'
import { getAffiliateToken } from '../../../../lib/data/affiliate-auth'
import { MEDUSA_BACKEND_URL } from '../../../../lib/config'

export async function GET(_request: NextRequest) {
  try {
    const token = await getAffiliateToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    }

    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/links`, {
      headers,
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
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/links`, {
      method: 'POST',
      headers,
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

export async function DELETE(request: NextRequest) {
  try {
    const token = await getAffiliateToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`
    }
    if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
      headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/links?id=${id}`, {
      method: 'DELETE',
      headers,
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to delete link' }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

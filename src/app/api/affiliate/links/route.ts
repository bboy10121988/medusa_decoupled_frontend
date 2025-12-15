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
    console.error('[API Proxy DEBUG] GET /links Error:', error)
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
    console.log('[API Proxy DEBUG] POST /links Request Body:', body)

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
      const errorText = await res.text()
      console.error('[API Proxy DEBUG] Backend Error:', res.status, errorText)
      // Try to parse JSON if possible, else return text
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json({ error: errorJson.message || 'Failed to create link' }, { status: res.status })
      } catch (e) {
        return NextResponse.json({ error: errorText || 'Failed to create link' }, { status: res.status })
      }
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API Proxy DEBUG] POST /links Error:', error)
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

import { NextResponse, NextRequest } from 'next/server'
import { MEDUSA_BACKEND_URL } from '../../../../../lib/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/links/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to record click' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import { NextResponse, NextRequest } from 'next/server'
import { getAffiliateToken } from '../../../../../../lib/data/affiliate-auth'
import { MEDUSA_BACKEND_URL } from '../../../../../../lib/config'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getAffiliateToken()
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/admin/${id}/promo-codes`, {
            headers,
            cache: 'no-store'
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error('[Admin Promo Codes Proxy] Backend Error:', res.status, errorText)
            return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('[Admin Promo Codes Proxy] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getAffiliateToken()
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/admin/${id}/promo-codes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            cache: 'no-store'
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error('[Admin Promo Codes Proxy] Backend Error:', res.status, errorText)
            return NextResponse.json({ error: 'Failed to create promo code' }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('[Admin Promo Codes Proxy] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

import { NextResponse, NextRequest } from 'next/server'
import { getAffiliateToken } from '../../../../../lib/data/affiliate-auth'
import { MEDUSA_BACKEND_URL } from '../../../../../lib/config'

export async function POST(request: NextRequest) {
    try {
        const token = await getAffiliateToken()
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json().catch(() => ({}))

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/admin/bulk-promo-codes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            cache: 'no-store'
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error('[Bulk Promo Codes Proxy] Backend Error:', res.status, errorText)
            return NextResponse.json({ error: 'Failed to create bulk promo codes' }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('[Bulk Promo Codes Proxy] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

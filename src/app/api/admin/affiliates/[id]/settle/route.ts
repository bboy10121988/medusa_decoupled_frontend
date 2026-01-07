import { NextResponse, NextRequest } from 'next/server'
import { getAffiliateToken } from '../../../../../../lib/data/affiliate-auth'
import { MEDUSA_BACKEND_URL } from '../../../../../../lib/config'

export async function POST(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = await getAffiliateToken()
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const { id } = params

        // Call Backend Admin Settle Endpoint (Custom Store Path to allow Affiliate Manager Auth)
        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/admin/${id}/settle`, {
            method: 'POST',
            headers,
            cache: 'no-store'
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error('[Admin Settle Proxy] Backend Error:', res.status, errorText)
            try {
                const errorJson = JSON.parse(errorText)
                return NextResponse.json(errorJson, { status: res.status })
            } catch {
                return NextResponse.json({ error: 'Failed to settle affiliate' }, { status: res.status })
            }
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('[Admin Settle Proxy] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

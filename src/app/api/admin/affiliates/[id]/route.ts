import { NextResponse, NextRequest } from 'next/server'
import { getAffiliateToken } from '../../../../../lib/data/affiliate-auth'
import { MEDUSA_BACKEND_URL } from '../../../../../lib/config'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } } // Wait, standard Next.js route handler params
) {
    try {
        const token = await getAffiliateToken()
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params
        const body = await request.json()

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/admin/${id}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            cache: 'no-store'
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error('[Admin Update Proxy] Backend Error:', res.status, errorText)
            return NextResponse.json({ error: 'Failed to update affiliate' }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('[Admin Update Proxy] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

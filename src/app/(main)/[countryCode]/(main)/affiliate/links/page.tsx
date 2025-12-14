import { retrieveAffiliate, getAffiliateToken } from '@lib/data/affiliate-auth'
import { redirect } from 'next/navigation'
import { MEDUSA_BACKEND_URL } from '@lib/config'
import { LinkGeneratorForm, LinkList } from './components'

// 暫時內嵌類型定義
type AffiliateLink = {
    id: string
    name: string
    url: string
    createdAt: string
    clicks: number
    conversions: number
}

export default async function AffiliateLinksPage({ params }: { params: Promise<{ countryCode: string }> }) {
    const { countryCode } = await params
    const session = await retrieveAffiliate()
    if (!session) redirect(`/${countryCode}/login-affiliate`)

    const token = await getAffiliateToken()
    let affiliateCode = ''

    // Verify status with backend
    try {
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`
        }
        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers['x-publishable-api-key'] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const meRes = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/me`, {
            headers,
            cache: 'no-store'
        })

        if (meRes.ok) {
            const me = await meRes.json()
            // Extract affiliate code
            affiliateCode = me.code || ''

            if (me.status !== 'approved' && me.status !== 'active') {
                redirect(`/${countryCode}/affiliate/pending`)
            }
        } else if (meRes.status === 401) {
            redirect(`/${countryCode}/login-affiliate`)
        }
    } catch (error) {
        // If verification fails but we have session, let it proceed or handle error
        // For now, if it's a redirect error, throw it
        if (error instanceof Error && (error.message === 'NEXT_REDIRECT' || (error as any).digest?.startsWith('NEXT_REDIRECT'))) {
            throw error
        }
    }

    let links: AffiliateLink[] = []

    try {
        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/links`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (res.ok) {
            const json = await res.json()
            links = (json?.links || []).map((l: any) => ({
                id: l.id,
                name: l.code,
                url: l.url,
                createdAt: l.created_at,
                clicks: l.clicks,
                conversions: l.conversions
            }))
        } else {
            // console.error('無法取得連結列表:', res.status, res.statusText)
        }
    } catch (error) {
        // console.error('取得連結列表時發生錯誤:', error)
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="mb-4 text-xl font-medium">創建推廣連結</h2>
                <LinkGeneratorForm affiliateCode={affiliateCode} />
            </div>

            <div>
                <h2 className="mb-4 text-xl font-medium">我的推廣連結</h2>
                <LinkList links={links} />
            </div>
        </div>
    )
}

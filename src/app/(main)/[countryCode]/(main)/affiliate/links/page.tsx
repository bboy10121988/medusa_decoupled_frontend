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
  if (session.status !== 'approved') redirect(`/${countryCode}/affiliate/pending`)

  const token = await getAffiliateToken()
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
        <LinkGeneratorForm />
      </div>
      
      <div>
        <h2 className="mb-4 text-xl font-medium">我的推廣連結</h2>
        <LinkList links={links} />
      </div>
    </div>
  )
}

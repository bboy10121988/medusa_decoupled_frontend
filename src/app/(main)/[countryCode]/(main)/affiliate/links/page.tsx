import { retrieveAffiliate } from '@lib/data/affiliate-auth'
import { redirect } from 'next/navigation'
import { getRequestOrigin } from '@lib/util/absolute-url'
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

  // 直接使用會員 session 中的 ID 獲取連結，而不是透過 API
  const origin = await getRequestOrigin()
  let links: AffiliateLink[] = []
  
  try {
    const res = await fetch(`${origin}/api/affiliate/links`, { 
      cache: 'no-store',
      headers: {
        'Cookie': `_affiliate_jwt=${Buffer.from(JSON.stringify(session)).toString('base64')}`
      }
    })
    
    if (res.ok) {
      const json = await res.json()
      links = json?.links || []
    } else {
      console.error('無法取得連結列表:', res.status, res.statusText)
    }
  } catch (error) {
    console.error('取得連結列表時發生錯誤:', error)
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

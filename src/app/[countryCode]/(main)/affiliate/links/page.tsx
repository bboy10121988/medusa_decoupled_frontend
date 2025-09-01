import type { AffiliateLink } from 'types/affiliate'
import { retrieveAffiliate } from '@lib/data/affiliate-auth'
import { redirect } from 'next/navigation'
import { getRequestOrigin } from '@lib/util/absolute-url'

export default async function AffiliateLinksPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const session = await retrieveAffiliate()
  if (!session) redirect(`/${countryCode}/login-affiliate`)
  if (session.status !== 'approved') redirect(`/${countryCode}/affiliate/pending`)

  const origin = getRequestOrigin()
  const res = await fetch(`${origin}/api/affiliate/links`, { cache: 'no-store' })
  const json = await res.json()
  const links: AffiliateLink[] = json?.links || []

  return (
    <div>
      <h2 className="mb-4 text-xl font-medium">推廣連結</h2>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <div className="font-medium">{l.name}</div>
              <div className="text-xs text-gray-600">{l.url}</div>
            </div>
            <div className="text-sm text-gray-700">{l.clicks} 次點擊 / {l.conversions} 次轉換</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

import type { AffiliateSettings } from 'types/affiliate'
import { retrieveAffiliate } from '@lib/data/affiliate-auth'
import { redirect } from 'next/navigation'
import { getRequestOrigin } from '@lib/util/absolute-url'

export default async function AffiliateSettingsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const session = await retrieveAffiliate()
  if (!session) redirect(`/${countryCode}/login-affiliate`)
  if (session.status !== 'approved') redirect(`/${countryCode}/affiliate/pending`)

  const origin = getRequestOrigin()
  const res = await fetch(`${origin}/api/affiliate/settings`, { cache: 'no-store' })
  const settings = (await res.json()) as AffiliateSettings

  return (
    <div>
      <h2 className="mb-4 text-xl font-medium">帳戶設定</h2>
      <div className="space-y-2 text-sm">
        <div>顯示名稱：{settings.displayName}</div>
        {settings.website && <div>網站：{settings.website}</div>}
        <div>收款方式：{settings.payoutMethod}</div>
        {settings.paypalEmail && <div>PayPal：{settings.paypalEmail}</div>}
      </div>
    </div>
  )
}

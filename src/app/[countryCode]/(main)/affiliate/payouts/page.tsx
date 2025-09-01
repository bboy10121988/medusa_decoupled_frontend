import type { AffiliatePayout } from 'types/affiliate'
import { retrieveAffiliate } from '@lib/data/affiliate-auth'
import { redirect } from 'next/navigation'
import { getRequestOrigin } from '@lib/util/absolute-url'

export default async function AffiliatePayoutsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const session = await retrieveAffiliate()
  if (!session) redirect(`/${countryCode}/login-affiliate`)
  if (session.status !== 'approved') redirect(`/${countryCode}/affiliate/pending`)

  const origin = getRequestOrigin()
  const res = await fetch(`${origin}/api/affiliate/payouts`, { cache: 'no-store' })
  const json = await res.json()
  const payouts: AffiliatePayout[] = json?.payouts || []

  return (
    <div>
      <h2 className="mb-4 text-xl font-medium">結算紀錄</h2>
      <ul className="space-y-3">
        {payouts.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded border p-3">
            <div className="font-medium">#{p.id}</div>
            <div className="text-sm text-gray-700">{p.status}</div>
            <div className="text-sm">{p.currency} {p.amount.toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

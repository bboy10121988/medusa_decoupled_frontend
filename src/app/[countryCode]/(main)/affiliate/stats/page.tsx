import type { AffiliateStatsSummary } from 'types/affiliate'
import { retrieveAffiliate } from '@lib/data/affiliate-auth'
import { redirect } from 'next/navigation'
import { getRequestOrigin } from '@lib/util/absolute-url'

export default async function AffiliateStatsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const session = await retrieveAffiliate()
  if (!session) redirect(`/${countryCode}/login-affiliate`)
  if (session.status !== 'approved') redirect(`/${countryCode}/affiliate/pending`)

  const origin = getRequestOrigin()
  const res = await fetch(`${origin}/api/affiliate/stats`, { cache: 'no-store' })
  const data = (await res.json()) as AffiliateStatsSummary

  return (
    <div>
      <h2 className="mb-4 text-xl font-medium">統計趨勢（{data.period}）</h2>
      <div className="grid grid-cols-2 gap-4 small:grid-cols-4">
        <Stat label="點擊" value={data.totalClicks} />
        <Stat label="轉換" value={data.totalConversions} />
        <Stat label="營收" value={`$${data.totalRevenue.toFixed(2)}`} />
        <Stat label="佣金" value={`$${data.totalCommission.toFixed(2)}`} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}

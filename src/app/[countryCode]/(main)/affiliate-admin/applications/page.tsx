import { redirect } from 'next/navigation'
import { retrieveAffiliateAdmin } from '@lib/data/affiliate-admin-auth'
import ApplicationsClient from '@modules/affiliate-admin/components/applications-client'

export default async function AffiliateApplications({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const admin = await retrieveAffiliateAdmin()
  if (!admin) redirect(`/${countryCode}/affiliate-admin/login`)

  // Avoid server-side network fetch to local API to prevent dev "fetch failed".
  // Client component will fetch the latest list on mount.
  return <ApplicationsClient initial={[]} />
}

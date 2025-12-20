import type { ReactNode } from 'react'
import Link from 'next/link'
import AffiliateLogoutButton from '@modules/affiliate/components/affiliate-logout-button'
import { retrieveAffiliate } from '@lib/data/affiliate-auth'

interface AffiliateLayoutProps {
  children: ReactNode
  params: { countryCode: string }
}

export default async function AffiliateLayout({ children, params }: AffiliateLayoutProps) {
  const { countryCode } = params
  const affiliate = await retrieveAffiliate()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">聯盟行銷後台</h1>
        <nav className="text-sm text-gray-600">
          <Link className="hover:underline" href={`/${countryCode}/affiliate`}>統計</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href={`/${countryCode}/affiliate/links`}>連結</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href={`/${countryCode}/affiliate/payouts`}>結算</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href={`/${countryCode}/affiliate/settings`}>設定</Link>
          <span className="px-2">/</span>
          <AffiliateLogoutButton />
          {affiliate?.role === 'admin' && (
            <span className="ml-4 pl-4 border-l">
              <Link
                href={`/${countryCode}/affiliate/manager`}
                className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded hover:bg-gray-700"
              >
                進入管理後台
              </Link>
            </span>
          )}
        </nav>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {children}
      </div>
    </div >
  )
}

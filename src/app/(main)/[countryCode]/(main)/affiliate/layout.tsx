import type { ReactNode } from 'react'
import Link from 'next/link'
import AffiliateLogoutButton from '@modules/affiliate/components/affiliate-logout-button'

interface AffiliateLayoutProps {
  children: ReactNode
  params: { countryCode: string }
}

export default async function AffiliateLayout({ children, params }: AffiliateLayoutProps) {
  const { countryCode } = params

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
        </nav>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {children}
      </div>
    </div>
  )
}

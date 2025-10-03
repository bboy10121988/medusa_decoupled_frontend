import type { ReactNode } from 'react'
import Link from 'next/link'
import AffiliateAdminLogoutButton from '@modules/affiliate-admin/components/affiliate-admin-logout-button'

interface AffiliateAdminLayoutProps {
  children: ReactNode
  params: { countryCode: string }
}

export default function AffiliateAdminLayout({ children, params }: AffiliateAdminLayoutProps) {
  const { countryCode } = params

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">聯盟管理後台</h1>
        <nav className="text-sm text-gray-600">
          <Link className="hover:underline" href={`/${countryCode}/affiliate-admin`}>總覽</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href={`/${countryCode}/affiliate-admin/members`}>會員管理</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href={`/${countryCode}/affiliate-admin/settlements`}>結算管理</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href={`/${countryCode}/affiliate-admin/commissions`}>佣金管理</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href={`/${countryCode}/affiliate-admin/analytics`}>數據分析</Link>
          <span className="px-2">/</span>
          <AffiliateAdminLogoutButton />
        </nav>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {children}
      </div>
    </div>
  )
}


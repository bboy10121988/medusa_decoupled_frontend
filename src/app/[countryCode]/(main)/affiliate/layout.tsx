import type { ReactNode } from 'react'
import Link from 'next/link'
export default async function AffiliateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
            <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">聯盟行銷後台</h1>
        <nav className="text-sm text-gray-600">
          <Link className="hover:underline" href="/tw/affiliate">統計</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href="/tw/affiliate/links">連結</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href="/tw/affiliate/payouts">結算</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href="/tw/affiliate/settings">設定</Link>
        </nav>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {children}
      </div>
    </div>
  )
}

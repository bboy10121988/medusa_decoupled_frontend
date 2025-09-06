import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AffiliateAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">聯盟管理後台</h1>
        <nav className="text-sm text-gray-600">
          <Link className="hover:underline" href="/tw/affiliate-admin">總覽</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href="/tw/affiliate-admin/members">會員管理</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href="/tw/affiliate-admin/settlements">結算管理</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href="/tw/affiliate-admin/commissions">佣金管理</Link>
          <span className="px-2">/</span>
          <Link className="hover:underline" href="/tw/affiliate-admin/analytics">數據分析</Link>
          <span className="px-2">/</span>
          <form action="/api/affiliate-admin/signout" method="post" className="inline m-0">
            <button
              type="submit"
              className="hover:underline text-sm text-gray-500 p-0 m-0 bg-transparent border-none"
            >
              登出
            </button>
          </form>
        </nav>
      </div>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        {children}
      </div>
    </div>
  )
}


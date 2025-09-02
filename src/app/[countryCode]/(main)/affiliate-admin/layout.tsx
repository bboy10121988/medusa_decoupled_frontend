import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AffiliateAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">聯盟管理後台</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors" 
                href="/tw/affiliate-admin"
              >
                📊 總覽
              </Link>
              <Link 
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors" 
                href="/tw/affiliate-admin/members"
              >
                👥 會員管理
              </Link>
              <Link 
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors" 
                href="/tw/affiliate-admin/settlements"
              >
                💰 結算管理
              </Link>
              <Link 
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors" 
                href="/tw/affiliate-admin/commissions"
              >
                💳 佣金管理
              </Link>
              <Link 
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors" 
                href="/tw/affiliate-admin/analytics"
              >
                📈 數據分析
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}


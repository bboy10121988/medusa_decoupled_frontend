import { redirect } from 'next/navigation'
import Link from 'next/link'
import { retrieveAffiliateAdmin } from '@lib/data/affiliate-admin-auth'
import { getRequestOrigin } from '@lib/util/absolute-url'

export default async function AffiliateAdminHome({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const admin = await retrieveAffiliateAdmin()
  if (!admin) redirect(`/${countryCode}/affiliate-admin/login`)

  // fetch pending count from local API (mock)
  let count = 0
  try {
    const origin = await getRequestOrigin()
    const res = await fetch(`${origin}/api/affiliate-admin/applications`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      count = (json?.applications || []).length as number
    }
  } catch {}

  return (
    <div className="space-y-6">
      {/* 歡迎區域 */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">總覽</h2>
        <p className="mt-2 text-gray-600">歡迎回來，{admin.email}</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">待審核申請</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href={`/${countryCode}/affiliate-admin/applications`} 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              前往審核
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 可以添加更多統計卡片 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">活躍夥伴</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">即將推出</span>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">本月佣金</div>
              <div className="text-2xl font-bold text-gray-900">-</div>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">即將推出</span>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${countryCode}/affiliate-admin/applications`}
            className="flex items-center rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">審核申請</div>
              <div className="text-sm text-gray-500">管理聯盟夥伴申請</div>
            </div>
          </Link>
          
          <div className="flex items-center rounded-lg border border-gray-200 p-4 opacity-50">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">夥伴管理</div>
              <div className="text-sm text-gray-400">即將推出</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

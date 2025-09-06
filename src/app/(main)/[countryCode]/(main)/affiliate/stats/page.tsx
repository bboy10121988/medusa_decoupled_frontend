import type { AffiliateStatsSummary } from 'types/affiliate'
import { retrieveAffiliate } from '@lib/data/affiliate-auth'
import { redirect } from 'next/navigation'
import { getRequestOrigin } from '@lib/util/absolute-url'

// 臨時類型定義
type AffiliateLink = {
  id: string
  name: string
  url: string
  createdAt: string
  clicks: number
  conversions: number
}

export default async function AffiliateStatsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const session = await retrieveAffiliate()
  if (!session) redirect(`/${countryCode}/login-affiliate`)
  if (session.status !== 'approved') redirect(`/${countryCode}/affiliate/pending`)

  const origin = await getRequestOrigin()
  
  // 同時獲取統計數據和連結列表
  const [statsRes, linksRes] = await Promise.all([
    fetch(`${origin}/api/affiliate/stats`, { cache: 'no-store' }),
    fetch(`${origin}/api/affiliate/links`, { 
      cache: 'no-store',
      headers: {
        'Cookie': `_affiliate_jwt=${Buffer.from(JSON.stringify(session)).toString('base64')}`
      }
    })
  ])

  const data = (await statsRes.json()) as AffiliateStatsSummary & { 
    linkStats?: { [linkId: string]: { clicks: number, conversions: number, revenue: number, commission: number } } 
  }
  const linksData = linksRes.ok ? await linksRes.json() : { links: [] }
  const links: AffiliateLink[] = linksData?.links || []

  return (
    <div className="space-y-8">
      {/* 整體統計摘要 */}
      <div>
        <h2 className="mb-4 text-xl font-medium">整體表現（{data.period || '最近 7 天'}）</h2>
        <div className="grid grid-cols-2 gap-4 small:grid-cols-4">
          <StatCard 
            label="總點擊數" 
            value={data.totalClicks || 0}
            subtitle="所有連結累計"
          />
          <StatCard 
            label="總轉換數" 
            value={data.totalConversions || 0}
            subtitle={`整體轉換率：${data.totalClicks > 0 ? ((data.totalConversions || 0) / data.totalClicks * 100).toFixed(1) : 0}%`}
          />
          <StatCard 
            label="總營收" 
            value={`$${(data.totalRevenue || 0).toFixed(2)}`}
            subtitle="客戶消費金額"
          />
          <StatCard 
            label="總佣金" 
            value={`$${(data.totalCommission || 0).toFixed(2)}`}
            subtitle="您的總收入"
          />
        </div>
      </div>

      {/* 各連結詳細表現 */}
      <div>
        <h3 className="mb-4 text-lg font-medium">各連結表現分析</h3>
        {links.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">連結名稱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">目標網址</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">點擊</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">轉換</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">轉換率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">營收</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">佣金</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">建立時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {links.map((link) => {
                  // 從統計資料中獲取該連結的真實數據
                  const linkStat = data.linkStats?.[link.id] || {
                    clicks: link.clicks || 0,
                    conversions: link.conversions || 0,
                    revenue: 0,
                    commission: 0
                  }
                  
                  return (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{link.name}</div>
                        <div className="text-xs text-gray-500">ID: {link.id}</div>
                      </td>
                      <td className="px-6 py-4" style={{ maxWidth: '250px' }}>
                        <div className="overflow-x-auto">
                          <div className="text-sm text-gray-600" style={{ 
                            whiteSpace: 'nowrap',
                            minWidth: 'max-content'
                          }}>
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:text-blue-600"
                              title={link.url}
                            >
                              {link.url}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {linkStat.clicks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {linkStat.conversions}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {linkStat.clicks > 0 ? (linkStat.conversions / linkStat.clicks * 100).toFixed(1) : 0}%
                          </span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${linkStat.clicks > 0 ? Math.min((linkStat.conversions / linkStat.clicks * 100), 100) : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${linkStat.revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        ${linkStat.commission.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(link.createdAt).toLocaleDateString('zh-TW', { 
                          year: 'numeric',
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">尚未建立任何推廣連結</div>
            <div className="mt-2">
              <a 
                href={`/${countryCode}/affiliate/links`}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                立即建立連結 →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 每日趨勢 */}
      {data.trend && data.trend.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-medium">每日趨勢分析</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">點擊</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">轉換</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">轉換率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">營收</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">佣金</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.trend.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{day.clicks}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{day.conversions}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {day.clicks > 0 ? (day.conversions / day.clicks * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">${day.revenue.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${day.commission.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, subtitle }: { label: string; value: number | string; subtitle?: string }) {
  return (
    <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-gray-500">{subtitle}</div>}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AffiliateLogoutButton from '@modules/affiliate/components/affiliate-logout-button'

// 型別定義
type AffiliateProfile = {
  id: string
  email: string
  first_name: string
  last_name: string
  code: string
  status: 'pending' | 'approved' | 'rejected' | 'active'
  balance: number
  total_earnings: number
}

type AffiliateStatPoint = {
  date: string
  clicks: number
  conversions: number
  revenue: number
  commission: number
}

type AffiliateStatsSummary = {
  period: string
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  totalCommission: number
  trend: AffiliateStatPoint[]
}

type AffiliateLink = {
  id: string
  name: string
  url: string
  createdAt: string
  clicks: number
  conversions: number
}

type AffiliateOrder = {
  id: string
  clickId: string
  linkId: string
  linkName: string
  orderValue: number
  commission: number
  customerEmail?: string
  createdAt: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

type AffiliateOrdersResponse = {
  summary: {
    totalOrders: number
    totalValue: number
    totalCommission: number
    pendingCommission: number
  }
  orders: AffiliateOrder[]
}

type ExtendedAffiliateStats = AffiliateStatsSummary & {
  linkStats?: { [linkId: string]: { clicks: number, conversions: number, revenue: number, commission: number } }
}

export default function AffiliateHomePage() {
  const router = useRouter()
  const params = useParams()
  const countryCode = params.countryCode as string

  const [profile, setProfile] = useState<AffiliateProfile | null>(null)
  const [statsData, setStatsData] = useState<ExtendedAffiliateStats | null>(null)
  const [linksData, setLinksData] = useState<AffiliateLink[]>([])
  const [ordersData, setOrdersData] = useState<AffiliateOrdersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(7) // 預設 7 天
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterMode, setFilterMode] = useState<'preset' | 'custom'>('preset')

  // 驗證身份與狀態
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/affiliate/me')
        if (res.status === 401) {
          router.push(`/${countryCode}/login-affiliate`)
          return
        }
        if (!res.ok) throw new Error('Failed to fetch profile')

        const data = await res.json()
        setProfile(data)
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    checkAuth()
  }, [countryCode, router])

  // 設定預設日期範圍
  useEffect(() => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000) // 7天前

    setEndDate(today.toISOString().split('T')[0])
    setStartDate(weekAgo.toISOString().split('T')[0])
  }, [])

  // 載入資料
  const fetchData = async () => {
    if (!profile || (profile.status !== 'approved' && profile.status !== 'active')) return

    setLoading(true)
    try {
      const [statsRes, linksRes, ordersRes] = await Promise.all([
        fetch(`/api/affiliate/stats?days=${dateRange}`, { cache: 'no-store' }),
        fetch(`/api/affiliate/links`, { cache: 'no-store' }),
        fetch(`/api/affiliate/orders`, { cache: 'no-store' })
      ])

      const stats = await statsRes.json()
      const links = linksRes.ok ? await linksRes.json() : { links: [] }
      const orders = ordersRes.ok ? await ordersRes.json() : {
        summary: { totalOrders: 0, totalValue: 0, totalCommission: 0, pendingCommission: 0 },
        orders: []
      }

      setStatsData(stats)
      setLinksData(links?.links || [])
      setOrdersData(orders)
    } catch (error) {
      // console.error('載入資料失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.status === 'approved' || profile?.status === 'active') {
      fetchData()
    }
  }, [dateRange, profile])

  // 處理日期範圍變更
  const handleDateRangeChange = (days: number) => {
    setFilterMode('preset')
    setDateRange(days)
  }

  const handleCustomDateChange = () => {
    setFilterMode('custom')
    // 計算自訂日期範圍的天數
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setDateRange(diffDays)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  if (profile.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-lg border shadow-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">帳號審核中</h2>
        <p className="text-gray-600 mb-6">
          感謝您申請加入我們的聯盟行銷計畫。您的帳號目前正在審核中，
          我們會在 1-3 個工作天內完成審核並透過 Email 通知您。
        </p>
        <div className="text-sm text-gray-500 mb-6">
          申請帳號：{profile.email}
        </div>
        <div className="flex justify-center">
          <AffiliateLogoutButton />
        </div>
      </div>
    )
  }

  if (loading && !statsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">歡迎回來，{profile.last_name} {profile.first_name}</h1>
          <p className="text-gray-500">聯盟代碼：<span className="font-mono font-medium text-blue-600">{profile.code}</span></p>
        </div>
      </div>

      {/* 日期篩選器 */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">篩選條件</h3>

        <div className="flex flex-wrap items-center gap-4">
          {/* 預設日期範圍 */}
          <div className="flex flex-wrap gap-2">
            {[7, 14, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => handleDateRangeChange(days)}
                className={`px-3 py-1 text-sm rounded-md border ${filterMode === 'preset' && dateRange === days
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                最近 {days} 天
              </button>
            ))}
          </div>

          {/* 自訂日期範圍 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">自訂：</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
            <span className="text-sm text-gray-500">到</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            />
            <button
              onClick={handleCustomDateChange}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              套用
            </button>
          </div>
        </div>
      </div>

      {/* 整體統計摘要 */}
      <div>
        <h2 className="mb-4 text-xl font-medium">統計總覽（{statsData?.period || '最近 7 天'}）</h2>
        <div className="grid grid-cols-2 gap-4 small:grid-cols-4">
          <StatCard
            label="總點擊數"
            value={statsData?.totalClicks || 0}
            subtitle="所有連結累計"
          />
          <StatCard
            label="總轉換數"
            value={statsData?.totalConversions || 0}
            subtitle={`整體轉換率：${statsData?.totalClicks && statsData.totalClicks > 0 ? ((statsData.totalConversions || 0) / statsData.totalClicks * 100).toFixed(1) : 0}%`}
          />
          <StatCard
            label="總營收"
            value={`$${(statsData?.totalRevenue || 0).toFixed(2)}`}
            subtitle="客戶消費金額"
          />
          <StatCard
            label="總佣金"
            value={`$${(statsData?.totalCommission || 0).toFixed(2)}`}
            subtitle="您的總收入"
          />
        </div>
      </div>

      {/* 各連結詳細表現 */}
      <div>
        <h3 className="mb-4 text-lg font-medium">各連結表現分析</h3>
        {statsData?.linkStats && Object.keys(statsData.linkStats).length > 0 ? (
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
                {Object.entries(statsData.linkStats)
                  .filter(([, linkStat]) => linkStat.clicks > 0 || linkStat.conversions > 0) // 只顯示有數據的連結
                  .sort(([, a], [, b]) => b.clicks - a.clicks) // 按點擊數排序
                  .map(([linkId, linkStat]) => {
                    // 從連結資料中獲取補充資訊
                    const linkInfo = linksData.find(link => link.id === linkId) || {
                      name: `連結 ${linkId}`,
                      url: '',
                      createdAt: new Date().toISOString()
                    }

                    return (
                      <tr key={linkId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{linkInfo.name}</div>
                          <div className="text-xs text-gray-500">ID: {linkId}</div>
                        </td>
                        <td className="px-6 py-4" style={{ maxWidth: '250px' }}>
                          {linkInfo.url ? (
                            <div className="overflow-x-auto">
                              <div className="text-sm text-gray-600" style={{
                                whiteSpace: 'nowrap',
                                minWidth: 'max-content'
                              }}>
                                <a
                                  href={linkInfo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600"
                                  title={linkInfo.url}
                                >
                                  {linkInfo.url}
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">連結資訊不完整</div>
                          )}
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
                          {linkInfo.createdAt ?
                            new Date(linkInfo.createdAt).toLocaleDateString('zh-TW', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : '-'
                          }
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">在選定日期範圍內沒有連結活動</div>
            <div className="mt-2">
              <a
                href="/tw/affiliate/links"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                管理推廣連結 →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 每日趨勢 */}
      {statsData?.trend && statsData.trend.length > 0 && (
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
                {statsData.trend.map((day) => (
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

      {/* 最近成交訂單 */}
      <div>
        <h3 className="mb-4 text-lg font-medium">最近成交訂單</h3>

        {ordersData && ordersData.orders.length > 0 ? (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">訂單編號</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">連結名稱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">訂單金額</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">佣金</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ordersData.orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.linkName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${order.orderValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ${order.commission.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {order.status === 'confirmed' ? '已確認' :
                          order.status === 'pending' ? '待確認' : '已取消'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('zh-TW', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-white border rounded-lg">
            <div className="text-gray-500">尚未有透過聯盟連結產生的訂單</div>
          </div>
        )}
      </div>
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

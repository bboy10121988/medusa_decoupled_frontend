'use client'

import { useState, useEffect } from 'react'

type AnalyticsData = {
  overview: {
    totalRevenue: number
    totalCommission: number
    totalOrders: number
    averageOrderValue: number
    conversionRate: number
    topPerformingAffiliate: string
  }
  trends: {
    date: string
    revenue: number
    orders: number
    commission: number
  }[]
  topAffiliates: {
    id: string
    name: string
    revenue: number
    orders: number
    commission: number
    conversionRate: number
  }[]
  topProducts: {
    productId: string
    productName: string
    orders: number
    revenue: number
  }[]
}

export default function AffiliateAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/affiliate-admin/analytics?range=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('獲取分析數據失敗')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <div className="text-red-800">{error || '無法載入分析數據'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">數據分析</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === '7d'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7天
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === '30d'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            30天
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === '90d'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            90天
          </button>
          <button
            onClick={() => setTimeRange('1y')}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === '1y'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            1年
          </button>
        </div>
      </div>

      {/* 總覽統計 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="總營收"
          value={`$${data.overview.totalRevenue.toFixed(2)}`}
          icon="💰"
          color="green"
        />
        <StatCard
          title="總佣金"
          value={`$${data.overview.totalCommission.toFixed(2)}`}
          icon="💳"
          color="blue"
        />
        <StatCard
          title="總訂單"
          value={data.overview.totalOrders.toString()}
          icon="📦"
          color="purple"
        />
        <StatCard
          title="平均訂單價值"
          value={`$${data.overview.averageOrderValue.toFixed(2)}`}
          icon="📊"
          color="yellow"
        />
        <StatCard
          title="轉換率"
          value={`${(data.overview.conversionRate * 100).toFixed(2)}%`}
          icon="📈"
          color="green"
        />
        <StatCard
          title="頂級聯盟商"
          value={data.overview.topPerformingAffiliate}
          icon="🏆"
          color="gold"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 趨勢圖表 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">營收趨勢</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {data.trends.slice(-7).map((trend, index) => {
              const maxRevenue = Math.max(...data.trends.map(t => t.revenue))
              const height = maxRevenue > 0 ? (trend.revenue / maxRevenue) * 200 : 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-blue-500 w-full rounded-t"
                    style={{ height: `${height}px` }}
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(trend.date).toLocaleDateString('zh-TW', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-gray-700 font-medium">
                    ${trend.revenue.toFixed(0)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 頂級聯盟商 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">頂級聯盟商</h3>
          <div className="space-y-4">
            {data.topAffiliates.slice(0, 5).map((affiliate, index) => (
              <div key={affiliate.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{affiliate.name}</p>
                    <p className="text-xs text-gray-500">
                      {affiliate.orders} 筆訂單 • {(affiliate.conversionRate * 100).toFixed(1)}% 轉換率
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${affiliate.commission.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">${affiliate.revenue.toFixed(2)} 營收</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 熱門產品 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">熱門產品</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  產品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  訂單數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  營收
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  佔比
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topProducts.slice(0, 10).map((product) => {
                const percentage = (product.revenue / data.overview.totalRevenue * 100).toFixed(1)
                
                return (
                  <tr key={product.productId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                      <div className="text-sm text-gray-500">{product.productId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {percentage}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color = 'blue' 
}: { 
  title: string
  value: string
  icon: string
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'gold'
}) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    green: 'from-green-50 to-green-100 border-green-200',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    gold: 'from-amber-50 to-amber-100 border-amber-200',
  }

  return (
    <div className={`rounded-lg border bg-gradient-to-br ${colorClasses[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}

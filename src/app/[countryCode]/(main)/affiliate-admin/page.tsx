'use client'

import { useState, useEffect } from 'react'

type AdminOverviewData = {
  summary: {
    totalAffiliates: number
    activeAffiliates: number
    pendingAffiliates: number
    totalCommission: number
    totalSettled: number
    pendingSettlement: number
    thisMonthOrders: number
    thisMonthRevenue: number
  }
  recentActivities: {
    id: string
    type: 'registration' | 'order' | 'settlement' | 'commission'
    description: string
    amount?: number
    timestamp: string
    affiliateId: string
  }[]
  topAffiliates: {
    id: string
    name: string
    orders: number
    revenue: number
    commission: number
  }[]
}

export default function AffiliateAdminDashboard() {
  const [data, setData] = useState<AdminOverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/affiliate-admin/overview')
      
      if (!response.ok) {
        throw new Error('獲取總覽數據失敗')
      }
      
      const adminData = await response.json()
      setData(adminData)
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
        <div className="text-red-800">{error || '無法載入數據'}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900">管理總覽</h2>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="聯盟會員總數"
          value={data.summary.totalAffiliates.toString()}
          subtitle={`活躍: ${data.summary.activeAffiliates} | 待審: ${data.summary.pendingAffiliates}`}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="本月訂單"
          value={data.summary.thisMonthOrders.toString()}
          subtitle={`營收: $${data.summary.thisMonthRevenue.toFixed(2)}`}
          icon="📦"
          color="green"
        />
        <StatCard
          title="總佣金"
          value={`$${data.summary.totalCommission.toFixed(2)}`}
          subtitle={`已結算: $${data.summary.totalSettled.toFixed(2)}`}
          icon="💰"
          color="yellow"
        />
        <StatCard
          title="待結算"
          value={`$${data.summary.pendingSettlement.toFixed(2)}`}
          subtitle="等待下次結算"
          icon="⏳"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 最近活動 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">最近活動</h3>
          <div className="space-y-4">
            {data.recentActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-lg">
                    {activity.type === 'registration' ? '👤' : 
                     activity.type === 'order' ? '📦' :
                     activity.type === 'settlement' ? '💰' : '💳'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {activity.affiliateId} • {new Date(activity.timestamp).toLocaleString('zh-TW')}
                  </p>
                </div>
                {activity.amount && (
                  <div className="text-sm font-medium text-green-600">
                    +${activity.amount.toFixed(2)}
                  </div>
                )}
              </div>
            ))}
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
                    <p className="text-xs text-gray-500">{affiliate.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${affiliate.commission.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{affiliate.orders} 筆訂單</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionButton
            href="/tw/affiliate-admin/settlements"
            icon="💰"
            title="執行結算"
            description="處理月度結算"
          />
          <QuickActionButton
            href="/tw/affiliate-admin/members"
            icon="👥"
            title="審核會員"
            description="審核待審會員"
          />
          <QuickActionButton
            href="/tw/affiliate-admin/commissions"
            icon="💳"
            title="調整佣金"
            description="管理佣金設定"
          />
          <QuickActionButton
            href="/tw/affiliate-admin/analytics"
            icon="📈"
            title="查看報表"
            description="詳細數據分析"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue' 
}: { 
  title: string
  value: string
  subtitle: string
  icon: string
  color?: 'blue' | 'green' | 'yellow' | 'purple'
}) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    green: 'from-green-50 to-green-100 border-green-200',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
  }

  return (
    <div className={`rounded-lg border bg-gradient-to-br ${colorClasses[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}

function QuickActionButton({ 
  href, 
  icon, 
  title, 
  description 
}: { 
  href: string
  icon: string
  title: string
  description: string
}) {
  return (
    <a
      href={href}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </a>
  )
}

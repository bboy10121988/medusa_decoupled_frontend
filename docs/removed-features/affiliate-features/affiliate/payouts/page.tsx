'use client'

import { useState, useEffect } from 'react'

// 型別定義
type SettlementRecord = {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'settled'
  settlementDate: string
  period: string // 結算期間，如 "2025-08"
  method: 'bank_transfer' | 'paypal' | 'stripe'
  reference?: string
  note?: string
}

type SettlementSummary = {
  totalEarned: number // 總收入
  totalSettled: number // 已結算金額
  pendingSettlement: number // 未結算金額
  nextSettlementDate: string // 下次結算日期（每月25號）
}

export default function AffiliatePayoutsPage() {
  const [settlementSummary, setSettlementSummary] = useState<SettlementSummary | null>(null)
  const [settlements, setSettlements] = useState<SettlementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'settled'>('pending')

  useEffect(() => {
    fetchSettlementData()
  }, [])

  const fetchSettlementData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/affiliate/settlements')
      
      if (!response.ok) {
        throw new Error('獲取結算資料失敗')
      }
      
      const data = await response.json()
      setSettlementSummary(data.summary)
      setSettlements(data.settlements || [])
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

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <div className="text-red-800">{error}</div>
      </div>
    )
  }

  const pendingSettlements = settlements.filter(s => s.status === 'pending')
  const settledSettlements = settlements.filter(s => s.status === 'settled')

  // 計算下次結算日期
  const getNextSettlementDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    
    // 如果今天是25號之前，下次結算就是本月25號
    // 如果今天是25號之後，下次結算是下個月25號
    let nextMonth = month
    let nextYear = year
    
    if (day >= 25) {
      nextMonth += 1
      if (nextMonth > 11) {
        nextMonth = 0
        nextYear += 1
      }
    }
    
    return new Date(nextYear, nextMonth, 25).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* 結算總覽 */}
      <div>
        <h2 className="mb-4 text-xl font-medium">佣金結算</h2>
        <div className="grid grid-cols-1 gap-4 small:grid-cols-3">
          <SummaryCard
            label="總收入"
            value={`$${(settlementSummary?.totalEarned || 0).toFixed(2)}`}
            description="累計佣金收入"
            color="blue"
          />
          <SummaryCard
            label="已結算"
            value={`$${(settlementSummary?.totalSettled || 0).toFixed(2)}`}
            description="已完成結算金額"
            color="green"
          />
          <SummaryCard
            label="未結算"
            value={`$${(settlementSummary?.pendingSettlement || 0).toFixed(2)}`}
            description="等待下次結算"
            color="yellow"
          />
        </div>
      </div>

      {/* 結算說明 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">自動結算制度</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>結算日期：</strong>每月 25 日自動結算上個月的佣金</p>
              <p>• <strong>結算方式：</strong>由聯盟管理後台統一處理，無需申請</p>
              <p>• <strong>下次結算：</strong>{getNextSettlementDate()}</p>
              <p>• <strong>結算後：</strong>款項將通過您設定的收款方式發放</p>
            </div>
          </div>
        </div>
      </div>

      {/* 結算記錄 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">結算記錄</h3>
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              未結算 ({pendingSettlements.length})
            </button>
            <button
              onClick={() => setActiveTab('settled')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'settled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              已結算 ({settledSettlements.length})
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          {(activeTab === 'pending' ? pendingSettlements : settledSettlements).length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    結算編號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    結算期間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    結算日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    備註
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(activeTab === 'pending' ? pendingSettlements : settledSettlements).map((settlement) => (
                  <tr key={settlement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {settlement.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {settlement.period}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${settlement.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        settlement.status === 'settled'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {settlement.status === 'settled' ? '已結算' : '未結算'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {settlement.status === 'settled' 
                        ? new Date(settlement.settlementDate).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '待結算'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {settlement.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {activeTab === 'pending' ? '目前沒有未結算的佣金' : '尚未有已結算的記錄'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ 
  label, 
  value, 
  description, 
  color = 'blue' 
}: { 
  label: string
  value: string
  description: string
  color?: 'blue' | 'green' | 'yellow' | 'purple'
}) {
  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50',
    green: 'from-green-50 to-emerald-50',
    yellow: 'from-yellow-50 to-amber-50',
    purple: 'from-purple-50 to-violet-50',
  }

  return (
    <div className={`rounded-lg border bg-gradient-to-r ${colorClasses[color]} p-4`}>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{description}</div>
    </div>
  )
}

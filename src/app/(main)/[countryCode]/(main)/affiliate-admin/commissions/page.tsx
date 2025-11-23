'use client'

import { useState, useEffect } from 'react'

type CommissionRule = {
  id: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderValue?: number
  maxOrderValue?: number
  productCategories?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type CommissionAdjustment = {
  id: string
  affiliateId: string
  affiliateName: string
  orderId: string
  originalCommission: number
  adjustedCommission: number
  reason: string
  createdAt: string
  createdBy: string
}

export default function AffiliateCommissions() {
  const [rules, setRules] = useState<CommissionRule[]>([])
  const [adjustments, setAdjustments] = useState<CommissionAdjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'rules' | 'adjustments'>('rules')
  // const [showCreateRule, setShowCreateRule] = useState(false)
  // const [showCreateAdjustment, setShowCreateAdjustment] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 同時獲取規則和調整記錄
      const [rulesResponse, adjustmentsResponse] = await Promise.all([
        fetch('/api/affiliate-admin/commission-rules'),
        fetch('/api/affiliate-admin/commission-adjustments')
      ])
      
      if (!rulesResponse.ok || !adjustmentsResponse.ok) {
        throw new Error('獲取佣金數據失敗')
      }
      
      const [rulesData, adjustmentsData] = await Promise.all([
        rulesResponse.json(),
        adjustmentsResponse.json()
      ])
      
      setRules(rulesData.rules)
      setAdjustments(adjustmentsData.adjustments)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">佣金管理</h2>
        <div className="flex space-x-3">
          {/* {activeTab === 'rules' && (
            <button
              onClick={() => setShowCreateRule(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              新增規則
            </button>
          )} */}
          {/* {activeTab === 'adjustments' && (
            <button
              onClick={() => setShowCreateAdjustment(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              新增調整
            </button>
          )} */}
        </div>
      </div>

      {/* 標籤切換 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            佣金規則 ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('adjustments')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'adjustments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            手動調整 ({adjustments.length})
          </button>
        </nav>
      </div>

      {activeTab === 'rules' && (
        <CommissionRulesTab 
          rules={rules} 
          onRefresh={fetchData}
          // showCreate={showCreateRule}
          // setShowCreate={setShowCreateRule}
        />
      )}

      {activeTab === 'adjustments' && (
        <CommissionAdjustmentsTab 
          adjustments={adjustments} 
          // onRefresh={fetchData}
          // showCreate={showCreateAdjustment}
          // setShowCreate={setShowCreateAdjustment}
        />
      )}
    </div>
  )
}

function CommissionRulesTab({ 
  rules, 
  onRefresh,
  // showCreate,
  // setShowCreate
}: { 
  rules: CommissionRule[]
  onRefresh: () => void
  // showCreate: boolean
  // setShowCreate: (show: boolean) => void
}) {
  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/affiliate-admin/commission-rules/${ruleId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (!response.ok) {
        throw new Error('更新規則狀態失敗')
      }

      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新失敗')
    }
  }

  return (
    <div className="space-y-6">
      {/* 規則統計 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-500">總規則數</div>
          <div className="text-2xl font-bold text-gray-900">{rules.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-500">啟用規則</div>
          <div className="text-2xl font-bold text-green-600">
            {rules.filter(r => r.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-500">停用規則</div>
          <div className="text-2xl font-bold text-gray-500">
            {rules.filter(r => !r.isActive).length}
          </div>
        </div>
      </div>

      {/* 規則列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  規則名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  數值
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  條件
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                    <div className="text-sm text-gray-500">{rule.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rule.type === 'percentage' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {rule.type === 'percentage' ? '百分比' : '固定金額'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {rule.minOrderValue && `最小: $${rule.minOrderValue}`}
                      {rule.maxOrderValue && `最大: $${rule.maxOrderValue}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rule.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.isActive ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleToggleRule(rule.id, !rule.isActive)}
                      className={`${
                        rule.isActive
                          ? 'text-red-600 hover:text-red-900'
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {rule.isActive ? '停用' : '啟用'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rules.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">暫無佣金規則</div>
          </div>
        )}
      </div>
    </div>
  )
}

function CommissionAdjustmentsTab({ 
  adjustments, 
  // onRefresh,
  // showCreate,
  // setShowCreate
}: { 
  adjustments: CommissionAdjustment[]
  // onRefresh: () => void
  // showCreate: boolean
  // setShowCreate: (show: boolean) => void
}) {
  return (
    <div className="space-y-6">
      {/* 調整統計 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-500">調整次數</div>
          <div className="text-2xl font-bold text-gray-900">{adjustments.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-500">調整總額</div>
          <div className="text-2xl font-bold text-blue-600">
            ${adjustments.reduce((sum, adj) => sum + (adj.adjustedCommission - adj.originalCommission), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* 調整列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  調整資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  會員
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  佣金變更
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  調整原因
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  調整時間
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adjustments.map((adjustment) => {
                const difference = adjustment.adjustedCommission - adjustment.originalCommission
                const isIncrease = difference > 0
                
                return (
                  <tr key={adjustment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{adjustment.id}</div>
                      <div className="text-sm text-gray-500">訂單: {adjustment.orderId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{adjustment.affiliateName}</div>
                      <div className="text-sm text-gray-500">{adjustment.affiliateId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${adjustment.originalCommission.toFixed(2)} → ${adjustment.adjustedCommission.toFixed(2)}
                      </div>
                      <div className={`text-sm font-medium ${
                        isIncrease ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isIncrease ? '+' : ''}${difference.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {adjustment.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(adjustment.createdAt).toLocaleString('zh-TW')}</div>
                      <div className="text-xs">by {adjustment.createdBy}</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {adjustments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">暫無調整記錄</div>
          </div>
        )}
      </div>
    </div>
  )
}

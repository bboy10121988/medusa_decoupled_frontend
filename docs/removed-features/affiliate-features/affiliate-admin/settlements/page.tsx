'use client'

import { useState, useEffect } from 'react'

type Settlement = {
  id: string
  affiliateId: string
  affiliateName: string
  period: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  processedAt?: string
  paymentMethod: 'bank_transfer' | 'paypal' | 'stripe'
  paymentDetails?: any
}

export default function AffiliateSettlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchSettlements()
  }, [])

  const fetchSettlements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/affiliate-admin/settlements')
      
      if (!response.ok) {
        throw new Error('獲取結算列表失敗')
      }
      
      const data = await response.json()
      setSettlements(data.settlements)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessSettlement = async (settlementId: string) => {
    try {
      setProcessing(settlementId)
      const response = await fetch(`/api/affiliate-admin/settlements/${settlementId}/process`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('處理結算失敗')
      }

      // 重新獲取結算列表
      await fetchSettlements()
    } catch (err) {
      alert(err instanceof Error ? err.message : '處理結算失敗')
    } finally {
      setProcessing(null)
    }
  }

  const handleBatchProcess = async () => {
    const pendingSettlements = filteredSettlements.filter(s => s.status === 'pending')
    if (pendingSettlements.length === 0) {
      alert('沒有待處理的結算')
      return
    }

    if (!confirm(`確定要批量處理 ${pendingSettlements.length} 筆結算嗎？`)) {
      return
    }

    try {
      setProcessing('batch')
      const response = await fetch('/api/affiliate-admin/settlements/batch-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settlementIds: pendingSettlements.map(s => s.id)
        }),
      })

      if (!response.ok) {
        throw new Error('批量處理失敗')
      }

      await fetchSettlements()
      alert('批量處理完成')
    } catch (err) {
      alert(err instanceof Error ? err.message : '批量處理失敗')
    } finally {
      setProcessing(null)
    }
  }

  const filteredSettlements = settlements.filter(settlement => 
    statusFilter === 'all' || settlement.status === statusFilter
  )

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
        <h2 className="text-xl font-medium text-gray-900">結算管理</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBatchProcess}
            disabled={processing === 'batch' || filteredSettlements.filter(s => s.status === 'pending').length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing === 'batch' ? '處理中...' : '批量處理'}
          </button>
        </div>
      </div>

      {/* 狀態篩選 */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部 ({settlements.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            待處理 ({settlements.filter(s => s.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === 'processing'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            處理中 ({settlements.filter(s => s.status === 'processing').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            已完成 ({settlements.filter(s => s.status === 'completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            失敗 ({settlements.filter(s => s.status === 'failed').length})
          </button>
        </div>
      </div>

      {/* 結算統計 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-500">本月總結算金額</div>
          <div className="text-2xl font-bold text-gray-900">
            ${settlements.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-500">待處理金額</div>
          <div className="text-2xl font-bold text-yellow-600">
            ${settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-sm font-medium text-gray-500">已完成金額</div>
          <div className="text-2xl font-bold text-green-600">
            ${settlements.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* 結算列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  結算資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  會員
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  收款方式
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
              {filteredSettlements.map((settlement) => (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{settlement.id}</div>
                      <div className="text-sm text-gray-500">期間: {settlement.period}</div>
                      <div className="text-xs text-gray-400">
                        建立: {new Date(settlement.createdAt).toLocaleString('zh-TW')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{settlement.affiliateName}</div>
                      <div className="text-sm text-gray-500">{settlement.affiliateId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">${settlement.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentMethodBadge method={settlement.paymentMethod} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SettlementStatusBadge status={settlement.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {settlement.status === 'pending' && (
                      <button
                        onClick={() => handleProcessSettlement(settlement.id)}
                        disabled={processing === settlement.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        {processing === settlement.id ? '處理中...' : '處理'}
                      </button>
                    )}
                    {settlement.status === 'completed' && settlement.processedAt && (
                      <span className="text-xs text-gray-500">
                        已於 {new Date(settlement.processedAt).toLocaleDateString('zh-TW')} 完成
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSettlements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">暫無結算記錄</div>
          </div>
        )}
      </div>
    </div>
  )
}

function SettlementStatusBadge({ status }: { status: Settlement['status'] }) {
  const config = {
    pending: { text: '待處理', className: 'bg-yellow-100 text-yellow-800' },
    processing: { text: '處理中', className: 'bg-blue-100 text-blue-800' },
    completed: { text: '已完成', className: 'bg-green-100 text-green-800' },
    failed: { text: '失敗', className: 'bg-red-100 text-red-800' },
  }

  const { text, className } = config[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  )
}

function PaymentMethodBadge({ method }: { method: Settlement['paymentMethod'] }) {
  const config = {
    bank_transfer: { text: '銀行轉帳', className: 'bg-blue-100 text-blue-800' },
    paypal: { text: 'PayPal', className: 'bg-yellow-100 text-yellow-800' },
    stripe: { text: 'Stripe', className: 'bg-purple-100 text-purple-800' },
  }

  const { text, className } = config[method]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  )
}

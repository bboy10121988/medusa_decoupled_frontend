'use client'

import { useState, useEffect } from 'react'

type Member = {
  id: string
  email: string
  displayName: string
  status: 'active' | 'pending' | 'suspended'
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  registeredAt: string
  lastActive: string
}

export default function AffiliateMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/affiliate-admin/members')
      
      if (!response.ok) {
        throw new Error('獲取會員列表失敗')
      }
      
      const data = await response.json()
      setMembers(data.members)
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (memberId: string, newStatus: 'active' | 'pending' | 'suspended') => {
    try {
      const response = await fetch(`/api/affiliate-admin/members/${memberId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('更新會員狀態失敗')
      }

      // 更新本地狀態
      setMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, status: newStatus } : member
        )
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新狀態失敗')
    }
  }

  const filteredMembers = members.filter(member => 
    statusFilter === 'all' || member.status === statusFilter
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
        <h2 className="text-xl font-medium text-gray-900">會員管理</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">總計 {members.length} 位會員</span>
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
            全部 ({members.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            活躍 ({members.filter(m => m.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            待審 ({members.filter(m => m.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === 'suspended'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            暫停 ({members.filter(m => m.status === 'suspended').length})
          </button>
        </div>
      </div>

      {/* 會員列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  會員資訊
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  業績統計
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  註冊時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.displayName || member.email}
                      </div>
                      <div className="text-sm text-gray-500">{member.id}</div>
                      {member.displayName && (
                        <div className="text-xs text-gray-400">{member.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{member.totalOrders} 筆訂單</div>
                      <div className="text-gray-500">${member.totalRevenue.toFixed(2)} 營收</div>
                      <div className="text-green-600">${member.totalCommission.toFixed(2)} 佣金</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{new Date(member.registeredAt).toLocaleDateString('zh-TW')}</div>
                      <div className="text-xs">最後活動: {new Date(member.lastActive).toLocaleDateString('zh-TW')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {member.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(member.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                          >
                            通過
                          </button>
                          <button
                            onClick={() => handleStatusChange(member.id, 'suspended')}
                            className="text-red-600 hover:text-red-900"
                          >
                            拒絕
                          </button>
                        </>
                      )}
                      {member.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(member.id, 'suspended')}
                          className="text-red-600 hover:text-red-900"
                        >
                          暫停
                        </button>
                      )}
                      {member.status === 'suspended' && (
                        <button
                          onClick={() => handleStatusChange(member.id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          恢復
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {statusFilter === 'all' ? '暫無會員' : `暫無${statusFilter === 'active' ? '活躍' : statusFilter === 'pending' ? '待審' : '暫停'}會員`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'active' | 'pending' | 'suspended' }) {
  const config = {
    active: { text: '活躍', className: 'bg-green-100 text-green-800' },
    pending: { text: '待審', className: 'bg-yellow-100 text-yellow-800' },
    suspended: { text: '暫停', className: 'bg-red-100 text-red-800' },
  }

  const { text, className } = config[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  )
}

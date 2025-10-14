'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button, Badge, Input, Label } from '@medusajs/ui'

interface Member {
  id: string
  displayName: string
  email: string
  phone?: string
  status: 'active' | 'pending' | 'suspended'
  registeredAt: string
  totalOrders?: number
  totalRevenue?: number
  totalCommission?: number
  referralCode?: string
  commissionRate?: number
  website?: string
  socialMedia?: string
  lastActive?: string
  description?: string
}

interface Application {
  id: string
  name: string
  email: string
  phone?: string
  appliedAt?: string
  created_at?: string
  website?: string
  description?: string
  social_media?: string
  status?: string
}

type TabType = 'approved' | 'applications'

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('approved')
  const [members, setMembers] = useState<Member[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchMembers()
    fetchApplications()
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/affiliate-admin/members')
      const data = await response.json()
      
      if (response.ok) {
        setMembers(data.members)
      } else {
        throw new Error(data.error || '獲取會員列表失敗')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取會員列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/affiliate-admin/applications')
      if (!response.ok) throw new Error('獲取申請列表失敗')
      const data = await response.json()
      setApplications(data.applications)
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取申請列表失敗')
    }
  }

  const handleStatusChange = async (memberId: string, newStatus: 'active' | 'suspended') => {
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

      setMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, status: newStatus } : member
        )
      )
      setSuccess('會員狀態更新成功')
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新狀態失敗')
    }
  }

  const approveApplication = async (id: string, name: string) => {
    if (!confirm(`確定要通過「${name}」的申請嗎？`)) return
    
    startTransition(async () => {
      try {
        const res = await fetch(`/api/affiliate-admin/applications/${id}/approve`, { method: 'POST' })
        if (!res.ok) throw new Error('審核通過失敗')
        setApplications(prev => prev.filter(app => app.id !== id))
        setSuccess(`已通過「${name}」的申請`)
        fetchMembers()
      } catch (err) {
        setError(err instanceof Error ? err.message : '審核通過失敗')
      }
    })
  }

  const rejectApplication = async (id: string, name: string) => {
    if (!confirm(`確定要拒絕「${name}」的申請嗎？此操作無法撤銷。`)) return
    
    startTransition(async () => {
      try {
        const res = await fetch(`/api/affiliate-admin/applications/${id}/reject`, { method: 'POST' })
        if (!res.ok) throw new Error('審核拒絕失敗')
        setApplications(prev => prev.filter(app => app.id !== id))
        setSuccess(`已拒絕「${name}」的申請`)
      } catch (err) {
        setError(err instanceof Error ? err.message : '審核拒絕失敗')
      }
    })
  }

  const handleBatchApprove = async () => {
    const selectedCount = selectedApplications.size
    if (selectedCount === 0) {
      setError('請選擇要審核的申請')
      return
    }
    
    if (!confirm(`確定要通過選中的 ${selectedCount} 個申請嗎？`)) return
    
    startTransition(async () => {
      try {
        const promises = Array.from(selectedApplications).map(id =>
          fetch(`/api/affiliate-admin/applications/${id}/approve`, { method: 'POST' })
        )
        
        const results = await Promise.all(promises)
        const failedCount = results.filter(r => !r.ok).length
        
        if (failedCount > 0) {
          throw new Error(`${failedCount} 個申請審核失敗`)
        }
        
        setApplications(prev => prev.filter(app => !selectedApplications.has(app.id)))
        setSelectedApplications(new Set())
        setSuccess(`已通過 ${selectedCount} 個申請`)
        fetchMembers()
      } catch (err) {
        setError(err instanceof Error ? err.message : '批量審核失敗')
      }
    })
  }

  const handleBatchReject = async () => {
    const selectedCount = selectedApplications.size
    if (selectedCount === 0) {
      setError('請選擇要拒絕的申請')
      return
    }
    
    if (!confirm(`確定要拒絕選中的 ${selectedCount} 個申請嗎？此操作無法撤銷。`)) return
    
    startTransition(async () => {
      try {
        const promises = Array.from(selectedApplications).map(id =>
          fetch(`/api/affiliate-admin/applications/${id}/reject`, { method: 'POST' })
        )
        
        const results = await Promise.all(promises)
        const failedCount = results.filter(r => !r.ok).length
        
        if (failedCount > 0) {
          throw new Error(`${failedCount} 個申請拒絕失敗`)
        }
        
        setApplications(prev => prev.filter(app => !selectedApplications.has(app.id)))
        setSelectedApplications(new Set())
        setSuccess(`已拒絕 ${selectedCount} 個申請`)
      } catch (err) {
        setError(err instanceof Error ? err.message : '批量拒絕失敗')
      }
    })
  }

  const toggleSelectApplication = (id: string) => {
    const newSelected = new Set(selectedApplications)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedApplications(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set())
    } else {
      setSelectedApplications(new Set(filteredApplications.map(app => app.id)))
    }
  }

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.website?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">會員管理</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            已通過會員: {members.length} | 待審申請: {applications.length}
          </span>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="text-green-800">{success}</div>
        </div>
      )}
      
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'approved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              已通過會員 ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              待審申請 ({applications.length})
            </button>
          </nav>
        </div>

        {/* Approved Members Tab */}
        {activeTab === 'approved' && (
          <div className="p-6">
            {members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                尚無已通過的會員
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{member.displayName}</h3>
                          <Badge color={member.status === 'active' ? 'green' : 'red'}>
                            {member.status === 'active' ? '正常' : '已停權'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        {member.phone && (
                          <p className="text-sm text-gray-600">{member.phone}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          加入時間：{new Date(member.registeredAt).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {member.status === 'active' ? (
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleStatusChange(member.id, 'suspended')}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            停權
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleStatusChange(member.id, 'active')}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            恢復
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Member Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-sm">
                        <span className="text-gray-500">總訂單數：</span>
                        <span className="font-medium">{member.totalOrders || 0}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">累計佣金：</span>
                        <span className="font-medium">NT$ {(member.totalCommission || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(member.website || member.socialMedia) && (
                      <div className="space-y-2 pt-2 border-t">
                        {member.website && (
                          <div className="text-sm">
                            <span className="text-gray-500">網站：</span>
                            <a href={member.website} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline ml-1">
                              {member.website}
                            </a>
                          </div>
                        )}
                        {member.socialMedia && (
                          <div className="text-sm">
                            <span className="text-gray-500">社群媒體：</span>
                            <div className="text-xs text-gray-600 mt-1">
                              {member.socialMedia}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="p-6">
            {/* Search and Batch Actions */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-sm">
                  <Label htmlFor="search" className="sr-only">搜尋申請</Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="搜尋姓名、Email 或網站..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                {selectedApplications.size > 0 && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleBatchApprove}
                      disabled={isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      批量通過 ({selectedApplications.size})
                    </Button>
                    <Button
                      onClick={handleBatchReject}
                      disabled={isPending}
                      variant="secondary"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      批量拒絕 ({selectedApplications.size})
                    </Button>
                  </div>
                )}
              </div>

              {filteredApplications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    全選 ({selectedApplications.size}/{filteredApplications.length})
                  </span>
                </div>
              )}
            </div>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {applications.length === 0 ? '尚無待審申請' : '找不到符合條件的申請'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedApplications.has(application.id)}
                          onChange={() => toggleSelectApplication(application.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                        />
                        <div className="space-y-1">
                          <h3 className="font-medium text-gray-900">{application.name}</h3>
                          <p className="text-sm text-gray-600">{application.email}</p>
                          {application.phone && (
                            <p className="text-sm text-gray-600">{application.phone}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            申請時間：{new Date(application.created_at || application.appliedAt || '').toLocaleDateString('zh-TW')}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => approveApplication(application.id, application.name)}
                          disabled={isPending}
                          size="small"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          通過
                        </Button>
                        <Button
                          onClick={() => rejectApplication(application.id, application.name)}
                          disabled={isPending}
                          variant="secondary"
                          size="small"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          拒絕
                        </Button>
                      </div>
                    </div>

                    {/* Application Details */}
                    {(application.website || application.social_media || application.description) && (
                      <div className="space-y-2 pt-3 border-t">
                        {application.website && (
                          <div className="text-sm">
                            <span className="text-gray-500">網站：</span>
                            <a href={application.website} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline ml-1">
                              {application.website}
                            </a>
                          </div>
                        )}
                        {application.social_media && (
                          <div className="text-sm">
                            <span className="text-gray-500">社群媒體：</span>
                            <div className="text-xs text-gray-600 mt-1">
                              {application.social_media}
                            </div>
                          </div>
                        )}
                        {application.description && (
                          <div className="text-sm">
                            <span className="text-gray-500">申請說明：</span>
                            <p className="text-gray-700 mt-1">{application.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

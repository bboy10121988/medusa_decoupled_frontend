"use client"

import { useEffect, useMemo, useState, useTransition } from 'react'
import type { AffiliateApplication } from 'types/affiliate-admin'

export default function ApplicationsClient({ initial }: { initial: AffiliateApplication[] }) {
  const [apps, setApps] = useState<AffiliateApplication[]>(initial)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [viewDetails, setViewDetails] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/affiliate-admin/applications', { cache: 'no-store' })
        if (!res.ok) throw new Error('讀取申請列表失敗')
        const json = await res.json()
        setApps(json?.applications || [])
      } catch (e: any) {
        setError(e?.message || '讀取申請列表失敗')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return apps
    return apps.filter((a) =>
      a.email.toLowerCase().includes(term) ||
      a.displayName.toLowerCase().includes(term) ||
      (a.website || '').toLowerCase().includes(term)
    )
  }, [apps, q])

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const toggleAll = (checked: boolean) => {
    const map: Record<string, boolean> = {}
    filtered.forEach((a) => (map[a.id] = checked))
    setSelected(map)
  }

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }))
  }

  const approve = async (id: string, name: string) => {
    if (!confirm(`確定要通過「${name}」的申請嗎？`)) return
    
    startTransition(async () => {
      try {
        const res = await fetch(`/api/affiliate-admin/applications/${id}/approve`, { method: 'POST' })
        if (!res.ok) throw new Error('審核通過失敗')
        setApps((prev) => prev.filter((a) => a.id !== id))
        setSuccess(`已通過「${name}」的申請`)
        clearError()
      } catch (e: any) {
        setError(e?.message || '審核通過失敗')
      }
    })
  }

  const reject = async (id: string, name: string) => {
    if (!confirm(`確定要拒絕「${name}」的申請嗎？此操作無法撤銷。`)) return
    
    startTransition(async () => {
      try {
        const res = await fetch(`/api/affiliate-admin/applications/${id}/reject`, { method: 'POST' })
        if (!res.ok) throw new Error('審核拒絕失敗')
        setApps((prev) => prev.filter((a) => a.id !== id))
        setSuccess(`已拒絕「${name}」的申請`)
        clearError()
      } catch (e: any) {
        setError(e?.message || '審核拒絕失敗')
      }
    })
  }

  const bulk = async (action: 'approve' | 'reject') => {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k)
    if (!ids.length) return
    
    const actionText = action === 'approve' ? '通過' : '拒絕'
    if (!confirm(`確定要${actionText} ${ids.length} 個申請嗎？`)) return
    
    startTransition(async () => {
      try {
        await Promise.all(
          ids.map((id) => fetch(`/api/affiliate-admin/applications/${id}/${action}`, { method: 'POST' }))
        )
        setApps((prev) => prev.filter((a) => !ids.includes(a.id)))
        setSelected({})
        setSuccess(`已批次${actionText} ${ids.length} 個申請`)
        clearError()
      } catch (e: any) {
        setError(e?.message || '批次處理失敗')
      }
    })
  }

  const clearError = () => setError(null)
  const clearSuccess = () => setSuccess(null)

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected])
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center">
            <svg className="mr-2 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {success && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center">
            <svg className="mr-2 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700">{success}</span>
          </div>
          <button onClick={clearSuccess} className="text-green-500 hover:text-green-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">申請審核</h2>
          <p className="mt-1 text-sm text-gray-600">
            管理聯盟夥伴申請，共 {apps.length} 個待審核申請
          </p>
        </div>
        {(loading || isPending) && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            處理中...
          </div>
        )}
      </div>
      {/* 搜尋和操作欄 */}
      <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜尋申請人、電郵或網站..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {anySelected && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">已選擇 {selectedCount} 項</span>
            <button 
              onClick={() => bulk('approve')} 
              disabled={!anySelected || isPending} 
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              批次通過
            </button>
            <button 
              onClick={() => bulk('reject')} 
              disabled={!anySelected || isPending} 
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              批次拒絕
            </button>
          </div>
        )}
      </div>

      {/* 申請列表 */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          {q ? (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">找不到符合條件的申請</h3>
              <p className="mt-2 text-gray-600">請嘗試其他關鍵字或清除搜尋條件</p>
            </>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">暫無待審核申請</h3>
              <p className="mt-2 text-gray-600">目前沒有需要審核的聯盟夥伴申請</p>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input 
                      type="checkbox" 
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申請人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">聯絡資訊</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">網站</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申請時間</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={!!selected[app.id]}
                        onChange={(e) => toggleOne(app.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm font-medium text-blue-600">
                            {app.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{app.displayName}</div>
                          <div className="text-sm text-gray-500">ID: {app.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{app.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {app.website ? (
                        <a 
                          href={app.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {app.website}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">未提供</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(app.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => approve(app.id, app.displayName)} 
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                          disabled={isPending}
                        >
                          通過
                        </button>
                        <button 
                          onClick={() => reject(app.id, app.displayName)} 
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                          disabled={isPending}
                        >
                          拒絕
                        </button>
                      </div>
                    </td>
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

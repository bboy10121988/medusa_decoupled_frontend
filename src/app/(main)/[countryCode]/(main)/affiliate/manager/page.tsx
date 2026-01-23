'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Container, Heading, Badge } from '@medusajs/ui'


type Affiliate = {
    id: string
    email: string
    first_name: string
    last_name: string
    status: string
    role: string
    commission_rate: number
    balance: number
    total_earnings: number
    total_sales: number
    captured_balance: number
    pending_balance: number
    created_at: string
}

export default function AdminAffiliatesPage() {
    const { countryCode } = useParams()
    const [affiliates, setAffiliates] = useState<Affiliate[]>([])
    const [stats, setStats] = useState({
        active_affiliates: 0,
        total_affiliates: 0,
        total_commission_all_time: 0,
        total_commission_pending: 0,
        total_commission_paid: 0
    })
    const [loading, setLoading] = useState(true)
    const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null)
    const [newCommissionRate, setNewCommissionRate] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [bulkCreating, setBulkCreating] = useState(false)
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [bulkDiscountType, setBulkDiscountType] = useState<"percentage" | "fixed">("percentage")
    const [bulkDiscountValue, setBulkDiscountValue] = useState("10")
    const [bulkCommissionRate, setBulkCommissionRate] = useState("10")

    const fetchData = async () => {
        try {
            // Fetch list
            let url = '/api/admin/affiliates?'
            if (startDate) url += `from=${startDate}&`
            if (endDate) url += `to=${endDate}&`

            const resList = await fetch(url)
            const listData = await resList.json()
            setAffiliates(listData.affiliates || [])

            // Fetch stats
            let statsUrl = '/api/admin/affiliates/stats?'
            if (startDate) statsUrl += `from=${startDate}&`
            if (endDate) statsUrl += `to=${endDate}&`

            const resStats = await fetch(statsUrl)
            const statsData = await resStats.json()
            if (statsData.stats) setStats(statsData.stats)

        } catch (error) {
            console.error(error)
            alert('無法載入資料')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [startDate, endDate])

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`確定要將狀態更改為 ${newStatus}?`)) return
        try {
            await fetch(`/api/admin/affiliates/${id}`, {
                method: 'POST', body: JSON.stringify({ status: newStatus })
            })
            fetchData() // Refresh both list and stats
        } catch (e) { alert('更新失敗') }
    }

    const openCommissionModal = (aff: Affiliate) => {
        setEditingAffiliate(aff)
        setNewCommissionRate((aff.commission_rate * 100).toString())
    }

    const handleUpdateCommission = async () => {
        if (!editingAffiliate) return
        const newRate = parseFloat(newCommissionRate)
        if (isNaN(newRate) || newRate < 0 || newRate > 100) {
            alert('請輸入有效的數字 (0-100)')
            return
        }
        await fetch(`/api/admin/affiliates/${editingAffiliate.id}`, {
            method: 'POST', body: JSON.stringify({ commission_rate: newRate / 100 })
        })
        setEditingAffiliate(null)
        fetchData()
    }

    const handleBulkCreatePromoCodes = async () => {
        setBulkCreating(true)
        setShowBulkModal(false)
        try {
            const res = await fetch('/api/admin/affiliates/bulk-promo-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discount_type: bulkDiscountType,
                    discount_value: Number(bulkDiscountValue),
                    commission_rate: Number(bulkCommissionRate) / 100
                })
            })
            const data = await res.json()
            if (res.ok) {
                alert(`批次建立完成！\n建立: ${data.summary?.created || 0}\n略過: ${data.summary?.skipped || 0}\n錯誤: ${data.summary?.errors || 0}`)
            } else {
                alert(`建立失敗: ${data.error || data.message}`)
            }
        } catch (e) {
            alert('批次建立折扣碼失敗')
        } finally {
            setBulkCreating(false)
        }
    }

    if (loading) return <div className="p-8">載入中...</div>

    return (
        <Container>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Heading>總覽 & 推廣者列表</Heading>
                    <p className="text-ui-fg-subtle text-sm mt-1">管理所有聯盟行銷夥伴</p>
                </div>
                <div className="flex items-center gap-x-2">
                    <div className="flex items-center gap-x-1">
                        <span className="text-xs text-gray-500">從:</span>
                        <input
                            type="date"
                            className="border rounded px-2 py-1 text-xs"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-x-1">
                        <span className="text-xs text-gray-500">到:</span>
                        <input
                            type="date"
                            className="border rounded px-2 py-1 text-xs"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate('') }}
                            className="px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200"
                        >
                            清除
                        </button>
                    )}
                    <button onClick={fetchData} className="px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200 transition ml-2">重新整理</button>
                    <button
                        onClick={() => setShowBulkModal(true)}
                        disabled={bulkCreating}
                        className="px-4 py-2 bg-purple-600 text-white border rounded-lg hover:bg-purple-700 transition ml-2 disabled:opacity-50"
                    >
                        {bulkCreating ? '建立中...' : '批次建立折扣碼'}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white border rounded-lg">
                    <div className="text-xs text-gray-500 uppercase font-medium">總推廣營收 (All Time)</div>
                    <div className="text-2xl font-bold mt-2">${stats.total_commission_all_time.toFixed(0)}</div>
                </div>
                <div className="p-4 bg-white border rounded-lg">
                    <div className="text-xs text-gray-500 uppercase font-medium">待發佣金 (Pending)</div>
                    <div className="text-2xl font-bold mt-2 text-orange-600">${stats.total_commission_pending.toFixed(0)}</div>
                </div>
                <div className="p-4 bg-white border rounded-lg">
                    <div className="text-xs text-gray-500 uppercase font-medium">已發佣金 (Paid)</div>
                    <div className="text-2xl font-bold mt-2 text-green-600">${stats.total_commission_paid.toFixed(0)}</div>
                </div>
                <div className="p-4 bg-white border rounded-lg">
                    <div className="text-xs text-gray-500 uppercase font-medium">活躍推廣者</div>
                    <div className="text-2xl font-bold mt-2">{stats.active_affiliates} / {stats.total_affiliates}</div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="py-3 px-4">姓名 / Email</th>
                            <th className="py-3 px-4">狀態</th>
                            <th className="py-3 px-4">{(startDate || endDate) ? '期間營業額' : '總營業額'}</th>
                            <th className="py-3 px-4">{(startDate || endDate) ? '期間佣金' : '累積佣金'}</th>
                            <th className="py-3 px-4">待確認</th>
                            <th className="py-3 px-4">可結算</th>
                            <th className="py-3 px-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {affiliates.map((aff) => (
                            <tr key={aff.id} className="border-b hover:bg-gray-50 group">
                                <td className="py-3 px-4">
                                    <div className="font-medium text-gray-900 group-hover:text-blue-600">
                                        <a href={`/admin/affiliates/${aff.id}`}>{aff.first_name} {aff.last_name}</a>
                                    </div>
                                    <div className="text-gray-500 text-xs">{aff.email}</div>
                                </td>
                                <td className="py-3 px-4">
                                    <StatusBadge status={aff.status} />
                                </td>
                                <td className="py-3 px-4 font-medium text-blue-600">
                                    ${(aff as any).period_sales || 0}
                                </td>
                                <td className="py-3 px-4 font-medium text-indigo-600">
                                    ${(aff as any).period_commission || 0}
                                </td>
                                <td className="py-3 px-4 font-medium text-orange-600">
                                    ${aff.pending_balance || 0}
                                </td>
                                <td className="py-3 px-4 font-medium text-green-600">
                                    ${aff.captured_balance || 0}
                                </td>
                                <td className="py-3 px-4 text-right gap-2 flex justify-end">
                                    <a href={`/${countryCode}/affiliate/manager/${aff.id}`} className="mr-2 btn-secondary text-xs px-2 py-1 border rounded hover:bg-gray-100">
                                        詳細
                                    </a>
                                    <a href={`/${countryCode}/affiliate/manager/${aff.id}?tab=promo-codes`} className="btn-secondary text-xs px-2 py-1 border rounded hover:bg-gray-100">
                                        折扣碼
                                    </a>
                                    {aff.status === 'pending' && (
                                        <>
                                            <button className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700" onClick={() => handleUpdateStatus(aff.id, 'active')}>通過</button>
                                            <button className="ml-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleUpdateStatus(aff.id, 'rejected')}>拒絕</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Commission Update Modal */}
            {editingAffiliate && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setEditingAffiliate(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                            <h2 className="text-xl font-bold">調整佣金比例</h2>
                            <p className="text-blue-100 text-sm">Adjust Commission Rate</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="mb-2">
                                <p className="text-gray-700 font-medium">{editingAffiliate.first_name} {editingAffiliate.last_name}</p>
                                <p className="text-gray-500 text-sm">{editingAffiliate.email}</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700">
                                    新的佣金比例 (%)
                                </label>
                                <input
                                    id="commission_rate"
                                    type="number"
                                    value={newCommissionRate}
                                    onChange={(e) => setNewCommissionRate(e.target.value)}
                                    placeholder="例如: 10"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500">
                                    目前比例: {(editingAffiliate.commission_rate * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                            <button
                                onClick={() => setEditingAffiliate(null)}
                                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-100 transition"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleUpdateCommission}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                儲存變更
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Create Promo Codes Modal */}
            {showBulkModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setShowBulkModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 text-white">
                            <h2 className="text-xl font-bold">批次建立折扣碼</h2>
                            <p className="text-purple-100 text-sm">為所有尚無折扣碼的活躍推廣者建立折扣碼</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    折扣類型
                                </label>
                                <select
                                    value={bulkDiscountType}
                                    onChange={(e) => setBulkDiscountType(e.target.value as "percentage" | "fixed")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="percentage">百分比折扣</option>
                                    <option value="fixed">固定金額折扣</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {bulkDiscountType === "percentage" ? "折扣比例 (%)" : "折扣金額 ($)"}
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={bulkDiscountValue}
                                    onChange={(e) => setBulkDiscountValue(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder={bulkDiscountType === "percentage" ? "10" : "100"}
                                />
                                <p className="text-xs text-gray-500">
                                    {bulkDiscountType === "percentage"
                                        ? "顧客使用折扣碼時獲得的折扣百分比"
                                        : "顧客使用折扣碼時獲得的固定折扣金額"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    佣金比例 (%)
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={bulkCommissionRate}
                                    onChange={(e) => setBulkCommissionRate(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="10"
                                />
                                <p className="text-xs text-gray-500">推廣者從每筆訂單獲得的佣金百分比</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                            <button
                                onClick={() => setShowBulkModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-100 transition"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleBulkCreatePromoCodes}
                                disabled={bulkCreating}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                            >
                                {bulkCreating ? '建立中...' : '確認建立'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    )
}

function StatusBadge({ status }: { status: string }) {
    let color: 'green' | 'red' | 'orange' | 'grey' = 'grey'
    let label = status
    if (status === 'active') { color = 'green'; label = '啟用中' }
    if (status === 'pending') { color = 'orange'; label = '待審核' }
    if (status === 'rejected') { color = 'red'; label = '已拒絕' }
    if (status === 'suspended') { color = 'red'; label = '已停權' }

    return <Badge color={color}>{label}</Badge>
}


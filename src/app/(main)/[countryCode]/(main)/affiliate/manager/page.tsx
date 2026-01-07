'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button, Container, Heading, Badge } from '@medusajs/ui'


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

    const fetchData = async () => {
        try {
            // Fetch list
            const resList = await fetch('/api/admin/affiliates')
            const listData = await resList.json()
            setAffiliates(listData.affiliates || [])

            // Fetch stats
            const resStats = await fetch('/api/admin/affiliates/stats')
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
    }, [])

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        if (!confirm(`確定要將狀態更改為 ${newStatus}?`)) return
        try {
            await fetch(`/api/admin/affiliates/${id}`, {
                method: 'POST', body: JSON.stringify({ status: newStatus })
            })
            fetchData() // Refresh both list and stats
        } catch (e) { alert('更新失敗') }
    }

    const handleUpdateCommission = async (id: string, currentRate: number) => {
        const input = prompt('請輸入新的佣金比例 (0.1 = 10%)', currentRate.toString())
        if (!input) return
        const newRate = parseFloat(input)
        if (isNaN(newRate)) return
        await fetch(`/api/admin/affiliates/${id}`, {
            method: 'POST', body: JSON.stringify({ commission_rate: newRate })
        })
        fetchData()
    }

    if (loading) return <div className="p-8">載入中...</div>

    return (
        <Container>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Heading>總覽 & 推廣者列表</Heading>
                    <p className="text-ui-fg-subtle text-sm mt-1">管理所有聯盟行銷夥伴</p>
                </div>
                <Button onClick={fetchData} variant="secondary">重新整理</Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-ui-bg-base border rounded-lg">
                    <div className="text-xs text-ui-fg-subtle uppercase font-medium">總推廣營收 (All Time)</div>
                    <div className="text-2xl font-bold mt-2">${stats.total_commission_all_time.toFixed(0)}</div>
                </div>
                <div className="p-4 bg-ui-bg-base border rounded-lg">
                    <div className="text-xs text-ui-fg-subtle uppercase font-medium">待發佣金 (Pending)</div>
                    <div className="text-2xl font-bold mt-2 text-orange-600">${stats.total_commission_pending.toFixed(0)}</div>
                </div>
                <div className="p-4 bg-ui-bg-base border rounded-lg">
                    <div className="text-xs text-ui-fg-subtle uppercase font-medium">已發佣金 (Paid)</div>
                    <div className="text-2xl font-bold mt-2 text-green-600">${stats.total_commission_paid.toFixed(0)}</div>
                </div>
                <div className="p-4 bg-ui-bg-base border rounded-lg">
                    <div className="text-xs text-ui-fg-subtle uppercase font-medium">活躍推廣者</div>
                    <div className="text-2xl font-bold mt-2">{stats.active_affiliates} / {stats.total_affiliates}</div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-ui-bg-base border-b">
                        <tr>
                            <th className="py-3 px-4">姓名 / Email</th>
                            <th className="py-3 px-4">狀態</th>
                            <th className="py-3 px-4">佣金比例</th>
                            <th className="py-3 px-4">營業額</th>
                            <th className="py-3 px-4">待確認</th>
                            <th className="py-3 px-4">可結算</th>
                            <th className="py-3 px-4">累積收益</th>
                            <th className="py-3 px-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {affiliates.map((aff) => (
                            <tr key={aff.id} className="border-b hover:bg-ui-bg-subtle group">
                                <td className="py-3 px-4">
                                    <div className="font-medium text-ui-fg-base group-hover:text-blue-600">
                                        <a href={`/admin/affiliates/${aff.id}`}>{aff.first_name} {aff.last_name}</a>
                                    </div>
                                    <div className="text-ui-fg-subtle text-xs">{aff.email}</div>
                                </td>
                                <td className="py-3 px-4">
                                    <StatusBadge status={aff.status} />
                                </td>
                                <td className="py-3 px-4">
                                    {(aff.commission_rate * 100).toFixed(1)}%
                                </td>
                                <td className="py-3 px-4 font-medium text-blue-600">
                                    ${aff.total_sales || 0}
                                </td>
                                <td className="py-3 px-4 font-medium text-orange-600">
                                    ${aff.pending_balance || 0}
                                </td>
                                <td className="py-3 px-4 font-medium text-green-600">
                                    ${aff.captured_balance || 0}
                                </td>
                                <td className="py-3 px-4 text-ui-fg-subtle">
                                    ${aff.total_earnings}
                                </td>
                                <td className="py-3 px-4 text-right gap-2 flex justify-end">
                                    <a href={`/${countryCode}/affiliate/manager/${aff.id}`} className="mr-2 btn-secondary text-xs px-2 py-1 border rounded hover:bg-gray-100">
                                        詳細
                                    </a>
                                    <Button size="small" variant="secondary" onClick={() => handleUpdateCommission(aff.id, aff.commission_rate)}>
                                        調佣
                                    </Button>
                                    {aff.status === 'pending' && (
                                        <Button size="small" className="ml-2 bg-green-600 text-white" onClick={() => handleUpdateStatus(aff.id, 'active')}>通過</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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

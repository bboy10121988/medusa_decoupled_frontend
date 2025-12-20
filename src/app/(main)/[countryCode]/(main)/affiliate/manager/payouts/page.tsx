'use client'

import { useState, useEffect } from 'react'
import { Container, Heading, Button, Table, Badge } from '@medusajs/ui'

type Affiliate = {
    id: string
    email: string
    first_name: string
    last_name: string
    balance: number
    settings: any
}

export default function PayoutsPage() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([])
    const [loading, setLoading] = useState(true)

    const fetchUnpaidAffiliates = async () => {
        try {
            // In a real app, backend should support filtering by balance > 0
            // Here we fetch all and filter in client (MVP)
            const res = await fetch('/api/admin/affiliates?take=9999')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()

            // Filter only those with balance > 0
            const unpaid = (data.affiliates || []).filter((a: Affiliate) => Number(a.balance) > 0)
            setAffiliates(unpaid)
        } catch (error) {
            console.error(error)
            alert('無法載入列表')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnpaidAffiliates()
    }, [])

    const handleSettle = async (aff: Affiliate) => {
        if (!confirm(`確定已向 ${aff.first_name || aff.email} 支付 $${aff.balance}? \n(此操作將歸零其系統餘額)`)) return

        try {
            const res = await fetch(`/api/admin/affiliates/${aff.id}/settle`, { method: 'POST' })
            if (res.ok) {
                alert('結算成功')
                fetchUnpaidAffiliates()
            } else {
                throw new Error('Settlement failed')
            }
        } catch (e) {
            alert('結算失敗')
        }
    }

    if (loading) return <div className="p-8">載入中...</div>

    return (
        <Container>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Heading>撥款管理 (Payouts)</Heading>
                    <p className="text-ui-fg-subtle text-sm mt-1">查看並結算所有待發佣金</p>
                </div>
                <Button onClick={fetchUnpaidAffiliates} variant="secondary">重新整理</Button>
            </div>

            {affiliates.length === 0 ? (
                <div className="text-center py-12 bg-ui-bg-subtle rounded border border-dashed">
                    <p className="text-ui-fg-subtle">目前沒有待發佣金 (No pending payouts)</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>推廣者</Table.HeaderCell>
                                <Table.HeaderCell>支付設定 (Settings)</Table.HeaderCell>
                                <Table.HeaderCell>待發金額 (Balance)</Table.HeaderCell>
                                <Table.HeaderCell className="text-right">操作</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {affiliates.map((aff) => (
                                <Table.Row key={aff.id}>
                                    <Table.Cell>
                                        <div className="font-medium">{aff.first_name} {aff.last_name}</div>
                                        <div className="text-xs text-ui-fg-subtle">{aff.email}</div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {aff.settings?.paypal_email ? (
                                            <div className="flex items-center gap-2">
                                                <Badge>PayPal</Badge> {aff.settings.paypal_email}
                                            </div>
                                        ) : (
                                            <span className="text-ui-fg-subtle italic">未設定</span>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="text-lg font-bold text-orange-600">${aff.balance}</span>
                                    </Table.Cell>
                                    <Table.Cell className="text-right">
                                        <Button onClick={() => handleSettle(aff)}>標記為已支付 (Settle)</Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            )}
        </Container>
    )
}

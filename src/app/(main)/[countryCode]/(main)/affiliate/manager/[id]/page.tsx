'use client'

import { useState, useEffect } from 'react'
import { Container, Heading, Badge, Button, Table, Tabs } from '@medusajs/ui'
import { useParams } from 'next/navigation'

export default function AffiliateDetailPage() {
    const { id } = useParams()
    const [affiliate, setAffiliate] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchAffiliate = async () => {
        try {
            const res = await fetch(`/api/admin/affiliates/${id}`)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setAffiliate(data.affiliate)
        } catch (error) {
            console.error(error)
            alert('無法載入推廣者資料')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchAffiliate()
    }, [id])

    const handleSettle = async () => {
        if (!confirm(`確定已向 ${affiliate.first_name || affiliate.email} 轉帳 ${affiliate.balance} 並歸零餘額？`)) return

        try {
            const res = await fetch(`/api/admin/affiliates/${id}/settle`, { method: 'POST' })
            if (res.ok) {
                alert('結算成功')
                fetchAffiliate()
            } else {
                throw new Error('Settlement failed')
            }
        } catch (e) {
            alert('結算失敗')
        }
    }

    if (loading) return <div className="p-8">載入中...</div>
    if (!affiliate) return <div className="p-8">找不到此推廣者</div>

    return (
        <Container>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Heading>{affiliate.first_name} {affiliate.last_name}</Heading>
                        <StatusBadge status={affiliate.status} />
                        <Badge color="blue">佣金: {(affiliate.commission_rate * 100).toFixed(1)}%</Badge>
                    </div>
                    <div className="text-ui-fg-subtle text-sm mt-1">{affiliate.email}</div>
                    {affiliate.phone && <div className="text-ui-fg-subtle text-sm">{affiliate.phone}</div>}
                </div>
                <div className="text-right">
                    <div className="text-sm text-ui-fg-subtle mb-1">待發餘額</div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">${affiliate.balance}</div>
                    {affiliate.balance > 0 && (
                        <Button variant="primary" onClick={handleSettle}>手動結算 (Mark as Paid)</Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-ui-bg-subtle rounded border">
                    <div className="text-xs font-medium text-ui-fg-subtle">累積總收益</div>
                    <div className="text-xl font-bold">${affiliate.total_earnings}</div>
                </div>
                <div className="p-4 bg-ui-bg-subtle rounded border">
                    <div className="text-xs font-medium text-ui-fg-subtle">註冊時間</div>
                    <div className="text-xl font-bold">{new Date(affiliate.created_at).toLocaleDateString()}</div>
                </div>
            </div>

            <Tabs defaultValue="links">
                <Tabs.List className="mb-4">
                    <Tabs.Trigger value="links">推廣連結 ({affiliate.links?.length || 0})</Tabs.Trigger>
                    <Tabs.Trigger value="conversions">成交紀錄 ({affiliate.conversions?.length || 0})</Tabs.Trigger>
                    <Tabs.Trigger value="payouts">撥款紀錄 ({affiliate.settlements?.length || 0})</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="links">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>代碼 (Code)</Table.HeaderCell>
                                <Table.HeaderCell>連結 (URL)</Table.HeaderCell>
                                <Table.HeaderCell>點擊數</Table.HeaderCell>
                                <Table.HeaderCell>轉換數</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {affiliate.links?.map((link: any) => (
                                <Table.Row key={link.id}>
                                    <Table.Cell>{link.code}</Table.Cell>
                                    <Table.Cell className="truncate max-w-[200px]">{link.url}</Table.Cell>
                                    <Table.Cell>{link.clicks}</Table.Cell>
                                    <Table.Cell>{link.conversions}</Table.Cell>
                                </Table.Row>
                            ))}
                            {!affiliate.links?.length && <Table.Row><Table.Cell colSpan={4} className="text-center text-ui-fg-subtle">無資料</Table.Cell></Table.Row>}
                        </Table.Body>
                    </Table>
                </Tabs.Content>

                <Tabs.Content value="conversions">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>訂單編號</Table.HeaderCell>
                                <Table.HeaderCell>訂單金額</Table.HeaderCell>
                                <Table.HeaderCell>佣金</Table.HeaderCell>
                                <Table.HeaderCell>狀態</Table.HeaderCell>
                                <Table.HeaderCell>日期</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {affiliate.conversions?.map((conv: any) => (
                                <Table.Row key={conv.id}>
                                    <Table.Cell>{conv.order_id}</Table.Cell>
                                    <Table.Cell>${conv.amount}</Table.Cell>
                                    <Table.Cell className="font-bold text-green-600">+${conv.commission}</Table.Cell>
                                    <Table.Cell>{conv.status}</Table.Cell>
                                    <Table.Cell>{new Date(conv.created_at).toLocaleDateString()}</Table.Cell>
                                </Table.Row>
                            ))}
                            {!affiliate.conversions?.length && <Table.Row><Table.Cell colSpan={5} className="text-center text-ui-fg-subtle">無資料</Table.Cell></Table.Row>}
                        </Table.Body>
                    </Table>
                </Tabs.Content>

                <Tabs.Content value="payouts">
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>金額</Table.HeaderCell>
                                <Table.HeaderCell>貨幣</Table.HeaderCell>
                                <Table.HeaderCell>狀態</Table.HeaderCell>
                                <Table.HeaderCell>日期</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {affiliate.settlements?.map((stm: any) => (
                                <Table.Row key={stm.id}>
                                    <Table.Cell className="font-bold">${stm.amount}</Table.Cell>
                                    <Table.Cell>{stm.currency_code}</Table.Cell>
                                    <Table.Cell><Badge color="green">{stm.status}</Badge></Table.Cell>
                                    <Table.Cell>{new Date(stm.created_at).toLocaleDateString()}</Table.Cell>
                                </Table.Row>
                            ))}
                            {!affiliate.settlements?.length && <Table.Row><Table.Cell colSpan={4} className="text-center text-ui-fg-subtle">無資料</Table.Cell></Table.Row>}
                        </Table.Body>
                    </Table>
                </Tabs.Content>
            </Tabs>

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

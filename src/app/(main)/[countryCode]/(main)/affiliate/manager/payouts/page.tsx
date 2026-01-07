'use client'

import { useState, useEffect } from 'react'
import { Container, Heading, Button, Table, Badge, toast, Toaster } from '@medusajs/ui'

type Affiliate = {
    id: string
    email: string
    first_name: string
    last_name: string
    balance: number
    captured_balance: number
    settings: any
}

export default function PayoutsPage() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([])
    const [loading, setLoading] = useState(true)
    const [settlingId, setSettlingId] = useState<string | null>(null)
    const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null)

    const fetchUnpaidAffiliates = async () => {
        try {
            const res = await fetch('/api/admin/affiliates?take=9999')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()

            const unpaid = (data.affiliates || []).filter((a: Affiliate) => Number(a.captured_balance || a.balance) > 0)
            setAffiliates(unpaid)
        } catch (error) {
            console.error(error)
            toast.error('無法載入列表')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnpaidAffiliates()
    }, [])

    const handleSettle = async () => {
        if (!selectedAffiliate) return

        const aff = selectedAffiliate
        setSettlingId(aff.id)
        setSelectedAffiliate(null)

        try {
            const res = await fetch(`/api/admin/affiliates/${aff.id}/settle`, { method: 'POST' })
            if (res.ok) {
                toast.success(`已成功為 ${aff.first_name || aff.email} 完成結算`)
                fetchUnpaidAffiliates()
            } else {
                throw new Error('Settlement failed')
            }
        } catch (e) {
            toast.error('結算失敗')
        } finally {
            setSettlingId(null)
        }
    }

    if (loading) return <div className="p-8">載入中...</div>

    return (
        <Container>
            <Toaster />
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
                                <Table.HeaderCell>可結算金額 (Settlable)</Table.HeaderCell>
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
                                        <span className="text-lg font-bold text-green-600">${aff.captured_balance || aff.balance}</span>
                                    </Table.Cell>
                                    <Table.Cell className="text-right">
                                        <button
                                            onClick={() => {
                                                console.log('Button clicked for affiliate:', aff.id, aff.first_name)
                                                alert('Button clicked! Setting selectedAffiliate...')
                                                setSelectedAffiliate(aff)
                                            }}
                                            disabled={settlingId === aff.id}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                        >
                                            {settlingId === aff.id ? '處理中...' : '標記為已支付 (Settle)'}
                                        </button>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            )}

            {/* Custom Modal */}
            {selectedAffiliate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setSelectedAffiliate(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                            <h2 className="text-xl font-bold">確認撥款支付</h2>
                            <p className="text-blue-100 text-sm">Confirm Payout</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Recipient Info */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">支付對象</h3>
                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">推廣者名稱</p>
                                            <p className="font-medium text-lg">{selectedAffiliate.first_name} {selectedAffiliate.last_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">電子郵件</p>
                                            <p className="font-medium">{selectedAffiliate.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">收款資訊</h3>
                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    {selectedAffiliate.settings?.payoutMethod === 'bank_transfer' ? (
                                        <div className="space-y-3">
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">銀行轉帳</span>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">銀行名稱</p>
                                                    <p className="font-medium">{selectedAffiliate.settings?.bankAccount?.bankName || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">分行</p>
                                                    <p className="font-medium">{selectedAffiliate.settings?.bankAccount?.branch || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">帳戶名稱</p>
                                                    <p className="font-medium">{selectedAffiliate.settings?.bankAccount?.accountName || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">帳號</p>
                                                    <p className="font-medium font-mono text-blue-600">{selectedAffiliate.settings?.bankAccount?.accountNumber || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (selectedAffiliate.settings?.payoutMethod === 'paypal' || selectedAffiliate.settings?.paypal_email) ? (
                                        <div className="space-y-2">
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">PayPal</span>
                                            <div>
                                                <p className="text-xs text-gray-500">PayPal 帳號/Email</p>
                                                <p className="font-medium text-lg text-blue-600">{selectedAffiliate.settings?.paypal_email || selectedAffiliate.settings?.paypalEmail}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-center py-2">此用戶尚未設定收款資訊</p>
                                    )}
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200 flex justify-between items-center">
                                <div>
                                    <p className="text-green-800 font-semibold">本次結算總金額</p>
                                    <p className="text-green-600 text-xs">確認支付後，相關訂單將標記為已結算</p>
                                </div>
                                <p className="text-3xl font-bold text-green-700">
                                    ${selectedAffiliate.captured_balance ?? selectedAffiliate.balance}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                            <button
                                onClick={() => setSelectedAffiliate(null)}
                                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-100 transition"
                            >
                                取消 (Cancel)
                            </button>
                            <button
                                onClick={handleSettle}
                                disabled={settlingId === selectedAffiliate.id}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {settlingId === selectedAffiliate.id ? '處理中...' : '確認已完成支付'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    )
}

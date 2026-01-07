'use client'

import { useState, useEffect } from 'react'
import { Container, Heading, Badge, Button, Table, Tabs, toast, Toaster } from '@medusajs/ui'
import { useParams } from 'next/navigation'

export default function AffiliateDetailPage() {
    const { id } = useParams()
    const [affiliate, setAffiliate] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [settling, setSettling] = useState(false)
    const [showSettlePrompt, setShowSettlePrompt] = useState(false)
    const [showCommissionModal, setShowCommissionModal] = useState(false)
    const [newCommissionRate, setNewCommissionRate] = useState('')

    const fetchAffiliate = async () => {
        try {
            const res = await fetch(`/api/admin/affiliates/${id}`)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setAffiliate(data.affiliate)
            if (data.affiliate) {
                setNewCommissionRate((data.affiliate.commission_rate * 100).toString())
            }
        } catch (error) {
            console.error(error)
            toast.error('無法載入推廣者資料')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchAffiliate()
    }, [id])

    const handleSettle = async () => {
        setSettling(true)
        setShowSettlePrompt(false)

        try {
            const res = await fetch(`/api/admin/affiliates/${id}/settle`, { method: 'POST' })
            if (res.ok) {
                toast.success('結算成功')
                fetchAffiliate()
            } else {
                throw new Error('Settlement failed')
            }
        } catch (e) {
            toast.error('結算失敗')
        } finally {
            setSettling(false)
        }
    }

    const handleUpdateCommission = async () => {
        const newRate = parseFloat(newCommissionRate)
        if (isNaN(newRate) || newRate < 0 || newRate > 100) {
            toast.error('請輸入有效的數字 (0-100)')
            return
        }

        try {
            const res = await fetch(`/api/admin/affiliates/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commission_rate: newRate / 100 })
            })

            if (res.ok) {
                toast.success('佣金比例已更新')
                setShowCommissionModal(false)
                fetchAffiliate()
            } else {
                throw new Error('Update failed')
            }
        } catch (e) {
            console.error(e)
            toast.error('更新失敗')
        }
    }

    if (loading) return <div className="p-8">載入中...</div>
    if (!affiliate) return <div className="p-8">找不到此推廣者</div>

    return (
        <Container>
            <Toaster />
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <Heading>{affiliate.first_name} {affiliate.last_name}</Heading>
                        <StatusBadge status={affiliate.status} />
                        <div className="flex items-center gap-2">
                            <Badge color="blue">佣金: {(affiliate.commission_rate * 100).toFixed(1)}%</Badge>
                            <button
                                onClick={() => setShowCommissionModal(true)}
                                className="text-ui-fg-subtle hover:text-ui-fg-base p-1"
                                title="調整佣金"
                            >
                                ✏️
                            </button>
                        </div>
                    </div>
                    <div className="text-ui-fg-subtle text-sm mt-1">{affiliate.email}</div>
                    {affiliate.phone && <div className="text-ui-fg-subtle text-sm">{affiliate.phone}</div>}
                </div>
                <div className="text-right">
                    <div className="text-sm text-ui-fg-subtle mb-1">可結算金額</div>
                    <div className="text-3xl font-bold text-green-600 mb-2">${affiliate.captured_balance ?? affiliate.balance}</div>
                    {(affiliate.captured_balance ?? affiliate.balance) > 0 && (
                        <Button variant="primary" onClick={() => setShowSettlePrompt(true)} isLoading={settling}>
                            手動結算 (Mark as Paid)
                        </Button>
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

            {/* Settle Modal */}
            {showSettlePrompt && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setShowSettlePrompt(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                            <h2 className="text-xl font-bold">確認撥款支付</h2>
                            <p className="text-blue-100 text-sm">Confirm Payout</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">支付對象</h3>
                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">推廣者名稱</p>
                                            <p className="font-medium text-lg">{affiliate.first_name} {affiliate.last_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">電子郵件</p>
                                            <p className="font-medium">{affiliate.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">收款資訊</h3>
                                <div className="bg-gray-50 rounded-lg p-4 border">
                                    {affiliate.settings?.payoutMethod === 'bank_transfer' ? (
                                        <div className="space-y-3">
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">銀行轉帳</span>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">銀行名稱</p>
                                                    <p className="font-medium">{affiliate.settings?.bankAccount?.bankName || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">分行</p>
                                                    <p className="font-medium">{affiliate.settings?.bankAccount?.branch || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">帳戶名稱</p>
                                                    <p className="font-medium">{affiliate.settings?.bankAccount?.accountName || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">帳號</p>
                                                    <p className="font-medium font-mono text-blue-600">{affiliate.settings?.bankAccount?.accountNumber || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (affiliate.settings?.payoutMethod === 'paypal' || affiliate.settings?.paypal_email) ? (
                                        <div className="space-y-2">
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">PayPal</span>
                                            <div>
                                                <p className="text-xs text-gray-500">PayPal 帳號/Email</p>
                                                <p className="font-medium text-lg text-blue-600">{affiliate.settings?.paypal_email || affiliate.settings?.paypalEmail}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic text-center py-2">此用戶尚未設定收款資訊</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4 border border-green-200 flex justify-between items-center">
                                <div>
                                    <p className="text-green-800 font-semibold">本次結算總金額</p>
                                    <p className="text-green-600 text-xs">確認支付後，相關訂單將標記為已結算</p>
                                </div>
                                <p className="text-3xl font-bold text-green-700">
                                    ${affiliate.captured_balance ?? affiliate.balance}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                            <button
                                onClick={() => setShowSettlePrompt(false)}
                                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-100 transition"
                            >
                                取消 (Cancel)
                            </button>
                            <button
                                onClick={handleSettle}
                                disabled={settling}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {settling ? '處理中...' : '確認已完成支付'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Commission Update Modal */}
            {showCommissionModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    onClick={() => setShowCommissionModal(false)}
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
                                    目前比例: {(affiliate.commission_rate * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                            <button
                                onClick={() => setShowCommissionModal(false)}
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


            <Tabs defaultValue="settings">
                <Tabs.List className="mb-4">
                    <Tabs.Trigger value="settings">基本資料</Tabs.Trigger>
                    <Tabs.Trigger value="links">推廣連結 ({affiliate.links?.length || 0})</Tabs.Trigger>
                    <Tabs.Trigger value="conversions">成交紀錄 ({affiliate.conversions?.length || 0})</Tabs.Trigger>
                    <Tabs.Trigger value="payouts">撥款紀錄 ({affiliate.settlements?.length || 0})</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="settings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Info */}
                        <div className="p-6 bg-white rounded-lg border">
                            <h3 className="text-lg font-medium mb-4">個人/公司資料</h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">顯示名稱</dt>
                                    <dd className="font-medium">{affiliate.settings?.displayName || '-'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">公司名稱</dt>
                                    <dd className="font-medium">{affiliate.settings?.profile?.company || '-'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">統一編號</dt>
                                    <dd className="font-medium">{affiliate.settings?.profile?.taxId || '-'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">聯絡電話</dt>
                                    <dd className="font-medium">{affiliate.settings?.profile?.phone || '-'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">網站</dt>
                                    <dd className="font-medium">{affiliate.settings?.website || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500 mb-1">地址</dt>
                                    <dd className="font-medium bg-gray-50 p-2 rounded">{affiliate.settings?.profile?.address || '-'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Payment Info */}
                        <div className="p-6 bg-white rounded-lg border">
                            <h3 className="text-lg font-medium mb-4">收款設定</h3>
                            <div className="mb-4">
                                <span className="text-sm text-gray-500">收款方式: </span>
                                <Badge color="blue" className="ml-2">
                                    {affiliate.settings?.payoutMethod === 'bank_transfer' && '銀行轉帳'}
                                    {affiliate.settings?.payoutMethod === 'paypal' && 'PayPal'}
                                    {affiliate.settings?.payoutMethod === 'stripe' && 'Stripe'}
                                    {!affiliate.settings?.payoutMethod && '未設定'}
                                </Badge>
                            </div>

                            {affiliate.settings?.payoutMethod === 'bank_transfer' && (
                                <dl className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">銀行名稱</dt>
                                        <dd className="font-medium">{affiliate.settings?.bankAccount?.bankName}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">分行</dt>
                                        <dd className="font-medium">{affiliate.settings?.bankAccount?.branch || '-'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">帳戶名稱</dt>
                                        <dd className="font-medium">{affiliate.settings?.bankAccount?.accountName}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">帳號</dt>
                                        <dd className="font-medium font-mono bg-gray-50 px-2 py-0.5 rounded">
                                            {affiliate.settings?.bankAccount?.accountNumber}
                                        </dd>
                                    </div>
                                </dl>
                            )}

                            {affiliate.settings?.payoutMethod === 'paypal' && (
                                <dl className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">PayPal Email</dt>
                                        <dd className="font-medium">{affiliate.settings?.paypalEmail}</dd>
                                    </div>
                                </dl>
                            )}

                            {affiliate.settings?.payoutMethod === 'stripe' && (
                                <dl className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Stripe ID</dt>
                                        <dd className="font-medium">{affiliate.settings?.stripeAccountId}</dd>
                                    </div>
                                </dl>
                            )}

                            {!affiliate.settings?.payoutMethod && (
                                <div className="text-sm text-gray-500">
                                    此用戶尚未設定收款資訊
                                </div>
                            )}
                        </div>
                    </div>
                </Tabs.Content>

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
                            {!affiliate.links?.length && <Table.Row>
                                {/* @ts-expect-error: colSpan is valid DOM attribute but missing in types */}
                                <Table.Cell colSpan={4} className="text-center text-ui-fg-subtle">無資料</Table.Cell>
                            </Table.Row>}
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
                            {!affiliate.conversions?.length && <Table.Row>
                                {/* @ts-expect-error: colSpan is valid DOM attribute but missing in types */}
                                <Table.Cell colSpan={5} className="text-center text-ui-fg-subtle">無資料</Table.Cell>
                            </Table.Row>}
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
                            {!affiliate.settlements?.length && <Table.Row>
                                {/* @ts-expect-error: colSpan is valid DOM attribute but missing in types */}
                                <Table.Cell colSpan={4} className="text-center text-ui-fg-subtle">無資料</Table.Cell>
                            </Table.Row>}
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

'use client'

import { useState } from 'react'
import { Button, Input, Label, Text } from '@medusajs/ui'

// 暫時內嵌類型定義
type AffiliateLink = {
    id: string
    name: string
    code: string
    url: string
    createdAt: string
    clicks: number
    conversions: number
}

interface LinkListProps {
    links: AffiliateLink[]
    affiliateCode: string
}

interface LinkGeneratorFormProps {
    affiliateCode?: string
}

export function LinkGeneratorForm({ affiliateCode }: LinkGeneratorFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [linkName, setLinkName] = useState('')
    const [targetUrl, setTargetUrl] = useState('')
    const [utmSource, setUtmSource] = useState('')
    const [utmMedium, setUtmMedium] = useState('')
    const [utmCampaign, setUtmCampaign] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('[LinkGenerator DEBUG] Submitting form with:', { linkName, targetUrl })

        if (!linkName.trim()) {
            alert('請輸入連結名稱')
            return
        }
        if (!targetUrl.trim()) {
            alert('請輸入目標網址')
            return
        }

        setIsLoading(true)
        try {


            // 構建完整的目標網址（包含 UTM 參數）
            const url = new URL(targetUrl, window.location.origin)

            // 注意：我們不需要在這裡加上 ref，因為後端會生成唯一的 link code
            // 並且前端展示時會使用那個 unique code

            if (utmSource) url.searchParams.set('utm_source', utmSource)
            if (utmMedium) url.searchParams.set('utm_medium', utmMedium)
            if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign)

            const response = await fetch('/api/affiliate/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url.toString(),
                    metadata: {
                        name: linkName, // Store display name in metadata
                        originalUrl: targetUrl,
                        utmParams: {
                            utm_source: utmSource,
                            utm_medium: utmMedium,
                            utm_campaign: utmCampaign
                        }
                    }
                })
            })

            if (response.ok) {
                // 重置表單
                setLinkName('')
                setTargetUrl('')
                setUtmSource('')
                setUtmMedium('')
                setUtmCampaign('')

                // 重新整理頁面以顯示新連結
                window.location.reload()
            } else {
                const errorData = await response.json().catch(() => ({}))
                const errorMessage = errorData.error || `創建連結失敗 (${response.status})`
                alert(errorMessage)
            }
        } catch (error) {
            // console.error('Error creating link:', error)
            alert('創建連結時發生錯誤：' + (error as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-6 bg-white">
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="linkName">連結名稱 (用於報表識別) *</Label>
                    <Input
                        id="linkName"
                        type="text"
                        value={linkName}
                        onChange={(e) => setLinkName(e.target.value)}
                        placeholder="例如：首頁推廣"
                        required
                    />
                    <Text className="text-ui-fg-subtle text-xs mt-1">
                        請輸入易於識別的名稱，請勿與您的聯盟代碼 ({affiliateCode || 'Code'}) 重複。
                    </Text>
                </div>

                <div>
                    <Label htmlFor="targetUrl">目標網址 *</Label>
                    <Input
                        id="targetUrl"
                        type="url"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="例如：https://timsfantasyworld.com/tw/"
                        required
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div>
                    <Label htmlFor="utmSource">UTM Source</Label>
                    <Input
                        id="utmSource"
                        type="text"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        placeholder="affiliate"
                    />
                </div>

                <div>
                    <Label htmlFor="utmMedium">UTM Medium</Label>
                    <Input
                        id="utmMedium"
                        type="text"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        placeholder="referral"
                    />
                </div>

                <div>
                    <Label htmlFor="utmCampaign">UTM Campaign</Label>
                    <Input
                        id="utmCampaign"
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        placeholder="default"
                    />
                </div>
            </div>

            <div className="pt-2">
                <Button
                    type="submit"
                    className="w-full"
                >
                    {isLoading ? '創建中...' : '創建推廣連結'}
                </Button>
            </div>
        </form>
    )
}

export function LinkList({ links, affiliateCode }: LinkListProps) {
    console.log('[LinkList DEBUG] Received links:', JSON.stringify(links, null, 2))
    console.log('[LinkList DEBUG] AffiliateCode:', affiliateCode)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    //...

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const response = await fetch(`/api/affiliate/links?id=${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                window.location.reload()
            } else {
                alert('刪除失敗')
            }
        } catch (error) {
            // console.error('Error deleting link:', error)
            alert('刪除時發生錯誤')
        } finally {
            setDeletingId(null)
        }
    }

    const getShareableUrl = (link: AffiliateLink) => {
        try {
            // 確保 url 有 protocol
            let urlStr = link.url
            if (!urlStr.startsWith('http')) {
                urlStr = `https://${urlStr}`
            }
            const url = new URL(urlStr)

            // 1. ref = 用戶的聯盟代碼 (身分識別)
            if (affiliateCode) {
                url.searchParams.set('ref', affiliateCode)
            }

            // 2. lid = 該連結的唯一代碼 (追蹤識別)
            if (link.code) {
                url.searchParams.set('lid', link.code)
            }

            return url.toString()
        } catch (e) {
            return link.url // Fallback
        }
    }

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            alert('連結已複製到剪貼簿')
        })
    }

    if (links.length === 0) {
        return (
            <div className="rounded-lg border p-8 text-center text-gray-500">
                尚未創建任何推廣連結
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {links.map((link) => (
                <div key={link.id} className="rounded-lg border p-4 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{link.name}</h3>
                            <p className="text-sm text-gray-500 break-all select-all font-mono">{getShareableUrl(link)}</p>
                            <div className="mt-2 flex gap-4 text-xs text-gray-500">
                                <span>點擊次數: {link.clicks}</span>
                                <span>轉換次數: {link.conversions}</span>
                                <span>創建時間: {link.createdAt ? new Date(link.createdAt).toLocaleDateString('zh-TW') : 'N/A'}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => copyToClipboard(getShareableUrl(link))}
                            >
                                複製連結
                            </Button>
                            <Button
                                variant="danger"
                                size="small"
                                onClick={() => handleDelete(link.id)}
                                disabled={deletingId === link.id}
                            >
                                {deletingId === link.id ? '刪除中...' : '刪除'}
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

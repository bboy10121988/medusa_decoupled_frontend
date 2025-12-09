'use client'

import { useState } from 'react'
import { Button, Input, Label } from '@medusajs/ui'

// 暫時內嵌類型定義
type AffiliateLink = {
  id: string
  name: string
  url: string
  createdAt: string
  clicks: number
  conversions: number
}

interface LinkListProps {
  links: AffiliateLink[]
}

export function LinkGeneratorForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [linkName, setLinkName] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkName.trim() || !targetUrl.trim()) return

    setIsLoading(true)
    try {
      // 構建完整的目標網址（包含 UTM 參數）
      const url = new URL(targetUrl, window.location.origin)
      if (utmSource) url.searchParams.set('utm_source', utmSource)
      if (utmMedium) url.searchParams.set('utm_medium', utmMedium)
      if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign)

      const response = await fetch('/api/affiliate/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: linkName, // 後端預期欄位為 code
          url: url.toString(), // 後端預期欄位為 url
          metadata: {
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="linkName">連結名稱 *</Label>
          <Input
            id="linkName"
            type="text"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            placeholder="例如：首頁推廣"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="targetUrl">目標網址 *</Label>
          <Input
            id="targetUrl"
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="例如：/products/special-offer"
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

      <Button
        type="submit"
        disabled={isLoading || !linkName.trim() || !targetUrl.trim()}
        className="w-full"
      >
        {isLoading ? '創建中...' : '創建推廣連結'}
      </Button>
    </form>
  )
}

export function LinkList({ links }: LinkListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
        <div key={link.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{link.name}</h3>
              <p className="text-sm text-gray-500 break-all">{link.url}</p>
              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                <span>點擊次數: {link.clicks}</span>
                <span>轉換次數: {link.conversions}</span>
                <span>創建時間: {new Date(link.createdAt).toLocaleDateString('zh-TW')}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => copyToClipboard(link.url)}
              >
                複製
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

"use client"

import { useState } from 'react'
import { Button, Input, Select, Label, Text } from '@medusajs/ui'
import { CheckCircleSolid } from '@medusajs/icons'

type LinkGeneratorProps = {
  affiliateId: string
}

export default function LinkGenerator({ affiliateId }: LinkGeneratorProps) {
  const [linkConfig, setLinkConfig] = useState({
    name: '',
    targetUrl: '',
    linkType: 'homepage' as 'homepage' | 'product' | 'collection' | 'custom',
    utmSource: 'affiliate',
    utmMedium: 'referral',
    utmCampaign: '',
    productId: '',
    collectionHandle: ''
  })
  
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const generateLink = () => {
    let baseUrl = window.location.origin
    let path = ''
    
    // 根據連結類型構建路徑
    switch (linkConfig.linkType) {
      case 'homepage':
        path = '/tw'
        break
      case 'product':
        path = `/tw/products/${linkConfig.productId}`
        break
      case 'collection':
        path = `/tw/collections/${linkConfig.collectionHandle}`
        break
      case 'custom':
        return linkConfig.targetUrl
    }

    // 構建 UTM 參數
    const params = new URLSearchParams({
      ref: affiliateId, // 聯盟會員 ID
      utm_source: linkConfig.utmSource,
      utm_medium: linkConfig.utmMedium,
      utm_campaign: linkConfig.utmCampaign || linkConfig.name,
      utm_content: linkConfig.linkType,
      affiliate_id: affiliateId // 額外的聯盟識別參數
    })

    return `${baseUrl}${path}?${params.toString()}`
  }

  const handleGenerate = async () => {
    if (!linkConfig.name.trim()) {
      alert('請輸入連結名稱')
      return
    }

    setIsLoading(true)
    
    try {
      const link = generateLink()
      setGeneratedLink(link)
      
      // 保存連結到後端
      await fetch('/api/affiliate/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: linkConfig.name,
          url: link,
          affiliateId,
          linkType: linkConfig.linkType,
          utmParams: {
            source: linkConfig.utmSource,
            medium: linkConfig.utmMedium,
            campaign: linkConfig.utmCampaign || linkConfig.name,
            content: linkConfig.linkType
          }
        }),
      })
      
    } catch (error) {
      console.error('創建連結失敗:', error)
      alert('創建連結失敗，請稍後重試')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  return (
    <div className="max-w-2xl space-y-6 rounded-lg border bg-white p-6">
      <div>
        <Label htmlFor="name">連結名稱 *</Label>
        <Input
          id="name"
          value={linkConfig.name}
          onChange={(e) => setLinkConfig(prev => ({ ...prev, name: e.target.value }))}
          placeholder="例：首頁推廣、夏季活動"
        />
      </div>

      <div>
        <Label htmlFor="linkType">連結類型</Label>
        <Select
          value={linkConfig.linkType}
          onValueChange={(value) => setLinkConfig(prev => ({ ...prev, linkType: value as any }))}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="homepage">首頁</Select.Item>
            <Select.Item value="product">特定商品</Select.Item>
            <Select.Item value="collection">商品分類</Select.Item>
            <Select.Item value="custom">自定義網址</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {linkConfig.linkType === 'product' && (
        <div>
          <Label htmlFor="productId">商品 ID</Label>
          <Input
            id="productId"
            value={linkConfig.productId}
            onChange={(e) => setLinkConfig(prev => ({ ...prev, productId: e.target.value }))}
            placeholder="prod_01XXXXX"
          />
        </div>
      )}

      {linkConfig.linkType === 'collection' && (
        <div>
          <Label htmlFor="collectionHandle">分類代碼</Label>
          <Input
            id="collectionHandle"
            value={linkConfig.collectionHandle}
            onChange={(e) => setLinkConfig(prev => ({ ...prev, collectionHandle: e.target.value }))}
            placeholder="例：summer-collection"
          />
        </div>
      )}

      {linkConfig.linkType === 'custom' && (
        <div>
          <Label htmlFor="targetUrl">目標網址</Label>
          <Input
            id="targetUrl"
            value={linkConfig.targetUrl}
            onChange={(e) => setLinkConfig(prev => ({ ...prev, targetUrl: e.target.value }))}
            placeholder="https://example.com/special-page"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="utmCampaign">活動名稱</Label>
          <Input
            id="utmCampaign"
            value={linkConfig.utmCampaign}
            onChange={(e) => setLinkConfig(prev => ({ ...prev, utmCampaign: e.target.value }))}
            placeholder="例：summer_2024"
          />
        </div>
        <div>
          <Label htmlFor="utmSource">流量來源</Label>
          <Input
            id="utmSource"
            value={linkConfig.utmSource}
            onChange={(e) => setLinkConfig(prev => ({ ...prev, utmSource: e.target.value }))}
            placeholder="affiliate"
          />
        </div>
      </div>

      <Button 
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? '生成中...' : '生成推廣連結'}
      </Button>

      {generatedLink && (
        <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
          <Text className="font-medium">您的推廣連結：</Text>
          <div className="flex items-center gap-2">
            <Input value={generatedLink} readOnly className="flex-1" />
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              size="small"
              disabled={copied}
            >
              {copied ? <CheckCircleSolid className="h-4 w-4" /> : '📋'}
              {copied ? '已複製' : '複製'}
            </Button>
          </div>
          <Text className="text-sm text-gray-600">
            此連結包含您的聯盟 ID ({affiliateId})，當有用戶透過此連結購買商品時，您將獲得佣金。
          </Text>
        </div>
      )}
    </div>
  )
}

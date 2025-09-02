"use client"

import { useState } from 'react'
import { Button, Text } from '@medusajs/ui'
import type { AffiliateLink } from '../../../../types/affiliate'

type LinkListProps = {
  links: AffiliateLink[]
}

export default function LinkList({ links }: LinkListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (link: AffiliateLink) => {
    try {
      await navigator.clipboard.writeText(link.url)
      setCopiedId(link.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  if (links.length === 0) {
    return (
      <div className="rounded-lg border bg-gray-50 p-8 text-center">
        <Text className="text-gray-600">
          您還沒有創建任何推廣連結。使用上方的表單來創建您的第一個推廣連結！
        </Text>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div key={link.id} className="rounded-lg border bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Text className="font-medium">{link.name}</Text>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  推廣中
                </span>
              </div>
              
              <div className="mt-2 break-all rounded bg-gray-50 p-2 text-sm text-gray-700">
                {link.url}
              </div>
              
              <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-medium">{link.clicks}</span> 次點擊
                </div>
                <div>
                  <span className="font-medium">{link.conversions}</span> 次轉換
                </div>
                <div>
                  轉換率: <span className="font-medium">
                    {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="text-xs">
                  創建於 {new Date(link.createdAt).toLocaleDateString('zh-TW')}
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex flex-col gap-2">
              <Button
                onClick={() => copyToClipboard(link)}
                variant="secondary"
                size="small"
                disabled={copiedId === link.id}
              >
                {copiedId === link.id ? '已複製' : '複製連結'}
              </Button>
              
              <Button
                variant="transparent"
                size="small"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm('確定要刪除此連結嗎？此操作無法撤銷。')) {
                    // TODO: 實作刪除連結的邏輯
                    console.log('Delete link:', link.id)
                  }
                }}
              >
                刪除
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Text className="text-sm text-blue-800">
          💡 <strong>推廣技巧：</strong>
        </Text>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>• 在社群媒體分享時，可以加上個人推薦文案提高轉換率</li>
          <li>• 建議針對不同平台使用不同的連結名稱，方便追蹤成效</li>
          <li>• 定期檢查連結的點擊和轉換數據，優化推廣策略</li>
        </ul>
      </div>
    </div>
  )
}

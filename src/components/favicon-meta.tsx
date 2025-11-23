'use client'

import { useEffect } from 'react'

interface FaviconMetaProps {
  faviconUrl?: string
  altText?: string
}

export default function FaviconMeta({ faviconUrl }: FaviconMetaProps) {
  useEffect(() => {
    if (faviconUrl && typeof window !== 'undefined') {
      // 移除現有的 favicon 連結
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]')
      existingFavicons.forEach(link => link.remove())

      // 創建新的 favicon 連結
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/x-icon'
      link.href = faviconUrl
      
      // 添加到 head
      document.head.appendChild(link)

      // 同時設置 shortcut icon（向後兼容）
      const shortcutLink = document.createElement('link')
      shortcutLink.rel = 'shortcut icon'
      shortcutLink.type = 'image/x-icon'
      shortcutLink.href = faviconUrl
      document.head.appendChild(shortcutLink)
    }
  }, [faviconUrl])

  return null // 這個組件不渲染任何內容
}
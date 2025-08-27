import { createClient } from '@sanity/client'

// 優化的 Sanity 客戶端配置
export const optimizedSanityClient = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  apiVersion: '2023-08-01',
  useCdn: true, // 使用 CDN 以提高載入速度
  perspective: 'published', // 只載入已發布的內容
  stega: {
    // 優化 live preview 功能
    enabled: process.env.NODE_ENV === 'development',
    studioUrl: '/cms'
  }
})

// 預載入關鍵資源
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // 預載入 Sanity Studio 核心資源
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'script'
    link.href = '/_next/static/chunks/node_modules_sanity_lib_index_mjs_*.js'
    document.head.appendChild(link)
  }
}

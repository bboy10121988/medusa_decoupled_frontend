'use client'

import dynamic from 'next/dynamic'

// 動態載入 SimpleStudioEditor 組件，避免 SSR 問題
const SimpleStudioEditor = dynamic(
  () => import('@/components/grapesjs/SimpleStudioEditor'),
  {
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div>載入編輯器中...</div>
      </div>
    )
  }
)

export default function TestStudioPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <SimpleStudioEditor />
    </div>
  )
}
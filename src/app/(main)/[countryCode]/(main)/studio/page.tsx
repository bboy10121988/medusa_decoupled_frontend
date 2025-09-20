'use client'

import GrapesViewer from '@/components/grapesjs/GrapesViewer'

export default function StudioPage() {
  return (
    <div className="h-screen">
      {/* 僅渲染模式：未傳 pageId/slug 時顯示提示 */}
      <GrapesViewer preview />
    </div>
  )
}

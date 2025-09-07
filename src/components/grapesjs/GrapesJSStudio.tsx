'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// 動態載入 GrapesJS 組件以避免 SSR 問題
const GrapesJSEditor = dynamic(() => import('./GrapesJSEditorWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在載入 GrapesJS 編輯器...</p>
      </div>
    </div>
  )
})

export default function GrapesJSStudio() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化編輯器...</p>
        </div>
      </div>
    )
  }

  return <GrapesJSEditor />
}

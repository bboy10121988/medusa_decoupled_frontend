'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { GrapesJSPageData } from '@/lib/services/grapesjs-page-service'

// 動態載入 GrapesJS 編輯器，避免 SSR 問題
const GrapesEditor = dynamic(() => import('@/components/grapesjs/grapes_editor'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
        <div style={{ fontSize: '16px', color: '#666' }}>載入 GrapesJS 編輯器中...</div>
      </div>
    </div>
  )
})

function EditorContent() {
  const searchParams = useSearchParams()
  const docId = searchParams.get('docId')

  const handleSave = (pageData: GrapesJSPageData) => {
    // console.log('✅ 頁面已成功儲存到 Sanity!', pageData)
    
    // 顯示成功通知
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
      `
      notification.textContent = '✅ 頁面已成功儲存到 Sanity'
      
      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 3000)
    }
  }

  if (!docId) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>缺少頁面 ID</h2>
          <p style={{ margin: '0', fontSize: '14px' }}>請從 Sanity 文件中點擊按鈕來開啟編輯器</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GrapesEditor
        pageId={docId}
        onSave={handleSave}
      />
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '24px' }}>🔄</div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  )
}
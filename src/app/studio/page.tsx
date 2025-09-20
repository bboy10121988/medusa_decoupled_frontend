'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import GrapesEditor from '@/components/grapesjs/grapes_editor'
import { grapesJSPageService, type GrapesJSPageData } from '@/lib/services/grapesjs-page-service'

function EditorContent() {
  const searchParams = useSearchParams()
  const [pageId, setPageId] = useState<string | null>(null)
  const [page, setPage] = useState<GrapesJSPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const docId = searchParams.get('docId')
    const type = searchParams.get('type')
    
    console.log('編輯器頁面參數:', { docId, type })
    
    if (!docId) {
      setError('缺少頁面 ID 參數')
      setLoading(false)
      return
    }

    // 移除可能的 drafts. 前綴
    const cleanId = docId.replace(/^drafts\./, '')
    setPageId(cleanId)
    
    // 載入頁面數據
    loadPage(cleanId)
  }, [searchParams])

  const loadPage = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('正在載入頁面:', id)
      const pageData = await grapesJSPageService.getPageById(id)
      
      if (pageData) {
        setPage(pageData)
        console.log('頁面載入成功:', pageData.title)
      } else {
        setError('頁面不存在或無法載入')
      }
    } catch (err) {
      console.error('載入頁面失敗:', err)
      setError(err instanceof Error ? err.message : '載入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (updatedPage: GrapesJSPageData) => {
    console.log('頁面已保存:', updatedPage.title)
    setPage(updatedPage)
    
    // 顯示保存成功的通知
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      `
      notification.innerHTML = '✅ 頁面已成功保存到 Sanity'
      
      document.body.appendChild(notification)
      
      // 3秒後移除通知
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in'
        setTimeout(() => {
          notification.remove()
        }, 300)
      }, 3000)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <h2>載入 GrapesJS 編輯器中...</h2>
          <p>正在準備頁面編輯環境</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(100%); opacity: 0; }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</h1>
          <h2>無法載入編輯器</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            重新載入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {page && (
        <>
          {/* 頁面信息欄 */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>📝 正在編輯: <strong>{page.title}</strong></span>
              <span style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.25rem' 
              }}>
                {page.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>🔗 路由: /tw/page/{page.slug.current}</span>
              <span style={{ opacity: 0.8 }}>Ctrl+S 快速保存</span>
            </div>
          </div>
          
          {/* 編輯器 */}
          <div style={{ height: 'calc(100vh - 50px)' }}>
            <GrapesEditor 
              pageId={pageId!}
              onSave={handleSave}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default function GrapesJSEditorPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'system-ui',
        background: '#f8f9fa'
      }}>
        準備編輯器...
      </div>
    }>
      <EditorContent />
    </Suspense>
  )
}

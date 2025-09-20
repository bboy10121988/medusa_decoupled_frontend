import { definePlugin, Tool } from 'sanity'
import { EditIcon } from '@sanity/icons'
import dynamic from 'next/dynamic'

// 動態導入 GrapesJS 編輯器組件，避免 SSR 問題
const GrapesEditor = dynamic(() => import('../src/components/grapesjs/grapes_editor'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>載入 GrapesJS 編輯器中...</div>
})

// 定義 GrapesJS 編輯器工具
const grapesJSEditorTool: Tool = {
  name: 'grapes-editor',
  title: 'GrapesJS 頁面編輯器',
  icon: EditIcon,
  component: () => {
    // 從 URL 參數中獲取頁面 ID
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const docId = urlParams?.get('docId')
    const pageId = docId ? docId.replace(/^drafts\./, '') : undefined

    const handleSave = (updatedPage: any) => {
      console.log('頁面已保存:', updatedPage?.title || '未知頁面')
      
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

    return (
      <>
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `}</style>
        <div style={{ height: '100vh', width: '100%' }}>
          {pageId ? (
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
                  <span>📝 正在編輯頁面 ID: <strong>{pageId}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ opacity: 0.8 }}>Ctrl+S 快速保存</span>
                </div>
              </div>
              
              {/* 編輯器 */}
              <div style={{ height: 'calc(100vh - 50px)' }}>
                <GrapesEditor 
                  pageId={pageId}
                  onSave={handleSave}
                />
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
              fontFamily: 'system-ui',
              textAlign: 'center',
              color: '#666'
            }}>
              <div>
                <h2>請從 Sanity 文件中啟動編輯器</h2>
                <p>需要頁面 ID 參數才能載入編輯器</p>
              </div>
            </div>
          )}
        </div>
      </>
    )
  }
}

// 定義 GrapesJS 插件
export const grapesJSPlugin = definePlugin({
  name: 'grapes-editor-plugin',
  tools: [grapesJSEditorTool]
})

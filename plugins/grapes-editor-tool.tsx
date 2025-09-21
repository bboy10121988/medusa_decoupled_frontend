import { definePlugin, Tool } from 'sanity'
import { EditIcon } from '@sanity/icons'
import dynamic from 'next/dynamic'

// 動態導入 GrapesJS 編輯器組件，避免 SSR 問題
const GrapesEditor = dynamic(
  () => import('../src/components/grapesjs/grapes_editor').then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        fontSize: '16px',
        color: '#666',
        background: '#f8f9fa',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
          <div>載入 GrapesJS 編輯器中...</div>
        </div>
      </div>
    )
  }
)

// 定義 GrapesJS 編輯器工具
const grapesJSEditorTool: Tool = {
  name: 'grapes-editor',
  title: 'GrapesJS 頁面編輯器',
  icon: EditIcon,
  component: () => {
    console.log('🚀 GrapesJS Tool 元件開始載入...')
    
    // 從 URL 參數中獲取頁面 ID
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const docId = urlParams?.get('docId')
    const pageId = docId ? docId.replace(/^drafts\./, '') : undefined
    
    console.log('📋 參數資訊:', { docId, pageId })

    const handleSave = (updatedPage: any) => {
      console.log('✅ 頁面已保存:', updatedPage?.title || '未知頁面')
      
      // 簡單的成功提示
      if (typeof window !== 'undefined') {
        alert('✅ 頁面已成功保存到 Sanity!')
      }
    }

    return (
      <div style={{ height: '100vh', width: '100%' }}>
        {pageId ? (
          <GrapesEditor 
            pageId={pageId}
            onSave={handleSave}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'system-ui',
            textAlign: 'center',
            color: '#666',
            background: '#f8f9fa'
          }}>
            <div>
              <div style={{ fontSize: '48px', marginBottom: '24px' }}>📝</div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#333' }}>GrapesJS 頁面編輯器</h2>
              <p style={{ margin: '0', fontSize: '16px' }}>請從 Sanity 文件中點擊「Open in GrapesJS Editor」按鈕來啟動編輯器</p>
              <div style={{ marginTop: '20px', padding: '12px', background: '#e3f2fd', borderRadius: '8px', fontSize: '14px' }}>
                💡 需要 docId 參數才能載入特定頁面
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

// 定義 GrapesJS 插件
export const grapesJSPlugin = definePlugin({
  name: 'grapes-editor-plugin',
  tools: [grapesJSEditorTool]
})

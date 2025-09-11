import { ComponentIcon } from '@sanity/icons'

// 自定義的 Page Editor 視圖組件
const PageEditorView = () => {
  const React = require('react')
  const { useState } = React

  const [isLoaded, setIsLoaded] = useState(false)

  return React.createElement('div', {
    style: {
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff'
    }
  }, [
    // 頂部工具欄
    React.createElement('div', {
      key: 'toolbar',
      style: {
        padding: '10px 15px',
        borderBottom: '1px solid #e1e3e6',
        backgroundColor: '#f1f3f6',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minHeight: '50px',
        zIndex: 10
      }
    }, [
      React.createElement(ComponentIcon, { 
        key: 'icon',
        style: { fontSize: '18px', color: '#0066cc' }
      }),

      React.createElement('div', {
        key: 'spacer',
        style: { flex: 1 }
      }),
      React.createElement('div', {
        key: 'status',
        style: {
          padding: '4px 12px',
          backgroundColor: isLoaded ? '#10b981' : '#f59e0b',
          color: 'white',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500'
        }
      }, isLoaded ? '✓ 編輯器已就緒' : '⏳ 載入中...'),
      React.createElement('button', {
        key: 'refresh-btn',
        style: {
          padding: '6px 12px',
          backgroundColor: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        },
        onClick: () => {
          window.location.reload()
        }
      }, '🔄 重新載入')
    ]),
    
    // GrapesJS 編輯器 iframe
    React.createElement('iframe', {
      key: 'editor-iframe',
      src: '/studio',
      style: {
        width: '100%',
        height: 'calc(100vh - 50px)',
        border: 'none',
        backgroundColor: '#fff'
      },
      title: 'GrapesJS Editor',
      onLoad: () => setIsLoaded(true),
      sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups'
    })
  ])
}

export const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // 自定義 Page_Editor 項目 - 放在最前面
      S.listItem()
        .title('Page_Editor')
        .icon(ComponentIcon)
        .child(
          S.component(PageEditorView)
            .title('GrapesJS 頁面編輯器')
        ),
      
      S.divider(),
      
      // 其他文檔類型
      S.documentTypeListItem('homePage').title('首頁'),
      S.documentTypeListItem('pages').title('動態頁面'),
      S.documentTypeListItem('post').title('文章'),
      S.documentTypeListItem('author').title('作者'),
      S.documentTypeListItem('category').title('分類'),
      
      S.divider(),
      
      S.documentTypeListItem('header').title('網站頁首'),
      S.documentTypeListItem('footer').title('頁腳設定'),
      S.documentTypeListItem('returnPolicy').title('退換貨政策'),
    ])

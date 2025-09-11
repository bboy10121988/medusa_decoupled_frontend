import { ComponentIcon } from '@sanity/icons'

// 自定義的 Page Editor 視圖組件
const PageEditorView = () => {
  const React = require('react')

  return React.createElement('iframe', {
    key: 'editor-iframe',
    src: '/studio',
    style: {
      width: '100%',
      height: '100vh',
      border: 'none',
      backgroundColor: '#fff'
    },
    title: 'GrapesJS Editor',
    sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups'
  })
}

export const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // 自定義 頁面編輯器 項目 - 放在最前面
      S.listItem()
        .id('page-editor')
        .title('頁面編輯器')
        .icon(ComponentIcon)
        .child(
          S.component(PageEditorView)
            .id('page-editor')
            .title('Page Editor')
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

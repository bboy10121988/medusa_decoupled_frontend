export const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // GrapesJS 頁面 V2 清單
      S.documentTypeListItem('grapesJSPageV2').title('GrapesJS 頁面 V2'),

      // 其他文檔類型
      S.documentTypeListItem('homePage').title('首頁'),
      S.documentTypeListItem('post').title('文章'),
      S.documentTypeListItem('author').title('作者'),
      S.documentTypeListItem('category').title('分類'),
      
      S.divider(),
      
      S.documentTypeListItem('header').title('網站頁首'),
      S.documentTypeListItem('footer').title('頁腳設定'),
    ])

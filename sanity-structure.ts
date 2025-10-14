export const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // 動態頁面清單
      S.documentTypeListItem('dynamicPage').title('動態頁面'),

      // 其他文檔類型
      S.documentTypeListItem('homePage').title('首頁'),
      S.documentTypeListItem('post').title('文章'),
      S.documentTypeListItem('author').title('作者'),
      S.documentTypeListItem('category').title('分類'),
      
      S.divider(),
      
      S.documentTypeListItem('header').title('網站頁首'),
      S.documentTypeListItem('footer').title('頁腳設定'),
    ])

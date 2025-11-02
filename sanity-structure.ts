export const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // 動態頁面清單
      S.documentTypeListItem('dynamicPage').title('動態頁面'),

      // 其他文檔類型
      S.documentTypeListItem('homePage').title('首頁'),
      
      S.divider(),
      
      // 部落格相關
      S.listItem()
        .id('blog-section')
        .title('部落格')
        .child(
          S.list()
            .id('blog-list')
            .title('部落格管理')
            .items([
              S.documentTypeListItem('blogPage').title('部落格頁面設定'),
              S.divider(),
              S.documentTypeListItem('post').title('文章'),
              S.documentTypeListItem('author').title('作者'),
              S.documentTypeListItem('category').title('分類'),
            ])
        ),
      
      S.divider(),
      
      S.documentTypeListItem('header').title('網站頁首'),
      S.documentTypeListItem('footer').title('頁腳設定'),
    ])

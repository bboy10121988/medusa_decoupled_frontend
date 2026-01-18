// 建立語言分類資料夾的輔助函式
const createLanguageFolders = (S: any, docType: string, zhTitle: string, enTitle: string, jaTitle?: string) => {
  return S.list()
    .id(`${docType}-lang-list`)
    .title('選擇語言')
    .items([
      S.listItem()
        .id(`${docType}-zh`)
        .title('🇹🇼 繁體中文')
        .child(
          S.documentList()
            .id(`${docType}-zh-list`)
            .title(zhTitle)
            .filter(`_type == "${docType}" && language == "zh-TW"`)
        ),
      S.listItem()
        .id(`${docType}-en`)
        .title('🇺🇸 English')
        .child(
          S.documentList()
            .id(`${docType}-en-list`)
            .title(enTitle)
            .filter(`_type == "${docType}" && language == "en"`)
        ),
      S.listItem()
        .id(`${docType}-ja`)
        .title('🇯🇵 日本語')
        .child(
          S.documentList()
            .id(`${docType}-ja-list`)
            .title(jaTitle || `Japanese ${docType}`)
            .filter(`_type == "${docType}" && language == "ja-JP"`)
        ),
      S.divider(),
      S.listItem()
        .id(`${docType}-all`)
        .title('📋 全部')
        .child(
          S.documentList()
            .id(`${docType}-all-list`)
            .title('所有文檔')
            .filter(`_type == "${docType}"`)
        ),
    ])
}

export const structure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // 首頁 - 按語言分類
      S.listItem()
        .id('homepage-section')
        .title('🏠 首頁')
        .child(createLanguageFolders(S, 'homePage', '繁體中文首頁', 'English Homepage', '日本語ホームページ')),

      // 動態頁面 - 按語言分類
      S.listItem()
        .id('dynamicpage-section')
        .title('📄 動態頁面')
        .child(createLanguageFolders(S, 'dynamicPage', '繁體中文頁面', 'English Pages', '日本語ページ')),

      S.divider(),

      // 商品內容 - 按語言分類
      S.listItem()
        .id('product-section')
        .title('🛍️ 商品內容')
        .child(createLanguageFolders(S, 'product', '繁體中文商品', 'English Products', '日本語商品')),

      S.divider(),

      // 部落格 - 先語言分類，再分類型
      S.listItem()
        .id('blog-section')
        .title('📝 部落格')
        .child(
          S.list()
            .id('blog-list')
            .title('部落格管理')
            .items([
              // 繁體中文
              S.listItem()
                .id('blog-zh')
                .title('🇹🇼 繁體中文')
                .child(
                  S.list()
                    .id('blog-zh-list')
                    .title('繁體中文部落格')
                    .items([
                      S.listItem()
                        .id('blogpage-zh')
                        .title('頁面設定')
                        .child(
                          S.documentList()
                            .id('blogpage-zh-list')
                            .title('繁體中文頁面設定')
                            .filter('_type == "blogPage" && language == "zh-TW"')
                        ),
                      S.listItem()
                        .id('post-zh')
                        .title('文章')
                        .child(
                          S.documentList()
                            .id('post-zh-list')
                            .title('繁體中文文章')
                            .filter('_type == "post" && language == "zh-TW"')
                        ),
                      S.listItem()
                        .id('category-zh')
                        .title('分類')
                        .child(
                          S.documentList()
                            .id('category-zh-list')
                            .title('繁體中文分類')
                            .filter('_type == "category" && language == "zh-TW"')
                        ),

                    ])
                ),
              // English
              S.listItem()
                .id('blog-en')
                .title('🇺🇸 English')
                .child(
                  S.list()
                    .id('blog-en-list')
                    .title('English Blog')
                    .items([
                      S.listItem()
                        .id('blogpage-en')
                        .title('Page Settings')
                        .child(
                          S.documentList()
                            .id('blogpage-en-list')
                            .title('English Page Settings')
                            .filter('_type == "blogPage" && language == "en"')
                        ),
                      S.listItem()
                        .id('post-en')
                        .title('Posts')
                        .child(
                          S.documentList()
                            .id('post-en-list')
                            .title('English Posts')
                            .filter('_type == "post" && language == "en"')
                        ),
                      S.listItem()
                        .id('category-en')
                        .title('Categories')
                        .child(
                          S.documentList()
                            .id('category-en-list')
                            .title('English Categories')
                            .filter('_type == "category" && language == "en"')
                        ),
                    ])
                ),
              // 日本語
              S.listItem()
                .id('blog-ja')
                .title('🇯🇵 日本語')
                .child(
                  S.list()
                    .id('blog-ja-list')
                    .title('日本語ブログ')
                    .items([
                      S.listItem()
                        .id('blogpage-ja')
                        .title('ページ設定')
                        .child(
                          S.documentList()
                            .id('blogpage-ja-list')
                            .title('日本語ページ設定')
                            .filter('_type == "blogPage" && language == "ja-JP"')
                        ),
                      S.listItem()
                        .id('post-ja')
                        .title('記事')
                        .child(
                          S.documentList()
                            .id('post-ja-list')
                            .title('日本語記事')
                            .filter('_type == "post" && language == "ja-JP"')
                        ),
                      S.listItem()
                        .id('category-ja')
                        .title('カテゴリ')
                        .child(
                          S.documentList()
                            .id('category-ja-list')
                            .title('日本語カテゴリ')
                            .filter('_type == "category" && language == "ja-JP"')
                        ),
                    ])
                ),

              S.divider(),
              // 作者 (共用)
              S.documentTypeListItem('author').title('👤 作者'),
            ])
        ),

      S.divider(),

      // 網站頁首 - 按語言分類
      S.listItem()
        .id('header-section')
        .title('🔝 網站頁首')
        .child(createLanguageFolders(S, 'header', '繁體中文頁首', 'English Header', '日本語ヘッダー')),

      // 頁腳設定 - 按語言分類
      S.listItem()
        .id('footer-section')
        .title('🔻 頁腳設定')
        .child(createLanguageFolders(S, 'footer', '繁體中文頁腳', 'English Footer', '日本語フッター')),
    ])

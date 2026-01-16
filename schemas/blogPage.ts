export default {
  name: 'blogPage',
  title: '部落格頁面設定',
  type: 'document',
  groups: [
    { name: 'content', title: '內容設定', default: true },
    { name: 'seo', title: 'SEO 設定' },
    { name: 'display', title: '顯示設定' }
  ],
  fields: [
    // ==================== 內容設定 ====================
    {
      name: 'title',
      title: '頁面標題',
      type: 'string',
      description: '部落格列表頁的主標題',
      initialValue: '部落格文章',
      group: 'content'
    },
    {
      name: 'subtitle',
      title: '頁面副標題',
      type: 'string',
      description: '顯示在標題下方的描述文字',
      initialValue: '探索我們的最新消息與文章',
      group: 'content'
    },
    {
      name: 'showTitle',
      title: '顯示頁面標題',
      type: 'boolean',
      description: '是否顯示頁面標題（手機版/桌面版都適用）',
      initialValue: false,
      group: 'content'
    },
    {
      name: 'showSubtitle',
      title: '顯示副標題',
      type: 'boolean',
      description: '是否顯示副標題',
      initialValue: false,
      group: 'content'
    },

    // ==================== 文章設定 ====================
    {
      name: 'postsHeading',
      title: '📝 文章管理',
      type: 'string',
      description: '管理部落格文章',
      readOnly: true,
      hidden: true,
      group: 'content'
    },
    {
      name: 'postsPerPage',
      title: '每頁顯示文章數',
      type: 'number',
      description: '設定每頁顯示的文章數量',
      initialValue: 9,
      validation: (Rule: any) => Rule.required().min(3).max(24),
      group: 'content'
    },
    {
      name: 'featuredPosts',
      title: '精選文章',
      type: 'array',
      description: '選擇要置頂顯示的精選文章',
      of: [{ type: 'reference', to: [{ type: 'post' }] }],
      group: 'content'
    },

    // ==================== 分類設定 ====================
    {
      name: 'categoriesHeading',
      title: '🏷️ 分類管理',
      type: 'string',
      description: '管理文章分類',
      readOnly: true,
      hidden: true,
      group: 'content'
    },
    {
      name: 'showCategories',
      title: '顯示分類側邊欄',
      type: 'boolean',
      description: '是否顯示分類選單',
      initialValue: true,
      group: 'content'
    },
    {
      name: 'categoryTitle',
      title: '分類區塊標題',
      type: 'string',
      description: '側邊欄分類區塊的標題',
      initialValue: '文章分類',
      group: 'content'
    },
    {
      name: 'allCategoriesLabel',
      title: '全部分類標籤',
      type: 'string',
      description: '顯示全部文章的標籤文字',
      initialValue: '全部文章',
      group: 'content'
    },
    {
      name: 'featuredCategories',
      title: '推薦分類順序',
      type: 'array',
      description: '選擇並排序要優先顯示的分類（未選擇的分類會按字母順序排在後面）',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      group: 'content'
    },

    // ==================== 作者設定 ====================
    {
      name: 'authorsHeading',
      title: '✍️ 作者管理',
      type: 'string',
      description: '管理部落格作者',
      readOnly: true,
      hidden: true,
      group: 'content'
    },
    {
      name: 'showAuthors',
      title: '顯示作者資訊',
      type: 'boolean',
      description: '是否在文章列表和詳情頁顯示作者資訊',
      initialValue: true,
      group: 'content'
    },
    {
      name: 'featuredAuthors',
      title: '推薦作者',
      type: 'array',
      description: '選擇推薦的作者',
      of: [{ type: 'reference', to: [{ type: 'author' }] }],
      group: 'content'
    },

    // ==================== 最新文章設定 ====================
    {
      name: 'latestPostsHeading',
      title: '🆕 最新文章',
      type: 'string',
      description: '側邊欄最新文章設定',
      readOnly: true,
      hidden: true,
      group: 'content'
    },
    {
      name: 'showLatestPosts',
      title: '顯示最新文章',
      type: 'boolean',
      description: '是否在側邊欄顯示最新文章列表',
      initialValue: true,
      group: 'content'
    },
    {
      name: 'latestPostsTitle',
      title: '最新文章標題',
      type: 'string',
      description: '最新文章區塊的標題',
      initialValue: '最新文章',
      group: 'content'
    },
    {
      name: 'latestPostsCount',
      title: '最新文章數量',
      type: 'number',
      description: '側邊欄顯示的最新文章數量',
      initialValue: 4,
      validation: (Rule: any) => Rule.required().min(1).max(10),
      group: 'content'
    },

    // ==================== SEO 設定 ====================
    {
      name: 'seoTitle',
      title: 'SEO 標題',
      type: 'string',
      description: '搜尋引擎顯示的標題（建議 50-60 字元）',
      group: 'seo'
    },
    {
      name: 'seoDescription',
      title: 'SEO 描述',
      type: 'text',
      description: '搜尋引擎顯示的描述（建議 140-160 字元）',
      rows: 3,
      group: 'seo'
    },
    {
      name: 'seoKeywords',
      title: 'SEO 關鍵字',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: '與部落格相關的關鍵字',
      group: 'seo'
    },
    {
      name: 'ogImage',
      title: '社群分享圖片',
      type: 'image',
      options: { hotspot: true },
      description: '在社群媒體分享時顯示的圖片（建議尺寸 1200x630）',
      group: 'seo',
      fields: [
        {
          name: 'alt',
          title: '圖片替代文字',
          type: 'string'
        }
      ]
    },

    // ==================== 顯示設定 ====================
    {
      name: 'layout',
      title: '佈局樣式',
      type: 'string',
      options: {
        list: [
          { title: '網格佈局（預設）', value: 'grid' },
          { title: '列表佈局', value: 'list' }
        ],
        layout: 'radio'
      },
      initialValue: 'grid',
      group: 'display'
    },
    {
      name: 'gridColumns',
      title: '桌面版列數',
      type: 'number',
      description: '桌面版每行顯示的文章數',
      initialValue: 3,
      validation: (Rule: any) => Rule.required().min(2).max(4),
      group: 'display',
      hidden: ({ parent }: any) => parent?.layout === 'list'
    },
    {
      name: 'mobileColumns',
      title: '手機版列數',
      type: 'number',
      description: '手機版每行顯示的文章數',
      initialValue: 2,
      validation: (Rule: any) => Rule.required().min(1).max(2),
      group: 'display',
      hidden: ({ parent }: any) => parent?.layout === 'list'
    },
    {
      name: 'showExcerpt',
      title: '顯示文章摘要',
      type: 'boolean',
      description: '是否在卡片上顯示文章摘要',
      initialValue: true,
      group: 'display'
    },
    {
      name: 'excerptLength',
      title: '摘要字數',
      type: 'number',
      description: '文章摘要顯示的字數',
      initialValue: 80,
      validation: (Rule: any) => Rule.required().min(50).max(200),
      group: 'display',
      hidden: ({ parent }: any) => !parent?.showExcerpt
    },
    {
      name: 'showReadMore',
      title: '顯示「閱讀更多」按鈕',
      type: 'boolean',
      description: '是否在卡片底部顯示「閱讀更多」按鈕',
      initialValue: true,
      group: 'display'
    },
    {
      name: 'readMoreText',
      title: '「閱讀更多」文字',
      type: 'string',
      description: '自訂「閱讀更多」按鈕的文字',
      initialValue: '閱讀更多',
      group: 'display',
      hidden: ({ parent }: any) => !parent?.showReadMore
    },
    // 多語系欄位 (由 i18n 插件管理)
    {
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle'
    },
    prepare({ title, subtitle }: { title: string; subtitle: string }) {
      return {
        title: title || '部落格頁面設定',
        subtitle: subtitle || ''
      }
    }
  }
}

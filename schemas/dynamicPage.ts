import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'dynamicPage',
  title: '動態頁面',
  type: 'document',
  groups: [
    { name: 'content', title: '頁面內容', default: true },
    { name: 'seo', title: 'SEO 設定' },
    { name: 'social', title: '社群媒體分享' },
    { name: 'settings', title: '頁面設定' }
  ],
  fields: [
    // 基本頁面資訊
    defineField({
      name: 'title',
      title: '頁面標題',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: '網址別名 (URL Slug)',
      type: 'slug',
      group: 'content',
      description: '頁面的網址路徑，例如：about-us, contact, services。會自動從頁面標題生成',
      options: {
        source: 'title',
        maxLength: 96,
        // Custom uniqueness check to allow same slug in different languages
        isUnique: async (slug, context) => {
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2024-01-01' })
          const id = document?._id.replace(/^drafts\./, '')
          const params = {
            draft: `drafts.${id}`,
            published: id,
            slug,
            language: document?.language
          }

          const query = `!defined(*[
            _type == "dynamicPage" && 
            !(_id in [$draft, $published]) && 
            slug.current == $slug && 
            language == $language
          ][0]._id)`

          return await client.fetch(query, params)
        },
        slugify: (input: string) => {
          return input
            .toLowerCase()
            .replace(/\s+/g, '-')        // 空格變成連字符
            .replace(/[^\w\-]+/g, '')     // 移除特殊字符
            .replace(/\-\-+/g, '-')       // 多個連字符變成一個
            .replace(/^-+/, '')           // 移除開頭的連字符
            .replace(/-+$/, '')           // 移除結尾的連字符
        }
      },
      validation: (Rule) => Rule.required().custom((slug: any) => {
        if (!slug?.current) return '請生成網址別名'

        // 檢查是否包含特殊字符
        if (!/^[a-z0-9\-]+$/.test(slug.current)) {
          return '網址別名只能包含小寫字母、數字和連字符'
        }

        // 檢查長度
        if (slug.current.length < 2) {
          return '網址別名至少需要2個字符'
        }

        // 檢查保留字
        const reserved = ['admin', 'api', 'cms', 'editor', 'login', 'logout', 'account', 'cart', 'checkout']
        if (reserved.includes(slug.current)) {
          return '此網址別名為系統保留字，請選擇其他名稱'
        }

        return true
      })
    }),
    defineField({
      name: 'description',
      title: '頁面描述',
      type: 'text',
      group: 'content',
      rows: 3
    }),
    // 動態內容區塊
    defineField({
      name: 'pageContent',
      title: '內容編輯器',
      type: 'array',
      group: 'content',
      description: '拖拉排序的動態內容編輯器，支援所有首頁模組的功能區塊',
      of: [
        // === 首頁模組 Section 類型 ===
        { type: 'mainBanner' },
        { type: 'imageTextBlock' },
        { type: 'featuredProducts' },
        { type: 'blogSection' },
        { type: 'youtubeSection' },
        { type: 'contentSection' },
        { type: 'serviceCardSection' },
        { type: 'googleMapsSection' },

        // === 基本內容區塊 ===
        // 文字內容區塊
        {
          type: 'object',
          name: 'textBlock',
          title: '文字區塊',
          fields: [
            { name: 'title', title: '區塊標題', type: 'string' },
            { name: 'content', title: '內容', type: 'array', of: [{ type: 'block' }] },
            {
              name: 'alignment', title: '對齊方式', type: 'string', options: {
                list: [
                  { title: '置左', value: 'left' },
                  { title: '置中', value: 'center' },
                  { title: '置右', value: 'right' }
                ]
              }, initialValue: 'left'
            }
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: `📝 ${title || '文字區塊'}` })
          }
        },
        // 圖片區塊
        {
          type: 'object',
          name: 'imageBlock',
          title: '圖片區塊',
          fields: [
            { name: 'title', title: '區塊標題', type: 'string' },
            { name: 'image', title: '圖片', type: 'image', options: { hotspot: true } },
            { name: 'alt', title: '替代文字', type: 'string' },
            { name: 'caption', title: '圖片說明', type: 'string' },
            {
              name: 'layout', title: '佈局', type: 'string', options: {
                list: [
                  { title: '全寬', value: 'full' },
                  { title: '置中', value: 'center' },
                  { title: '左浮動', value: 'float-left' },
                  { title: '右浮動', value: 'float-right' }
                ]
              }, initialValue: 'center'
            }
          ],
          preview: {
            select: { title: 'title', media: 'image' },
            prepare: ({ title, media }) => ({ title: `🖼️ ${title || '圖片區塊'}`, media })
          }
        },
        // 影片區塊
        {
          type: 'object',
          name: 'videoBlock',
          title: '影片區塊',
          fields: [
            { name: 'title', title: '區塊標題', type: 'string' },
            { name: 'videoUrl', title: '影片網址', type: 'url', description: '支援 YouTube、Vimeo 等' },
            { name: 'thumbnail', title: '縮圖', type: 'image' },
            { name: 'description', title: '影片描述', type: 'text' }
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: `🎥 ${title || '影片區塊'}` })
          }
        },
        // CTA 按鈕區塊
        {
          type: 'object',
          name: 'ctaBlock',
          title: 'CTA 按鈕區塊',
          fields: [
            { name: 'title', title: '區塊標題', type: 'string' },
            { name: 'buttonText', title: '按鈕文字', type: 'string' },
            { name: 'buttonUrl', title: '按鈕連結', type: 'url' },
            {
              name: 'buttonStyle', title: '按鈕樣式', type: 'string', options: {
                list: [
                  { title: '主要按鈕', value: 'primary' },
                  { title: '次要按鈕', value: 'secondary' },
                  { title: '外框按鈕', value: 'outline' }
                ]
              }, initialValue: 'primary'
            },
            {
              name: 'alignment', title: '對齊方式', type: 'string', options: {
                list: [
                  { title: '置左', value: 'left' },
                  { title: '置中', value: 'center' },
                  { title: '置右', value: 'right' }
                ]
              }, initialValue: 'center'
            }
          ],
          preview: {
            select: { title: 'title', buttonText: 'buttonText' },
            prepare: ({ title, buttonText }) => ({ title: `🔘 ${title || buttonText || 'CTA 區塊'}` })
          }
        }
      ]
    }),

    // 狀態和發布設定
    defineField({
      name: 'status',
      title: '頁面狀態',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: '草稿', value: 'draft' },
          { title: '預覽', value: 'preview' },
          { title: '已發布', value: 'published' },
          { title: '已封存', value: 'archived' }
        ]
      },
      initialValue: 'draft'
    }),
    defineField({
      name: 'publishedAt',
      title: '發布時間',
      type: 'datetime',
      group: 'settings'
    }),
    defineField({
      name: 'version',
      title: '版本號',
      type: 'number',
      group: 'settings',
      initialValue: 1,
      readOnly: true
    }),

    // SEO 設定
    defineField({
      name: 'seoTitle',
      title: 'SEO 標題',
      type: 'string',
      group: 'seo',
      validation: (Rule) => Rule.max(60),
      description: '建議長度 50-60 字元'
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO 描述',
      type: 'text',
      group: 'seo',
      validation: (Rule) => Rule.max(160),
      rows: 3,
      description: '建議長度 140-160 字元'
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO 關鍵字',
      type: 'array',
      group: 'seo',
      of: [{ type: 'string' }],
      options: { layout: 'tags' }
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph 圖片',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: '替代文字',
          type: 'string'
        }
      ]
    }),

    // 社群媒體分享設定
    defineField({
      name: 'ogTitle',
      title: 'Facebook/社群標題',
      type: 'string',
      group: 'social',
      validation: (Rule) => Rule.max(60),
      description: '社群媒體分享時顯示的標題（留空則使用 SEO 標題）'
    }),
    defineField({
      name: 'ogDescription',
      title: 'Facebook/社群描述',
      type: 'text',
      group: 'social',
      validation: (Rule) => Rule.max(160),
      rows: 2,
      description: '社群媒體分享時顯示的描述（留空則使用 SEO 描述）'
    }),
    defineField({
      name: 'socialImage',
      title: '社群分享圖片',
      type: 'image',
      group: 'social',
      options: { hotspot: true, metadata: ['blurhash', 'exif', 'location', 'palette'] },
      description: '建議尺寸：1200x630 像素，檔案小於 1MB',
      fields: [
        {
          name: 'alt',
          title: '圖片替代文字',
          type: 'string'
        }
      ]
    }),
    defineField({
      name: 'twitterCard',
      title: 'Twitter 卡片類型',
      type: 'string',
      group: 'social',
      options: {
        list: [
          { title: '摘要 (Summary)', value: 'summary' },
          { title: '大圖摘要 (Summary Large Image)', value: 'summary_large_image' },
          { title: '應用程式 (App)', value: 'app' },
          { title: '播放器 (Player)', value: 'player' }
        ]
      },
      initialValue: 'summary_large_image',
      description: 'Twitter 分享時的卡片樣式'
    }),

    // 技術設定
    defineField({
      name: 'customCSS',
      title: '自訂 CSS',
      type: 'text',
      group: 'settings',
      description: '額外的 CSS 代碼（會加在 GrapesJS 生成的 CSS 之後)'
    }),
    defineField({
      name: 'customJS',
      title: '自訂 JavaScript',
      type: 'text',
      group: 'settings',
      description: '自訂的 JavaScript 代碼'
    }),
    defineField({
      name: 'viewport',
      title: 'Viewport 設定',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: '響應式 (預設)', value: 'responsive' },
          { title: '桌面版', value: 'desktop' },
          { title: '平板', value: 'tablet' },
          { title: '手機', value: 'mobile' }
        ]
      },
      initialValue: 'responsive'
    }),

    // 編輯歷史
    defineField({
      name: 'lastModified',
      title: '最後修改時間',
      type: 'datetime',
      group: 'settings',
      readOnly: true
    }),
    defineField({
      name: 'editHistory',
      title: '編輯歷史',
      type: 'array',
      group: 'settings',
      of: [{
        type: 'object',
        fields: [
          { name: 'timestamp', title: '時間', type: 'datetime' },
          { name: 'action', title: '動作', type: 'string' },
          { name: 'editor', title: '編輯者', type: 'string' },
          { name: 'changes', title: '變更摘要', type: 'text' }
        ]
      }],
      hidden: true
    }),
    // 多語系欄位 (由 i18n 插件管理)
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      status: 'status',
      version: 'version'
    },
    prepare({ title, subtitle, status, version }) {
      const statusEmoji: Record<string, string> = {
        'draft': '📝',
        'preview': '👁️',
        'published': '🌐',
        'archived': '📦'
      }

      const statusLabel: Record<string, string> = {
        'draft': '草稿',
        'preview': '預覽',
        'published': '已發布',
        'archived': '已封存'
      }

      const emoji = statusEmoji[status] || '📄'

      return {
        title,
        subtitle: `/${subtitle} • ${statusLabel[status] || '未知'} • v${version}`,
        // Sanity 需要一個可渲染的 React 節點或函數，直接傳字串會被當作標籤名造成錯誤
        media: () => emoji
      }
    }
  },
  orderings: [
    {
      title: '發布時間 (新到舊)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    },
    {
      title: '修改時間 (新到舊)',
      name: 'lastModifiedDesc',
      by: [{ field: 'lastModified', direction: 'desc' }]
    },
    {
      title: '標題 (A-Z)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ]
})

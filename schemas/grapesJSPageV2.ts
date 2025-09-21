import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'grapesJSPageV2',
  title: 'GrapesJS 頁面 V2',
  type: 'document',
  groups: [
    { name: 'content', title: '頁面內容', default: true },
    { name: 'design', title: '設計數據' },
    { name: 'modules', title: '模組設定' },
    { name: 'seo', title: 'SEO 設定' },
    { name: 'settings', title: '頁面設定' },
    { name: 'editor', title: 'GrapesJS 編輯器' }
  ],
  fields: [
    // 一鍵開啟 GrapesJS 編輯器（按鈕）
    defineField({
      name: 'openGrapesEditor',
      title: '開啟 GrapesJS 編輯器',
      type: 'string',
      group: 'editor',
      readOnly: true,
      components: {
        input: function OpenGrapesEditorButton() {
          const React = require('react')
          const { useFormValue } = require('sanity')

          const id = useFormValue(['_id']) as string | undefined
          const publishedId = (id || '').replace(/^drafts\./, '')
          const isReady = Boolean(publishedId)

          const handleClick = () => {
            if (!isReady) return
            const url = `/cms/editor?docId=${encodeURIComponent(publishedId)}&type=grapesJSPageV2`
            if (typeof window !== 'undefined') {
              // 在同一個視窗中導航，保留 Sanity 頁首
              window.location.href = url
            }
          }

          return React.createElement(
            'div',
            { style: { padding: '12px 0' } },
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: handleClick,
                disabled: !isReady,
                style: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: isReady ? 'pointer' : 'not-allowed',
                  opacity: isReady ? 1 : 0.6
                }
              },
              'GrapesJS 編輯器'
            ),
            React.createElement(
              'div',
              { style: { marginTop: '8px', fontSize: '12px', opacity: 0.8 } },
              isReady ? '於新視窗開啟 GrapesJS 編輯器' : '請先儲存或發布文件以取得 ID'
            )
          )
        }
      },
      description: '點擊按鈕將在新視窗中開啟 GrapesJS 編輯器'
    }),
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
      title: '網址別名',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: '頁面描述',
      type: 'text',
      group: 'content',
      rows: 3
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

    // GrapesJS 設計數據
    defineField({
      name: 'grapesHtml',
      title: 'HTML 內容',
      type: 'text',
      group: 'design',
      description: 'GrapesJS 生成的最終 HTML 代碼'
    }),
    defineField({
      name: 'grapesCss',
      title: 'CSS 樣式',
      type: 'text',
      group: 'design',
      description: 'GrapesJS 生成的 CSS 代碼'
    }),
    defineField({
      name: 'grapesComponents',
      title: '組件結構數據',
      type: 'text',
      group: 'design',
      description: 'GrapesJS 組件樹的完整 JSON 數據',
      hidden: true
    }),
    defineField({
      name: 'grapesStyles',
      title: '樣式結構數據',
      type: 'text',
      group: 'design',
      description: 'GrapesJS 樣式管理器的 JSON 數據',
      hidden: true
    }),

    // 首頁模組配置（與現有的 homePage schema 相容）
    defineField({
      name: 'homeModules',
      title: '首頁模組配置',
      type: 'array',
      group: 'modules',
      description: '從 GrapesJS 編輯器提取的首頁模組設定',
      of: [
        // 主橫幅模組
        {
          type: 'object',
          name: 'mainBannerModule',
          title: '主橫幅模組',
          fields: [
            { name: 'moduleType', type: 'string', initialValue: 'mainBanner', hidden: true },
            { name: 'isActive', title: '啟用', type: 'boolean', initialValue: true },
            { name: 'order', title: '排序', type: 'number' },
            { name: 'settings', title: '輪播設定', type: 'mainBanner' }
          ]
        },
        // 服務卡片模組
        {
          type: 'object',
          name: 'serviceCardsModule',
          title: '服務卡片模組',
          fields: [
            { name: 'moduleType', type: 'string', initialValue: 'serviceCardSection', hidden: true },
            { name: 'isActive', title: '啟用', type: 'boolean', initialValue: true },
            { name: 'order', title: '排序', type: 'number' },
            { name: 'settings', title: '服務設定', type: 'serviceCardSection' }
          ]
        },
        // 圖文區塊模組
        {
          type: 'object',
          name: 'imageTextModule',
          title: '圖文區塊模組',
          fields: [
            { name: 'moduleType', type: 'string', initialValue: 'imageTextBlock', hidden: true },
            { name: 'isActive', title: '啟用', type: 'boolean', initialValue: true },
            { name: 'order', title: '排序', type: 'number' },
            { name: 'settings', title: '圖文設定', type: 'imageTextBlock' }
          ]
        },
        // 精選商品模組
        {
          type: 'object',
          name: 'featuredProductsModule',
          title: '精選商品模組',
          fields: [
            { name: 'moduleType', type: 'string', initialValue: 'featuredProducts', hidden: true },
            { name: 'isActive', title: '啟用', type: 'boolean', initialValue: true },
            { name: 'order', title: '排序', type: 'number' },
            { name: 'settings', title: '商品設定', type: 'featuredProducts' }
          ]
        },
        // 部落格文章模組
        {
          type: 'object',
          name: 'blogSectionModule',
          title: '部落格文章模組',
          fields: [
            { name: 'moduleType', type: 'string', initialValue: 'blogSection', hidden: true },
            { name: 'isActive', title: '啟用', type: 'boolean', initialValue: true },
            { name: 'order', title: '排序', type: 'number' },
            { name: 'settings', title: '文章設定', type: 'blogSection' }
          ]
        },
        // YouTube 影片模組
        {
          type: 'object',
          name: 'youtubeSectionModule',
          title: 'YouTube 影片模組',
          fields: [
            { name: 'moduleType', type: 'string', initialValue: 'youtubeSection', hidden: true },
            { name: 'isActive', title: '啟用', type: 'boolean', initialValue: true },
            { name: 'order', title: '排序', type: 'number' },
            { name: 'settings', title: '影片設定', type: 'youtubeSection' }
          ]
        },
        // 內容區塊模組
        {
          type: 'object',
          name: 'contentSectionModule',
          title: '內容區塊模組',
          fields: [
            { name: 'moduleType', type: 'string', initialValue: 'contentSection', hidden: true },
            { name: 'isActive', title: '啟用', type: 'boolean', initialValue: true },
            { name: 'order', title: '排序', type: 'number' },
            { name: 'settings', title: '內容設定', type: 'contentSection' }
          ]
        }
      ],
      options: {
        sortable: true
      }
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

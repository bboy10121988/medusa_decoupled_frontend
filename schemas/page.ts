import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'page',
  title: '頁面（GrapesJS）',
  type: 'document',
  groups: [
    { name: 'content', title: '內容', default: true },
    { name: 'design', title: '設計資料' },
    { name: 'seo', title: 'SEO' },
    { name: 'settings', title: '設定' }
  ],
  fields: [
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
      name: 'status',
      title: '狀態',
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
      name: 'html',
      title: 'HTML 內容',
      type: 'text',
      group: 'design',
      rows: 10,
      description: 'GrapesJS 產生的 HTML'
    }),
    defineField({
      name: 'css',
      title: 'CSS 樣式',
      type: 'text',
      group: 'design',
      rows: 10,
      description: 'GrapesJS 產生的 CSS'
    }),
    defineField({
      name: 'components',
      title: '元件結構 JSON',
      type: 'text',
      group: 'design',
      hidden: true,
    }),
    defineField({
      name: 'styles',
      title: '樣式結構 JSON',
      type: 'text',
      group: 'design',
      hidden: true,
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO 標題',
      type: 'string',
      group: 'seo'
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO 描述',
      type: 'text',
      rows: 3,
      group: 'seo'
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO 關鍵字',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'seo'
    }),
    defineField({
      name: 'customCSS',
      title: '自訂 CSS',
      type: 'text',
      group: 'design',
      rows: 6
    }),
    defineField({
      name: 'customJS',
      title: '自訂 JavaScript',
      type: 'text',
      group: 'design',
      rows: 6
    }),
    defineField({
      name: 'viewport',
      title: '預覽裝置',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: '響應式', value: 'responsive' },
          { title: '桌機', value: 'desktop' },
          { title: '平板', value: 'tablet' },
          { title: '手機', value: 'mobile' }
        ],
      },
      initialValue: 'responsive'
    }),
    defineField({
      name: 'publishedAt',
      title: '發布時間',
      type: 'datetime',
      group: 'settings'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      status: 'status'
    },
    prepare({ title, subtitle, status }) {
      return {
        title: title || '未命名頁面',
        subtitle: `${status || 'draft'} • ${subtitle || '未設定 slug'}`
      }
    }
  }
})

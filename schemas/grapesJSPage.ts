import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'grapesJSPage',
  title: 'GrapesJS 頁面',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '頁面標題',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: '網址別名',
      type: 'slug',
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
      options: {
        list: [
          { title: '草稿', value: 'draft' },
          { title: '已發布', value: 'published' }
        ]
      },
      initialValue: 'draft'
    }),
    defineField({
      name: 'grapesHtml',
      title: 'HTML 內容',
      type: 'text',
      description: 'GrapesJS 生成的 HTML 代碼'
    }),
    defineField({
      name: 'grapesCss',
      title: 'CSS 樣式',
      type: 'text',
      description: 'GrapesJS 生成的 CSS 代碼'
    }),
    defineField({
      name: 'grapesComponents',
      title: '組件數據',
      type: 'text',
      description: 'GrapesJS 組件的 JSON 數據',
      hidden: true // 在編輯器中隱藏，只供程式使用
    }),
    defineField({
      name: 'grapesStyles',
      title: '樣式數據',
      type: 'text',
      description: 'GrapesJS 樣式的 JSON 數據',
      hidden: true // 在編輯器中隱藏，只供程式使用
    }),
    defineField({
      name: 'seo',
      title: 'SEO 設定',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta 標題',
          type: 'string',
          validation: (Rule) => Rule.max(60)
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta 描述',
          type: 'text',
          validation: (Rule) => Rule.max(160)
        }),
        defineField({
          name: 'ogImage',
          title: 'Open Graph 圖片',
          type: 'image'
        })
      ]
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
        title,
        subtitle: `/${subtitle} • ${status === 'published' ? '已發布' : '草稿'}`,
        media: status === 'published' ? '🌐' : '📝'
      }
    }
  }
})

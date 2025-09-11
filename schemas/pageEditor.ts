import { defineType, defineField } from 'sanity'
import { ComponentIcon } from '@sanity/icons'

export default defineType({
  name: 'pageEditor',
  title: '頁面編輯器',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'title',
      title: '頁面標題',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'URL 路徑',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: '頁面描述',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'htmlContent',
      title: 'HTML 內容',
      type: 'text',
      description: '在下方的 GrapesJS 編輯器中編輯，然後將生成的 HTML 代碼貼到這裡',
      rows: 10
    }),
    defineField({
      name: 'cssStyles',
      title: 'CSS 樣式',
      type: 'text',
      description: '從 GrapesJS 編輯器生成的 CSS 樣式代碼',
      rows: 10
    }),
    defineField({
      name: 'editorUrl',
      title: '編輯器鏈接',
      type: 'url',
      description: '點擊此鏈接在新視窗中打開 GrapesJS 編輯器',
      initialValue: '/studio'
    }),
    defineField({
      name: 'publishedAt',
      title: '發布時間',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'isPublished',
      title: '已發布',
      type: 'boolean',
      initialValue: false
    })
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
      isPublished: 'isPublished',
      publishedAt: 'publishedAt'
    },
    prepare({ title, description, isPublished, publishedAt }) {
      return {
        title: title || '未命名頁面',
        subtitle: `${isPublished ? '✅ 已發布' : '📝 草稿'} • ${description || '無描述'}`,
        media: ComponentIcon
      }
    }
  },
  orderings: [
    {
      title: '發布時間，最新的在前',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
    {
      title: '標題 A-Z',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    }
  ]
})

import { Rule } from '@sanity/types'

export default {
  name: 'pages',
  title: '動態頁面',
  type: 'document',
  icon: () => '📄',
  fields: [
    {
      name: 'title',
      title: '頁面標題',
      type: 'string',
      description: '顯示在頁面內容區域的標題，瀏覽器分頁標題將使用SEO設定中的預設網站標題',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: '頁面路徑',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'isActive',
      title: '啟用狀態',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'seo',
      title: 'SEO 設定',
      type: 'seoMeta',
      options: {
        collapsible: true,
        collapsed: false,
      },
    },
    {
      name: 'mainSections',
      title: '頁面區塊',
      type: 'array',
      of: [
        { type: 'mainBanner' },
        { type: 'imageTextBlock' },
        { type: 'featuredProducts' },
        { type: 'blogSection' },
        { type: 'youtubeSection' },
        { type: 'contentSection' },
        { type: 'serviceCardSection' },
      ],
      validation: (Rule: Rule) => Rule.min(1).error('至少需要一個頁面區塊'),
    },
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      isActive: 'isActive',
    },
    prepare(selection: {title: string, slug: string, isActive: boolean}) {
      const { title, slug, isActive } = selection
      return {
        title: title || '未命名頁面',
        subtitle: `/${slug || 'no-slug'} ${isActive ? '✅' : '❌'}`,
      }
    },
  },
}

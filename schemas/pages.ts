import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pages',
  title: '動態頁面',
  type: 'document',
  icon: () => '📄',
  groups: [
    {
      name: 'content',
      title: '內容',
      default: true
    },
    {
      name: 'seo',
      title: 'SEO'
    },
    {
      name: 'social',
      title: '社群分享'
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: '頁面標題',
      type: 'string',
      validation: (Rule) => Rule.required().min(1).max(100).error('標題必填，且限制在 100 字元內'),
      group: 'content'
    }),
    defineField({
      name: 'slug',
      title: '網址路徑',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context)
      },
      validation: (Rule) => Rule.required().error('網址路徑為必填'),
      group: 'content'
    }),
    defineField({
      name: 'pageStatus',
      title: '頁面狀態',
      type: 'string',
      options: {
        list: [
          { title: '草稿', value: 'draft' },
          { title: '已發布', value: 'published' }
        ],
        layout: 'radio'
      },
      initialValue: 'draft',
      description: '草稿不會顯示在網站上,只有已發布的頁面才會對外顯示',
      validation: (Rule) => Rule.required(),
      group: 'content'
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO 描述',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('建議不超過 160 字元以獲得最佳 SEO 效果'),
      group: 'seo'
    }),
    defineField({
      name: 'additionalKeywords',
      title: 'SEO 關鍵字',
      type: 'array',
      of: [{ type: 'string' }],
      description: '與此頁面相關的關鍵字,用於 meta keywords',
      group: 'seo'
    }),
    defineField({
      name: 'noIndex',
      title: '不索引此頁面',
      type: 'boolean',
      initialValue: false,
      description: '勾選後搜尋引擎將不會索引此頁面',
      group: 'seo'
    }),
    defineField({
      name: 'canonicalUrl',
      title: '標準網址',
      type: 'url',
      description: '如果此頁面內容重複，請指定標準版本的網址',
      group: 'seo'
    }),
    defineField({
      name: 'ogTitle',
      title: 'Facebook/社群標題',
      type: 'string',
      group: 'social'
    }),
    defineField({
      name: 'ogDescription',
      title: 'Facebook/社群描述',
      type: 'text',
      rows: 2,
      group: 'social'
    }),
    defineField({
      name: 'ogImage',
      title: '社群分享圖片',
      type: 'image',
      options: { hotspot: true, metadata: ['blurhash','exif','location','palette'] },
      group: 'social',
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
      options: {
        list: [
          { title: '摘要 (Summary)', value: 'summary' },
          { title: '大圖摘要 (Summary Large Image)', value: 'summary_large_image' },
          { title: '應用程式 (App)', value: 'app' },
          { title: '播放器 (Player)', value: 'player' }
        ]
      },
      initialValue: 'summary_large_image',
      group: 'social'
    }),
    defineField({
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
      validation: (Rule) => Rule.min(1).error('至少需要一個頁面區塊'),
      group: 'content'
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      pageStatus: 'pageStatus',
    },
    prepare(selection: {title: string, slug: string, pageStatus: string}) {
      const { title, slug, pageStatus } = selection
      const statusIcon = pageStatus === 'published' ? '✅' : '📝'
      const statusText = pageStatus === 'published' ? '已發布' : '草稿'
      return {
        title: title || '未命名頁面',
        subtitle: `/${slug || 'no-slug'} • ${statusIcon} ${statusText}`,
      }
    },
  },
})

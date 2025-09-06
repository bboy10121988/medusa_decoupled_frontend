import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'pages',
  title: '動態頁面',
  type: 'document',
  icon: () => '📄',
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
      name: 'isActive',
      title: '啟用頁面',
      type: 'boolean',
      initialValue: false,
      description: '勾選後此頁面才會顯示在網站上',
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
      name: 'focusKeyword',
      title: '主要關鍵字',
      type: 'string',
      description: '此頁面要優化的主要關鍵字',
      group: 'seo'
    }),
    defineField({
      name: 'additionalKeywords',
      title: '相關關鍵字',
      type: 'array',
      of: [{ type: 'string' }],
      description: '與此頁面相關的其他關鍵字',
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
      name: 'priority',
      title: '頁面優先級',
      type: 'number',
      initialValue: 0.8,
      group: 'advanced'
    }),
    defineField({
      name: 'changeFrequency',
      title: '更新頻率',
      type: 'string',
      options: {
        list: [
          { title: '每日 (Daily)', value: 'daily' },
          { title: '每週 (Weekly)', value: 'weekly' },
          { title: '每月 (Monthly)', value: 'monthly' },
          { title: '每年 (Yearly)', value: 'yearly' },
          { title: '從不 (Never)', value: 'never' }
        ]
      },
      initialValue: 'weekly',
      group: 'advanced'
    }),
    defineField({
      name: 'structuredDataType',
      title: '結構化資料類型',
      type: 'string',
      options: {
        list: [
          { title: '無', value: 'none' },
          { title: '網頁 (WebPage)', value: 'webpage' },
          { title: '常見問題 (FAQ)', value: 'faq' },
          { title: '麵包屑 (BreadcrumbList)', value: 'breadcrumb' }
        ]
      },
      initialValue: 'webpage',
      group: 'structured'
    }),
    defineField({
      name: 'customJsonLd',
      title: '自訂 JSON-LD',
      type: 'text',
      rows: 8,
      group: 'structured'
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
    },
    {
      name: 'advanced',
      title: '進階設定'
    },
    {
      name: 'structured',
      title: '結構化資料'
    }
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
})

import { Rule } from '@sanity/types'

export default {
  name: 'pages',
  title: '動態頁面',
  type: 'document',
  icon: () => '📄',
  groups: [
    { name: 'content', title: '頁面內容', default: true },
    { name: 'basic', title: '基本 SEO 設定' },
    { name: 'social', title: '社群媒體分享' },
    { name: 'advanced', title: '進階設定' },
    { name: 'structured', title: '結構化資料' }
  ],
  fields: [
    {
      name: 'title',
      title: '頁面標題',
      type: 'string',
      description: '顯示在頁面內容區域的標題，瀏覽器分頁標題將使用SEO設定中的預設網站標題',
      validation: (Rule: Rule) => Rule.required(),
      group: 'content'
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
      group: 'content'
    },
    {
      name: 'isActive',
      title: '啟用狀態',
      type: 'boolean',
      initialValue: true,
      group: 'content'
    },
    // Flattened SEO fields (moved from seoMeta into top-level fields)
    {
      name: 'seoTitle',
      title: 'SEO 標題',
      type: 'string',
      description: '搜尋引擎顯示的標題（建議 50-60 字元）- 留空則使用頁面標題',
      group: 'basic'
    },
    {
      name: 'seoDescription',
      title: 'SEO 描述',
      type: 'text',
      description: '搜尋引擎顯示的描述（建議 140-160 字元）',
      rows: 3,
      group: 'basic'
    },
    {
      name: 'focusKeyword',
      title: '目標關鍵字',
      type: 'string',
      description: '此頁面主要優化的關鍵字（建議 1-3 個詞）',
      group: 'basic'
    },
    {
      name: 'seoKeywords',
      title: '相關關鍵字',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: '與頁面內容相關的關鍵字',
      group: 'basic'
    },
    {
      name: 'canonicalUrl',
      title: '標準網址 (Canonical URL)',
      type: 'url',
      description: '指定此頁面的首選網址',
      group: 'advanced'
    },
    {
      name: 'noIndex',
      title: '禁止搜尋引擎索引',
      type: 'boolean',
      initialValue: false,
      group: 'advanced'
    },
    {
      name: 'noFollow',
      title: '禁止跟隨連結',
      type: 'boolean',
      initialValue: false,
      group: 'advanced'
    },
    {
      name: 'ogTitle',
      title: 'Facebook/社群標題',
      type: 'string',
      group: 'social'
    },
    {
      name: 'ogDescription',
      title: 'Facebook/社群描述',
      type: 'text',
      rows: 2,
      group: 'social'
    },
    {
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
    },
    {
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
    },
    {
      name: 'priority',
      title: '頁面優先級',
      type: 'number',
      initialValue: 0.8,
      group: 'advanced'
    },
    {
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
    },
    {
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
    },
    {
      name: 'customJsonLd',
      title: '自訂 JSON-LD',
      type: 'text',
      rows: 8,
      group: 'structured'
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
      group: 'content'
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

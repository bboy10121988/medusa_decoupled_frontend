export default {
  name: 'homePage',
  title: '首頁',
  type: 'document',
  groups: [
    { name: 'sectionsGroup', title: '頁面區塊' },
    { name: 'basic', title: '基本 SEO 設定', default: true },
    { name: 'social', title: '社群媒體分享' },
    { name: 'advanced', title: '進階設定' },
    { name: 'structured', title: '結構化資料' }
  ],
  fields: [
    {
      name: 'title',
      title: '標題',
      type: 'string',
      description: '用於SEO和管理目的的標題'
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
          { title: '文章 (Article)', value: 'article' },
          { title: '產品 (Product)', value: 'product' },
          { title: '商店 (LocalBusiness)', value: 'local_business' },
          { title: '常見問題 (FAQ)', value: 'faq' },
          { title: '麵包屑 (BreadcrumbList)', value: 'breadcrumb' },
          { title: '評論 (Review)', value: 'review' }
        ]
      },
      initialValue: 'none',
      group: 'structured'
    },
    {
      name: 'articleType',
      title: '文章類型',
      type: 'string',
      options: {
        list: [
          { title: '新聞文章 (NewsArticle)', value: 'news' },
          { title: '部落格文章 (BlogPosting)', value: 'blog' },
          { title: '技術文章 (TechArticle)', value: 'tech' }
        ]
      },
  hidden: ({ parent }: any) => parent?.structuredDataType !== 'article',
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
        {type: 'mainBanner'},
        {type: 'imageTextBlock'},
        {type: 'featuredProducts'},
        {type: 'blogSection'},
        {type: 'youtubeSection'},
        {type: 'contentSection'},
        {type: 'serviceCardSection'},
      ],
      options: {
        sortable: true
      },
  group: 'sectionsGroup'
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({title}: {title?: string}) {
      return {
        title: title || '首頁'
      }
    }
  }
}

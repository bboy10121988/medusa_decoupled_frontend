export default {
  name: 'post',
  title: '文章',
  type: 'document',
  groups: [
    { name: 'content', title: '文章內容', default: true },
    { name: 'basic', title: '基本 SEO 設定' },
    { name: 'social', title: '社群媒體分享' },
    { name: 'advanced', title: '進階設定' },
    { name: 'structured', title: '結構化資料' }
  ],
  fields: [
    { 
      name: 'title', 
      title: '標題', 
      type: 'string',
      group: 'content'
    },
    {
      name: 'publishedAt',
      title: '發布日期',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      group: 'content'
    },
    {
      name: 'status',
      title: '狀態',
      type: 'string',
      options: {
        list: [
          { title: '草稿', value: 'draft' },
          { title: '已發布', value: 'published' },
        ],
      },
      initialValue: 'draft',
      group: 'content'
    },
    {
      name: 'slug',
      title: '網址代稱',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      group: 'content'
    },
    // Flattened SEO fields (moved from seoMeta into top-level fields)
    {
      name: 'seoTitle',
      title: 'SEO 標題',
      type: 'string',
      description: '搜尋引擎顯示的標題（建議 50-60 字元）- 留空則使用文章標題',
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
      description: '此文章主要優化的關鍵字（建議 1-3 個詞）',
      group: 'basic'
    },
    {
      name: 'seoKeywords',
      title: '相關關鍵字',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: '與文章內容相關的關鍵字',
      group: 'basic'
    },
    {
      name: 'canonicalUrl',
      title: '標準網址 (Canonical URL)',
      type: 'url',
      description: '指定此文章的首選網址',
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
      initialValue: 0.7,
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
      initialValue: 'monthly',
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
          { title: '部落格文章 (BlogPosting)', value: 'blog' },
          { title: '技術文章 (TechArticle)', value: 'tech' }
        ]
      },
      initialValue: 'article',
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
      name: 'author',
      title: '作者',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'content'
    },
    {
      name: 'mainImage',
      title: '封面圖片',
      type: 'image',
      options: { hotspot: true },
      group: 'content',
      fields: [
        {
          name: 'alt',
          title: '替代文字',
          type: 'string',
          description: '封面圖片的替代文字，用於無障礙和 SEO 優化',
          validation: (Rule: any) => Rule.required().error('封面圖片的替代文字為必填欄位')
        }
      ]
    },
    {
      name: 'categories',
      title: '分類',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
      group: 'content'
    },
    {
      name: 'body',
      title: '內文',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content'
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage'
    },
    prepare(selection: any) {
      const { author } = selection
      return Object.assign(selection, {
        subtitle: author && `by ${author}`
      })
    }
  }
}

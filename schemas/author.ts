export default {
  name: 'author',
  title: '作者',
  type: 'document',
  groups: [
    { name: 'content', title: '作者資料', default: true },
    { name: 'basic', title: '基本 SEO 設定' },
    { name: 'social', title: '社群媒體分享' },
    { name: 'advanced', title: '進階設定' },
    { name: 'structured', title: '結構化資料' }
  ],
  fields: [
    { 
      name: 'name', 
      title: '名稱', 
      type: 'string',
      group: 'content'
    },
    { 
      name: 'image', 
      title: '大頭照', 
      type: 'image',
      options: { hotspot: true },
      group: 'content',
      fields: [
        {
          name: 'alt',
          title: '替代文字',
          type: 'string',
          description: '作者大頭照的替代文字，用於無障礙和 SEO 優化',
          validation: (Rule: any) => Rule.required().error('作者大頭照的替代文字為必填欄位')
        }
      ]
    },
    {
      name: 'bio',
      title: '個人簡介',
      type: 'text',
      rows: 3,
      group: 'content'
    },
    // Flattened SEO fields
    {
      name: 'seoTitle',
      title: 'SEO 標題',
      type: 'string',
      description: '搜尋引擎顯示的標題（建議 50-60 字元）- 留空則使用作者名稱',
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
      description: '此作者頁面主要優化的關鍵字（建議 1-3 個詞）',
      group: 'basic'
    },
    {
      name: 'seoKeywords',
      title: '相關關鍵字',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: '與作者相關的關鍵字',
      group: 'basic'
    },
    {
      name: 'canonicalUrl',
      title: '標準網址 (Canonical URL)',
      type: 'url',
      description: '指定此作者頁面的首選網址',
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
      initialValue: 0.6,
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
      initialValue: 'yearly',
      group: 'advanced'
    },
    {
      name: 'structuredDataType',
      title: '結構化資料類型',
      type: 'string',
      options: {
        list: [
          { title: '無', value: 'none' },
          { title: '人員 (Person)', value: 'person' },
          { title: '作者 (Author)', value: 'author' }
        ]
      },
      initialValue: 'person',
      group: 'structured'
    },
    {
      name: 'customJsonLd',
      title: '自訂 JSON-LD',
      type: 'text',
      rows: 8,
      group: 'structured'
    }
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image'
    }
  }
}
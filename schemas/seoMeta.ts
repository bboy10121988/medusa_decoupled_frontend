import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'seoMeta',
  title: 'SEO 搜尋引擎優化設定',
  type: 'object',
  groups: [
    {
      name: 'basic',
      title: '基本 SEO 設定',
      default: true
    },
    {
      name: 'social',
      title: '社群媒體分享'
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
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO 標題',
      type: 'string',
      description: '搜尋引擎顯示的標題（建議 50-60 字元）- 留空則使用頁面標題',
      group: 'basic',
      validation: Rule => Rule.max(60).warning('建議保持在 60 字元以內以確保完整顯示')
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO 描述',
      type: 'text',
      description: '搜尋引擎顯示的描述（建議 140-160 字元）- 這會影響點擊率',
      group: 'basic',
      rows: 3,
      validation: Rule => Rule.max(160).warning('建議保持在 160 字元以內以確保完整顯示')
    }),
    defineField({
      name: 'focusKeyword',
      title: '目標關鍵字',
      type: 'string',
      description: '此頁面主要優化的關鍵字（建議 1-3 個詞）',
      group: 'basic'
    }),
    defineField({
      name: 'seoKeywords',
      title: '相關關鍵字',
      type: 'array',
      of: [{ type: 'string' }],
      description: '與頁面內容相關的關鍵字，有助於搜尋引擎理解內容主題',
      group: 'basic',
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'canonicalUrl',
      title: '標準網址 (Canonical URL)',
      type: 'url',
      description: '指定此頁面的首選網址，用於避免重複內容問題',
      group: 'advanced'
    }),
    defineField({
      name: 'noIndex',
      title: '禁止搜尋引擎索引',
      type: 'boolean',
      description: '勾選此項會阻止搜尋引擎收錄此頁面（適用於登入頁、錯誤頁等）',
      initialValue: false,
      group: 'advanced'
    }),
    defineField({
      name: 'noFollow',
      title: '禁止跟隨連結',
      type: 'boolean',
      description: '勾選此項會阻止搜尋引擎跟隨此頁面的對外連結',
      initialValue: false,
      group: 'advanced'
    }),
    defineField({
      name: 'ogTitle',
      title: 'Facebook/社群標題',
      type: 'string',
      description: 'Facebook、LINE 等平台分享時顯示的標題（留空則使用 SEO 標題）',
      group: 'social',
      validation: Rule => Rule.max(60)
    }),
    defineField({
      name: 'ogDescription',
      title: 'Facebook/社群描述',
      type: 'text',
      description: '社群平台分享時顯示的描述（留空則使用 SEO 描述）',
      group: 'social',
      rows: 2,
      validation: Rule => Rule.max(160)
    }),
    defineField({
      name: 'ogImage',
      title: '社群分享圖片',
      type: 'image',
      description: '建議尺寸：1200x630 像素，檔案小於 1MB',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'exif', 'location', 'palette']
      },
      group: 'social',
      fields: [
        defineField({
          name: 'alt',
          title: '圖片替代文字',
          type: 'string',
          description: '重要：用於無障礙網頁和 SEO 優化的圖片描述',
          validation: Rule => Rule.required().max(125)
        })
      ]
    }),
    defineField({
      name: 'twitterCard',
      title: 'Twitter 卡片類型',
      type: 'string',
      description: 'Twitter 分享時的顯示格式',
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
      description: 'Sitemap 中的優先級 (0.0-1.0)，首頁建議 1.0，重要頁面 0.8',
      validation: Rule => Rule.min(0).max(1),
      initialValue: 0.8,
      group: 'advanced'
    }),
    defineField({
      name: 'changeFrequency',
      title: '更新頻率',
      type: 'string',
      description: '告訴搜尋引擎此頁面的更新頻率',
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
      description: '選擇適合的 Schema.org 類型以改善搜尋結果顯示',
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
    }),
    defineField({
      name: 'articleType',
      title: '文章類型',
      type: 'string',
      description: '當選擇「文章」結構化資料時使用',
      options: {
        list: [
          { title: '新聞文章 (NewsArticle)', value: 'news' },
          { title: '部落格文章 (BlogPosting)', value: 'blog' },
          { title: '技術文章 (TechArticle)', value: 'tech' }
        ]
      },
      hidden: ({ parent }) => parent?.structuredDataType !== 'article',
      group: 'structured'
    }),
    defineField({
      name: 'customJsonLd',
      title: '自訂 JSON-LD',
      type: 'text',
      description: '進階用戶：直接輸入自訂的 JSON-LD 結構化資料',
      rows: 8,
      group: 'structured'
    })
  ],
  preview: {
    select: {
      title: 'seoTitle',
      description: 'seoDescription',
      noIndex: 'noIndex'
    },
    prepare({ title, description, noIndex }) {
      return {
        title: title || '使用預設標題',
        subtitle: `${description ? '已設定描述' : '無描述'} ${noIndex ? '🚫 不索引' : '✅ 可索引'}`,
        media: noIndex ? '🚫' : '🔍'
      }
    }
  }
})

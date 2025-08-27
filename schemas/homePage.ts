export default {
  name: 'homePage',
  title: '首頁',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: '標題',
      type: 'string',
      description: '用於SEO和管理目的的標題'
    },
    {
      name: 'seo',
      title: 'SEO設定',
      type: 'seoMeta',
      description: '搜尋引擎優化設定'
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
      }
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

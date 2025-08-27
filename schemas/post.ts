export default {
  name: 'post',
  title: '文章',
  type: 'document',
  fields: [
    { name: 'title', title: '標題', type: 'string' },
    {
      name: 'publishedAt',
      title: '發布日期',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
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
    },
    {
      name: 'slug',
      title: '網址代稱',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
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
      name: 'author',
      title: '作者',
      type: 'reference',
      to: [{ type: 'author' }],
    },
    {
      name: 'mainImage',
      title: '封面圖片',
      type: 'image',
      options: { hotspot: true },
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
    },
    {
      name: 'body',
      title: '內文',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
}

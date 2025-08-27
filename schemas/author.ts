export default {
  name: 'author',
  title: '作者',
  type: 'document',
  fields: [
    { name: 'name', title: '名稱', type: 'string' },
    { 
      name: 'image', 
      title: '大頭照', 
      type: 'image',
      options: { hotspot: true },
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
  ],
}
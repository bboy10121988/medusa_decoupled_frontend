import { Rule } from '@sanity/types'

export default {
  name: 'blogSection',
  title: '部落格文章區塊',
  type: 'object',
  fields: [
    {
      name: 'isActive',
      title: '是否啟用',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'title',
      title: '標題',
      type: 'string'
    },
    {
      name: 'category',
      title: '文章分類',
      type: 'reference',
      to: [{type: 'category'}]
    },
    {
      name: 'limit',
      title: '顯示文章數量',
      type: 'number',
      initialValue: 6,
      validation: (Rule: Rule) => Rule.required().min(1).max(12),
      description: '設定最多顯示幾篇文章'
    },
    {
      name: 'postsPerRow',
      title: '每行文章數量',
      type: 'number',
      initialValue: 3,
      validation: (Rule: Rule) => Rule.required().min(1).max(4),
      description: '設定每行要顯示幾篇文章'
    }
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category.title'
    },
    prepare({title, category}: {title: string, category: string}) {
      return {
        title: title || '部落格文章區塊',
        subtitle: category ? `分類: ${category}` : ''
      }
    }
  }
}

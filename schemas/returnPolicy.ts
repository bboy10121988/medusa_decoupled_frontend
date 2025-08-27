import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'returnPolicy',
  title: '退換貨政策',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '標題',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'highlights',
      title: '政策亮點 (用於產品頁)',
      description: '最多可新增3個政策亮點',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: '標題', type: 'string' },
            { 
              name: 'description', 
              title: '描述', 
              type: 'array', 
              of: [{ type: 'block' }]
            }
          ]
        }
      ],
      validation: Rule => Rule.max(3)
    }),
    defineField({
      name: 'fullPolicy',
      title: '完整退換貨政策',
      description: '使用 HTML 編輯器編寫完整的退換貨政策內容',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      title: 'title',
      _updatedAt: '_updatedAt'
    },
    prepare(selection) {
      const { title, _updatedAt } = selection
      return {
        title,
        subtitle: `最後更新: ${_updatedAt ? new Date(_updatedAt).toLocaleDateString('zh-TW') : '未發布'}`
      }
    }
  }
})

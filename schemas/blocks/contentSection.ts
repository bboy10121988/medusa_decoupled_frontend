export default {
  name: 'contentSection',
  title: '一般內容區塊',
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
      name: 'hideTitle',
      title: '隱藏標題',
      type: 'boolean',
      description: '若勾選則隱藏標題，同時調整上下間距',
      initialValue: false
    },
    {
      name: 'content',
      title: '內容',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({title}: {title?: string}) {
      return {
        title: title || '一般內容區塊'
      }
    }
  }
}

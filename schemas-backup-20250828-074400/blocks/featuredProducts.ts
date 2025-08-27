export default {
  name: 'featuredProducts',
  title: '精選商品區塊',
  type: 'object',
  fields: [
    {
      name: 'isActive',
      title: '是否啟用',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'heading',
      title: '標題',
      type: 'string'
    },
    {
      name: 'collection_id',
      title: '商品系列 ID',
      type: 'string',
      description: '請輸入 Medusa 商品系列的 ID'
    },
    {
      name: 'showHeading',
      title: '顯示標題',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'showSubheading',
      title: '顯示副標題',
      type: 'boolean',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'heading'
    },
    prepare({title}: {title: string}) {
      return {
        title: title || '精選商品區塊'
      }
    }
  }
}

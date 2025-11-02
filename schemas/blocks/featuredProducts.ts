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
      type: 'string',
      description: '此標題會顯示在首頁和精選商品頁面'
    },
    {
      name: 'collection_id',
      title: '商品系列 ID',
      type: 'string',
      description: '請輸入 Medusa 商品系列的 ID (例如: pcol_01K8ZZ5BDHXZBPQTQ01ZPWDMC8)'
    },
    {
      name: 'showHeading',
      title: '顯示標題',
      type: 'boolean',
      initialValue: true,
      description: '控制是否在首頁和精選商品頁面顯示標題'
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

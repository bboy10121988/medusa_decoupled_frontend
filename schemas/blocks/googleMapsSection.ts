export default {
  name: 'googleMapsSection',
  title: '地圖區塊',
  type: 'object',
  fields: [
    {
      name: 'heading',
      title: '標題',
      type: 'string',
      description: '地圖區塊的標題'
    },
    {
      name: 'description',
      title: '描述',
      type: 'text',
      rows: 2,
      description: '地圖區塊的描述文字'
    },
    {
      name: 'googleMapsUrl',
      title: 'Google Maps 嵌入網址',
      type: 'url',
      description: '從 Google Maps 取得的嵌入式地圖網址'
    },
    {
      name: 'mapHeight',
      title: '地圖高度',
      type: 'number',
      initialValue: 450,
      description: '地圖的高度（像素）'
    },
    {
      name: 'isActive',
      title: '啟用此區塊',
      type: 'boolean',
      initialValue: false,
      description: '控制此區塊是否在前端顯示'
    }
  ],
  preview: {
    select: {
      heading: 'heading',
      isActive: 'isActive'
    },
    prepare({ heading, isActive }: { heading?: string; isActive?: boolean }) {
      return {
        title: heading || '地圖區塊',
        subtitle: isActive ? '✅ 已啟用' : '❌ 已停用'
      }
    }
  }
}
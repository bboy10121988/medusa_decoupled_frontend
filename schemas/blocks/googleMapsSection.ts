export default {
  name: 'googleMapsSection',
  title: '地圖區塊',
  type: 'object',
  groups: [
    { name: 'display', title: '顯示設定', default: true },
    { name: 'location', title: '地點資訊' },
    { name: 'business', title: '營業資訊' }
  ],
  fields: [
    {
      name: 'heading',
      title: '標題',
      type: 'string',
      description: '地圖區塊的標題',
      group: 'display'
    },
    {
      name: 'description',
      title: '描述',
      type: 'text',
      rows: 2,
      description: '地圖區塊的描述文字',
      group: 'display'
    },
    {
      name: 'googleMapsUrl',
      title: 'Google Maps 嵌入網址',
      type: 'url',
      description: '從 Google Maps 取得的嵌入式地圖網址',
      group: 'display'
    },
    {
      name: 'mapHeight',
      title: '地圖高度',
      type: 'number',
      initialValue: 450,
      description: '地圖的高度（像素）',
      group: 'display'
    },
    // 商店資訊欄位 (用於 SEO 結構化資料)
    {
      name: 'businessName',
      title: '商店名稱',
      type: 'string',
      description: '完整的商店名稱',
      initialValue: "Tim's fantasy World 男士理髮廳",
      group: 'business'
    },
    {
      name: 'telephone',
      title: '聯絡電話',
      type: 'string',
      description: '格式: +886-2-XXXX-XXXX',
      initialValue: '+886-2-2755-8828',
      group: 'business'
    },
    {
      name: 'streetAddress',
      title: '街道地址',
      type: 'string',
      initialValue: '信義路四段265巷12弄14號',
      group: 'location'
    },
    {
      name: 'addressLocality',
      title: '城市',
      type: 'string',
      initialValue: '台北市',
      group: 'location'
    },
    {
      name: 'addressRegion',
      title: '區域',
      type: 'string',
      initialValue: '大安區',
      group: 'location'
    },
    {
      name: 'postalCode',
      title: '郵遞區號',
      type: 'string',
      initialValue: '106',
      group: 'location'
    },
    {
      name: 'latitude',
      title: '緯度',
      type: 'number',
      description: '從 Google Maps 取得',
      initialValue: 25.030775,
      group: 'location'
    },
    {
      name: 'longitude',
      title: '經度',
      type: 'number',
      description: '從 Google Maps 取得',
      initialValue: 121.527158,
      group: 'location'
    },
    {
      name: 'openingHours',
      title: '營業時間',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'days',
            title: '營業日',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
              list: [
                { title: '星期一', value: 'Monday' },
                { title: '星期二', value: 'Tuesday' },
                { title: '星期三', value: 'Wednesday' },
                { title: '星期四', value: 'Thursday' },
                { title: '星期五', value: 'Friday' },
                { title: '星期六', value: 'Saturday' },
                { title: '星期日', value: 'Sunday' }
              ]
            }
          },
          {
            name: 'opens',
            title: '開始時間',
            type: 'string',
            description: '格式: HH:MM (24小時制)',
            initialValue: '11:00'
          },
          {
            name: 'closes',
            title: '結束時間',
            type: 'string',
            description: '格式: HH:MM (24小時制)',
            initialValue: '20:00'
          }
        ]
      }],
      initialValue: [
        {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '11:00',
          closes: '20:00'
        }
      ],
      group: 'business'
    },
    {
      name: 'priceRange',
      title: '價格範圍',
      type: 'string',
      options: {
        list: [
          { title: '$ (平價)', value: '$' },
          { title: '$$ (中等)', value: '$$' },
          { title: '$$$ (偏高)', value: '$$$' },
          { title: '$$$$ (高價)', value: '$$$$' }
        ]
      },
      initialValue: '$$',
      group: 'business'
    },
    {
      name: 'isActive',
      title: '啟用此區塊',
      type: 'boolean',
      initialValue: false,
      description: '控制此區塊是否在前端顯示',
      group: 'display'
    }
  ],
  preview: {
    select: {
      heading: 'heading',
      isActive: 'isActive',
      businessName: 'businessName'
    },
    prepare({ heading, isActive, businessName }: { heading?: string; isActive?: boolean; businessName?: string }) {
      return {
        title: businessName || heading || '地圖區塊',
        subtitle: isActive ? '✅ 已啟用' : '❌ 已停用'
      }
    }
  }
}
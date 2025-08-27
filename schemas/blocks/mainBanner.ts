export default {
  name: 'mainBanner',
  title: '主橫幅區塊',
  type: 'object',
  fields: [
    {
      name: 'isActive',
      title: '是否啟用',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'settings',
      title: '輪播設定',
      type: 'object',
      fields: [
        {
          name: 'autoplay',
          title: '自動播放',
          type: 'boolean',
          initialValue: true
        },
        {
          name: 'autoplaySpeed',
          title: '自動播放間隔(秒)',
          type: 'number',
          initialValue: 5
        },
        {
          name: 'showArrows',
          title: '顯示箭頭',
          type: 'boolean',
          initialValue: true
        },
        {
          name: 'showDots',
          title: '顯示指示點',
          type: 'boolean',
          initialValue: true
        }
      ]
    },
    {
      name: 'slides',
      title: '輪播項目',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'backgroundImage',
              title: '背景圖片',
              type: 'image',
              options: {
                hotspot: true
              },
              fields: [
                {
                  name: 'alt',
                  title: '替代文字',
                  type: 'string',
                  description: '背景圖片的替代文字，用於無障礙和 SEO 優化'
                }
              ]
            },
            {
              name: 'heading',
              title: '標題',
              type: 'string'
            },

            {
              name: 'buttonText',
              title: '按鈕文字',
              type: 'string'
            },
            {
              name: 'buttonLink',
              title: '按鈕連結',
              type: 'url'
            }
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'slides.0.title',
      media: 'slides.0.image'
    },
    prepare({title, media}: {title?: string, media?: any}) {
      return {
        title: title || '主橫幅區塊',
        media
      }
    }
  }
}

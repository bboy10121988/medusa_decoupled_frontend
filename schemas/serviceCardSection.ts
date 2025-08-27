export default {
  name: 'serviceCardSection',
  title: '服務卡片區塊',
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
      initialValue: '我們的服務'
    },
    {
      name: 'subheading',
      title: '副標題',
      type: 'string',
      initialValue: '專業髮型設計服務，由經驗豐富的造型師為您打造專屬風格'
    },
    {
      name: 'cardsPerRow',
      title: '每行卡片數量',
      type: 'number',
      initialValue: 3,
      validation: (Rule: any) => Rule.min(1).max(6)
    },
    {
      name: 'cards',
      title: '服務卡片',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'serviceCard',
          title: '服務卡片',
          fields: [
            {
              name: 'title',
              title: '服務名稱',
              type: 'string',
              validation: (Rule: any) => Rule.required()
            },
            {
              name: 'englishTitle',
              title: '英文名稱',
              type: 'string',
              validation: (Rule: any) => Rule.required()
            },
            {
              name: 'mainPrice',
              title: '主要價格',
              type: 'number',
              validation: (Rule: any) => Rule.required().min(0)
            },
            {
              name: 'priceLabel',
              title: '價格標籤',
              type: 'string',
              options: {
                list: [
                  {title: '起價', value: 'up'},
                  {title: '固定價格', value: 'fixed'}
                ]
              },
              initialValue: 'up'
            },
            {
              name: 'cardImage',
              title: '卡片圖片',
              type: 'image',
              options: {
                hotspot: true
              },
              fields: [
                {
                  name: 'alt',
                  title: '替代文字',
                  type: 'string'
                }
              ]
            },
            {
              name: 'stylists',
              title: '設計師等級',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'serviceStyleLevel',
                  title: '設計師等級',
                  fields: [
                    {
                      name: 'levelName',
                      title: '等級名稱',
                      type: 'string',
                      validation: (Rule: any) => Rule.required()
                    },
                    {
                      name: 'levelOrder',
                      title: '等級順序',
                      type: 'number',
                      validation: (Rule: any) => Rule.required().min(1)
                    },
                    {
                      name: 'price',
                      title: '價格',
                      type: 'number',
                      validation: (Rule: any) => Rule.required().min(0)
                    },
                    {
                      name: 'stylistName',
                      title: '設計師名稱',
                      type: 'string'
                    },
                    {
                      name: 'cardImage',
                      title: '設計師專用圖片',
                      type: 'image',
                      options: {
                        hotspot: true
                      },
                      fields: [
                        {
                          name: 'alt',
                          title: '替代文字',
                          type: 'string'
                        }
                      ]
                    }
                  ],
                  preview: {
                    select: {
                      title: 'levelName',
                      subtitle: 'stylistName',
                      media: 'cardImage'
                    },
                    prepare({title, subtitle, media}: {title?: string, subtitle?: string, media?: any}) {
                      return {
                        title: title || '未命名等級',
                        subtitle: subtitle ? `設計師: ${subtitle}` : '無設計師',
                        media: media
                      }
                    }
                  }
                }
              ]
            }
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'englishTitle',
              media: 'cardImage'
            },
            prepare({title, subtitle, media}: {title?: string, subtitle?: string, media?: any}) {
              return {
                title: title || '未命名服務',
                subtitle: subtitle || '',
                media: media
              }
            }
          }
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'heading',
      subtitle: 'subheading'
    },
    prepare({title, subtitle}: {title?: string, subtitle?: string}) {
      return {
        title: title || '服務卡片區塊',
        subtitle: subtitle || ''
      }
    }
  }
}

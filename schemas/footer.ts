import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'footer',
  title: '頁腳設定',
  type: 'document',
  groups: [
    {
      name: 'general',
      title: '基本設定',
    },
    {
      name: 'content',
      title: '內容區塊',
    },
    {
      name: 'contact',
      title: '聯絡資訊',
    },
    {
      name: 'social',
      title: '社群媒體',
    },
  ],
  fields: [
    // 基本設定
    defineField({
      name: 'title',
      title: '標題',
      type: 'string',
      description: '頁腳設定的內部標題（不會顯示在網站上）',
      validation: rule => rule.required(),
      group: 'general'
    }),
    defineField({
      name: 'logo',
      title: '頁腳標誌',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: 'alt',
          title: '替代文字',
          type: 'string',
          description: '圖片的替代文字，用於無障礙和SEO優化'
        })
      ],
      group: 'general'
    }),
    defineField({
      name: 'logoWidth',
      title: '標誌寬度',
      type: 'number',
      description: '標誌顯示的寬度（像素）',
      group: 'general'
    }),
    defineField({
      name: 'sections',
      title: '頁腳區塊',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'section',
          fields: [
            defineField({
              name: 'title',
              title: '區塊標題',
              type: 'string',
              validation: rule => rule.required()
            }),
            defineField({
              name: 'links',
              title: '連結',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'link',
                  fields: [
                    defineField({
                      name: 'text',
                      title: '顯示文字',
                      type: 'string',
                      validation: rule => rule.required()
                    }),
                    defineField({
                      name: 'url',
                      title: '連結網址',
                      type: 'string',
                      validation: rule => rule.required()
                    })
                  ]
                }
              ]
            })
          ]
        }
      ],
      group: 'content'
    }),
    defineField({
      name: 'contactInfo',
      title: '聯絡資訊',
      type: 'object',
      fields: [
        defineField({
          name: 'phone',
          title: '電話',
          type: 'string'
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string'
        })
      ],
      group: 'contact'
    }),
    defineField({
      name: 'socialMedia',
      title: '社群媒體',
      type: 'object',
      fields: [
        defineField({
          name: 'facebook',
          title: 'Facebook',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: '啟用',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'url',
              title: '連結網址',
              type: 'string'
            })
          ]
        }),
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: '啟用',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'url',
              title: '連結網址',
              type: 'string'
            })
          ]
        }),
        defineField({
          name: 'line',
          title: 'Line',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: '啟用',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'url',
              title: '連結網址',
              type: 'string'
            })
          ]
        }),
        defineField({
          name: 'youtube',
          title: 'YouTube',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: '啟用',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'url',
              title: '連結網址',
              type: 'string'
            })
          ]
        }),
        defineField({
          name: 'twitter',
          title: 'Twitter',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: '啟用',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'url',
              title: '連結網址',
              type: 'string'
            })
          ]
        })
      ],
      group: 'social'
    }),
    defineField({
      name: 'copyright',
      title: '版權文字',
      type: 'string',
      description: '例如: © 2025 公司名稱',
      group: 'general'
    })
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({title}: {title?: string}) {
      return {
        title: title || '頁腳設定'
      }
    }
  }
})

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
                      name: 'linkType',
                      title: '連結類型',
                      type: 'string',
                      options: {
                        list: [
                          { title: '內部連結', value: 'internal' },
                          { title: '外部連結', value: 'external' },
                        ],
                        layout: 'radio',
                      },
                      initialValue: 'external',
                      validation: rule => rule.required()
                    }),
                    defineField({
                      name: 'internalLink',
                      title: '內部頁面路徑',
                      type: 'string',
                      description: '輸入內部頁面路徑，例如: /about 或 /products 或 /return',
                      hidden: ({ parent }) => parent?.linkType !== 'internal',
                      validation: rule => rule.custom((value, context) => {
                        // 如果有值，且值不是以 / 開頭，則顯示錯誤
                        if (value && !value.startsWith('/')) {
                          return '內部連結必須以 / 開頭'
                        }
                        return true
                      })
                    }),
                    defineField({
                      name: 'externalUrl',
                      title: '外部連結網址',
                      type: 'string',
                      description: '輸入完整網址，例如: https://example.com，電話: tel:0912345678，電子郵件: mailto:example@example.com',
                      hidden: ({ parent }) => parent?.linkType !== 'external',
                      // 字串類型沒有 URL 驗證，允許任何格式
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
              type: 'url'
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
              type: 'url'
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
              type: 'url'
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
              type: 'url'
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
              type: 'url'
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

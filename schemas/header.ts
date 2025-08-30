import { ALL_FIELDS_GROUP, defineField, defineType } from 'sanity'

export default defineType({
  name: 'header',
  title: '網站頁首',
  type: 'document',
  groups: [
    { name: 'basic', title: '基本設定', default: true },
    { name: 'navigation', title: '選單' },
    { name: 'marquee', title: '跑馬燈' },
    { ...ALL_FIELDS_GROUP, hidden: true }
  ],
  fields: [
    defineField({
      name: 'logo',
      title: 'LOGO',
      type: 'image',
      group: 'basic',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: '替代文字',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),
    defineField({
      name: 'storeName',
      title: '商店名稱',
      type: 'string',
      group: 'basic',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'logoSize',
      title: '標誌大小設定',
      type: 'object',
      group: 'basic',
      description: '為桌面與行動裝置設定不同的標誌高度',
      fields: [
        defineField({
          name: 'desktop',
          title: '桌面標誌高度（px）',
          type: 'number',
          description: '建議 24-64px',
          validation: Rule => Rule.min(24).max(64),
          initialValue: 36,
        }),
        defineField({
          name: 'mobile',
          title: '行動裝置標誌高度（px）',
          type: 'number',
          description: '建議 20-48px',
          validation: Rule => Rule.min(20).max(48),
          initialValue: 28,
        })
      ],
      options: { collapsible: false }
    }),
    defineField({
      name: 'logoHeight',
      title: '舊欄位 — 標誌高度（px）',
      type: 'number',
      group: 'basic',
      description: '舊欄位 — 請改用上方「標誌大小設定」進行響應式控制',
      validation: Rule => Rule.min(24).max(64),
      initialValue: 36,
      hidden: ({ document }: any) => !!(document?.logoSize?.desktop || document?.logoSize?.mobile)
    }),
    defineField({
      name: 'navigation',
    title: '選單',
      type: 'array',
      group: 'navigation',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: '名稱',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'href',
              title: '連結',
              type: 'string',
              validation: Rule => Rule.required()
            })
          ]
        }
      ]
    }),
    defineField({
      name: 'marquee',
      title: '跑馬燈',
      type: 'object',
      group: 'marquee',
      fields: [
        defineField({
          name: 'enabled',
          title: '啟用',
          type: 'boolean',
          initialValue: false
        }),
        defineField({
          name: 'text1',
          title: '文字 1',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: '啟用',
              type: 'boolean',
              initialValue: true
            }),
            defineField({
              name: 'content',
              title: '內容',
              type: 'string',
              validation: Rule => Rule.max(50)
            })
          ]
        }),
        defineField({
          name: 'text2',
          title: '文字 2',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: '啟用',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'content',
              title: '內容',
              type: 'string',
              validation: Rule => Rule.max(50)
            })
          ]
        }),
        defineField({
          name: 'text3',
          title: '文字 3',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: '啟用',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'content',
              title: '內容',
              type: 'string',
              validation: Rule => Rule.max(50)
            })
          ]
        }),
        defineField({
          name: 'linkUrl',
          title: '連結網址',
          type: 'string'
        }),
        defineField({
          name: 'pauseOnHover',
          title: '滑鼠停留時暫停',
          type: 'boolean',
          initialValue: true
        })
      ]
    })
  ]
})

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'marquee',
  title: '跑馬燈',
  type: 'document',
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
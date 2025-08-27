import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'header',
  title: 'Header',
  type: 'document',
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: Rule => Rule.required()
        })
      ]
    }),
    defineField({
      name: 'storeName',
      title: 'Store Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'logoSize',
      title: 'Logo Size Settings',
      type: 'object',
      description: 'Set different logo heights for desktop and mobile devices',
      fields: [
        defineField({
          name: 'desktop',
          title: 'Desktop Logo Height (px)',
          type: 'number',
          description: 'Logo height for desktop screens (24-64px recommended)',
          validation: Rule => Rule.min(24).max(64),
          initialValue: 36,
        }),
        defineField({
          name: 'mobile',
          title: 'Mobile Logo Height (px)',
          type: 'number',
          description: 'Logo height for mobile screens (20-48px recommended)',
          validation: Rule => Rule.min(20).max(48),
          initialValue: 28,
        })
      ],
      options: {
        collapsible: false
      }
    }),
    defineField({
      name: 'logoHeight',
      title: 'Logo Height (px) - Legacy',
      type: 'number',
      description: 'Legacy field - use Logo Size Settings above for responsive control',
      validation: Rule => Rule.min(24).max(64),
      initialValue: 36,
      hidden: ({ document }: any) => !!(document?.logoSize?.desktop || document?.logoSize?.mobile)
    }),
    defineField({
      name: 'navigation',
      title: 'Navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'string',
              validation: Rule => Rule.required()
            })
          ]
        }
      ]
    }),
    defineField({
      name: 'marquee',
      title: 'Marquee',
      type: 'object',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enabled',
          type: 'boolean',
          initialValue: false
        }),
        defineField({
          name: 'text1',
          title: 'Text 1',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: true
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'string',
              validation: Rule => Rule.max(50)
            })
          ]
        }),
        defineField({
          name: 'text2',
          title: 'Text 2',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'string',
              validation: Rule => Rule.max(50)
            })
          ]
        }),
        defineField({
          name: 'text3',
          title: 'Text 3',
          type: 'object',
          fields: [
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: false
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'string',
              validation: Rule => Rule.max(50)
            })
          ]
        }),
        defineField({
          name: 'linkUrl',
          title: 'Link URL',
          type: 'string'
        }),
        defineField({
          name: 'pauseOnHover',
          title: 'Pause on Hover',
          type: 'boolean',
          initialValue: true
        })
      ]
    })
  ]
})

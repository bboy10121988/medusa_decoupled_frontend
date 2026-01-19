import { defineType, defineField } from 'sanity'

/**
 * Product Schema - 商品內容管理
 * 這個 Schema 用於儲存商品的多語系行銷內容（標題、描述、詳情圖）。
 * 實際的價格、庫存等資料仍由 Medusa 管理。
 */
export default defineType({
    name: 'product',
    title: '商品內容',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: '商品名稱',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'subtitle',
            title: '商品副標題',
            type: 'string',
            description: '例如：髮根、淨化毛囊、撫平毛燥',
        }),
        defineField({
            name: 'slug',
            title: '網址代稱 (Slug)',
            type: 'slug',
            description: '與 Medusa handle 相同，由同步腳本自動設定。',
            readOnly: true,
            options: {
                source: 'title',
                maxLength: 96,
                // 允許不同語言使用相同 slug（不做唯一性檢查）
                isUnique: () => true,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'medusaId',
            title: 'Medusa 商品 ID',
            type: 'string',
            description: '對應 Medusa 中的商品 ID，由同步腳本自動設定',
            readOnly: true,
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: '簡短描述',
            type: 'text',
            rows: 3,
            description: '顯示在商品列表的簡短介紹',
        }),
        defineField({
            name: 'body',
            title: '詳細介紹',
            type: 'array',
            of: [
                { type: 'block' },
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: '替代文字',
                        },
                        {
                            name: 'caption',
                            type: 'string',
                            title: '圖片說明',
                        },
                    ],
                },
            ],
            description: '商品詳細介紹，支援圖文混排',
        }),
        defineField({
            name: 'images',
            title: '商品詳情圖集',
            type: 'array',
            of: [
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: '替代文字',
                        },
                    ],
                },
            ],
            description: '商品詳情頁的圖片集，不同語言可以使用不同圖片',
        }),
        // 多語系欄位 (由插件自動管理)
        defineField({
            name: 'language',
            type: 'string',
            readOnly: true,
            hidden: true,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'images.0',
            language: 'language',
        },
        prepare({ title, media, language }) {
            return {
                title: title || '未命名商品',
                subtitle: language ? `語言: ${language}` : '',
                media,
            }
        },
    },
})

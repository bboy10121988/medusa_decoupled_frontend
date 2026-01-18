import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
})

// 日文部落格分類
const japaneseCategories = [
    { title: 'サービス項目', slug: 'services' },
    { title: 'デザイントレンド', slug: 'design-trends' },
    { title: '理容技術', slug: 'barber-skills' },
    { title: '業界ニュース', slug: 'industry-news' },
    { title: '製品レビュー', slug: 'product-reviews' },
    { title: 'スタイリングガイド', slug: 'styling-guide' },
]

// 日文動態頁面內容
const japaneseDynamicPages = {
    'contact': {
        title: 'お問い合わせ',
        slug: 'contact',
        content: [
            { type: 'h2', text: 'お問い合わせ' },
            { type: 'normal', text: 'ご質問やご予約については、以下の方法でお気軽にお問い合わせください。' },
            { type: 'h3', text: '店舗情報' },
            { type: 'normal', text: '店名：Tim\'s Fantasy World メンズヘアサロン' },
            { type: 'normal', text: '営業時間：月曜日～日曜日 10:00-20:00' },
            { type: 'h3', text: 'お問い合わせ方法' },
            { type: 'normal', text: 'お電話、LINE、または直接ご来店ください。スタッフが丁寧に対応いたします。' },
        ]
    },
    'return': {
        title: '返品・交換規則',
        slug: 'return',
        content: [
            { type: 'h2', text: '返品・交換規則' },
            { type: 'normal', text: 'お客様に安心してご利用いただくため、以下の返品・交換規則を設けております。' },
            { type: 'h3', text: '返品条件' },
            { type: 'normal', text: '製品に不備がある場合、購入日から7日以内であれば返品を承ります。' },
            { type: 'normal', text: '未使用で、元の包装が保たれている必要があります。' },
            { type: 'h3', text: '交換手続き' },
            { type: 'normal', text: '交換をご希望の場合は、店舗にご連絡の上、製品をお持ちください。' },
            { type: 'normal', text: '在庫状況により、同等の製品と交換させていただきます。' },
            { type: 'h3', text: 'ご注意事項' },
            { type: 'normal', text: 'サービス（カット、パーマなど）については、返品・交換の対象外となります。' },
        ]
    },
    'faq': {
        title: 'よくある質問',
        slug: 'faq',
        content: [
            { type: 'h2', text: 'よくある質問' },
            { type: 'h3', text: '予約は必要ですか？' },
            { type: 'normal', text: '予約優先制となっております。お待たせすることなくスムーズにご案内できますので、事前のご予約をおすすめします。' },
            { type: 'h3', text: '所要時間はどのくらいですか？' },
            { type: 'normal', text: 'カットのみの場合は約40分、カラーやパーマを含む場合は1.5～2時間程度です。' },
            { type: 'h3', text: '支払い方法は？' },
            { type: 'normal', text: '現金、クレジットカード、電子マネーに対応しております。' },
            { type: 'h3', text: '駐車場はありますか？' },
            { type: 'normal', text: '近隣にコインパーキングがございます。詳しくは店舗までお問い合わせください。' },
        ]
    },
    'privacy-policy': {
        title: 'プライバシーポリシー',
        slug: 'privacy-policy',
        content: [
            { type: 'h2', text: 'プライバシーポリシー' },
            { type: 'normal', text: 'Tim\'s Fantasy Worldは、お客様の個人情報保護を重要視しております。' },
            { type: 'h3', text: '個人情報の収集' },
            { type: 'normal', text: 'ご予約やサービス提供のため、お名前、連絡先などの情報を収集させていただきます。' },
            { type: 'h3', text: '個人情報の利用目的' },
            { type: 'normal', text: '収集した個人情報は、以下の目的で利用いたします：' },
            { type: 'normal', text: '・サービスの提供およびご予約の管理' },
            { type: 'normal', text: '・お客様へのご連絡' },
            { type: 'normal', text: '・サービス向上のための分析' },
            { type: 'h3', text: '個人情報の管理' },
            { type: 'normal', text: 'お客様の個人情報は厳重に管理し、第三者への開示は行いません。' },
            { type: 'h3', text: 'お問い合わせ' },
            { type: 'normal', text: '個人情報に関するお問い合わせは、店舗までご連絡ください。' },
        ]
    }
}

async function createJapaneseContent() {
    console.log('🌐 日文內容建立中...\n')

    // 1. 建立日文部落格分類
    console.log('📁 建立日文部落格分類...')
    for (const category of japaneseCategories) {
        try {
            const doc = {
                _type: 'category',
                title: category.title,
                language: 'ja-JP',
            }

            const result = await client.create(doc)
            console.log(`  ✅ ${category.title} (ID: ${result._id})`)
        } catch (error) {
            console.error(`  ❌ ${category.title}:`, error)
        }
    }

    // 2. 建立日文動態頁面
    console.log('\n📄 建立日文動態頁面...')
    for (const [key, page] of Object.entries(japaneseDynamicPages)) {
        try {
            // 構建 Portable Text 格式的內容
            const pageContent = page.content.map((item, index) => ({
                _key: `block${index + 1}`,
                _type: 'block',
                style: item.type,
                children: [
                    {
                        _key: `span${index + 1}`,
                        _type: 'span',
                        text: item.text,
                        marks: []
                    }
                ],
                markDefs: []
            }))

            const doc = {
                _type: 'dynamicPage',
                title: page.title,
                slug: {
                    _type: 'slug',
                    current: page.slug
                },
                language: 'ja-JP',
                status: 'published',
                pageContent: pageContent,
                seo: {
                    metaTitle: page.title,
                    metaDescription: page.content[1]?.text || page.title
                }
            }

            const result = await client.create(doc)
            console.log(`  ✅ ${page.title} (/${page.slug}) (ID: ${result._id})`)
        } catch (error) {
            console.error(`  ❌ ${page.title}:`, error)
        }
    }

    console.log('\n✨ 日文內容建立完成！')
    console.log('\n📊 總結：')
    console.log(`  - 建立了 ${japaneseCategories.length} 個日文部落格分類`)
    console.log(`  - 建立了 ${Object.keys(japaneseDynamicPages).length} 個日文動態頁面`)
}

createJapaneseContent().catch(console.error)

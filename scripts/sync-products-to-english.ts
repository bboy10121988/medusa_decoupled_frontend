/**
 * 同步商品內容到英文版
 * 
 * 功能：
 * 1. 複製圖片到英文版商品
 * 2. 翻譯標題和描述
 * 
 * 執行方式：
 * npx tsx scripts/sync-products-to-english.ts
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN!,
    useCdn: false,
})

// 商品翻譯對照表
const productTranslations: Record<string, { title: string; description: string }> = {
    '高支撐度髮泥 紅帽': {
        title: 'High Hold Hair Clay - Red Cap',
        description: 'Cream-soft texture, easy to scoop and spread. Quick drying with strong hold, applies evenly without residue or white flakes. Matte finish with high support, quickly defines hairstyle lines.'
    },
    '強力定型髮油 黃罐': {
        title: 'Strong Hold Pomade - Yellow',
        description: 'Classic pomade with strong hold and natural shine. Perfect for slick back styles and classic looks. Water-based formula for easy washout.'
    },
    '水凝髮蠟 綠罐': {
        title: 'Water-Based Wax - Green',
        description: 'Lightweight water-based wax with medium hold. Creates natural texture and movement. Easy to restyle throughout the day.'
    },
    '迷幻香根草洗髮精': {
        title: 'Vetiver Shampoo',
        description: 'Premium shampoo with vetiver essential oil. Deep cleanses while nourishing scalp and hair. Exotic woody fragrance.'
    },
    'Styling Spray定型噴霧': {
        title: 'Styling Spray',
        description: 'Firm hold styling spray with flexible control. Provides all-day hold without stiffness. Quick-drying formula.'
    },
    '蓬蓬造型粉': {
        title: 'Volumizing Powder',
        description: 'Instant volume and texture powder. Creates natural lift and body at the roots. Matte finish with no residue.'
    },
    '髮根蓬蓬水': {
        title: 'Root Volumizer Spray',
        description: 'Lightweight root lifting spray. Adds instant volume and fullness. Heat-activated formula for lasting lift.'
    },
}

// 翻譯 block content 中的文字
function translateBlocks(blocks: any[]): any[] {
    if (!blocks || !Array.isArray(blocks)) return []

    const translations: Record<string, string> = {
        // 通用詞彙
        '商品詳情': 'Product Details',
        '使用方法': 'How to Use',
        '成分': 'Ingredients',
        '規格': 'Specifications',
        '注意事項': 'Notes',
        '適量': 'Apply appropriate amount',
        '塗抹於': 'Apply to',
        '頭髮': 'hair',
        '掌心': 'palms',
        '造型': 'styling',
        '定型': 'hold',
        '蓬鬆': 'volume',
        '光澤': 'shine',
        '霧面': 'matte',
        '質地': 'texture',
        '香味': 'fragrance',
    }

    return blocks.map(block => {
        if (block._type === 'block' && block.children) {
            return {
                ...block,
                _key: `en-${block._key || Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                children: block.children.map((child: any) => {
                    if (child._type === 'span' && child.text) {
                        let translatedText = child.text
                        // 簡單替換已知詞彙
                        for (const [zh, en] of Object.entries(translations)) {
                            translatedText = translatedText.replace(new RegExp(zh, 'g'), en)
                        }
                        return {
                            ...child,
                            _key: `en-${child._key || Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            text: translatedText
                        }
                    }
                    return child
                })
            }
        }
        return block
    })
}

async function syncProductsToEnglish() {
    console.log('🌐 開始同步商品到英文版...\n')

    // 獲取所有中文商品
    const zhProducts = await client.fetch(
        `*[_type == "product" && language == "zh-TW"]{
      _id, title, slug, medusaId, description, body, images
    }`
    )

    console.log(`📦 找到 ${zhProducts.length} 個中文商品\n`)

    let updated = 0
    let created = 0
    let failed = 0

    for (const zhProduct of zhProducts) {
        console.log(`\n📦 ${zhProduct.title}`)

        const slug = zhProduct.slug?.current
        if (!slug) {
            console.log(`   ⚠️ 無 slug，跳過`)
            failed++
            continue
        }

        // 查找對應的英文版商品
        let enProduct = await client.fetch(
            `*[_type == "product" && language == "en" && slug.current == $slug][0]`,
            { slug }
        )

        // 獲取翻譯
        const translation = productTranslations[zhProduct.title] || {
            title: zhProduct.title, // 如果沒有翻譯就用原標題
            description: zhProduct.description || ''
        }

        // 翻譯 body
        const translatedBody = translateBlocks(zhProduct.body || [])

        // 複製圖片引用（圖片資產共用，不需重新上傳）
        const images = zhProduct.images?.map((img: any, index: number) => ({
            ...img,
            _key: `en-img-${Date.now()}-${index}`
        })) || []

        if (enProduct) {
            // 更新現有英文商品
            await client.patch(enProduct._id).set({
                title: translation.title,
                description: translation.description,
                body: translatedBody,
                images: images,
            }).commit()
            console.log(`   ✅ 已更新英文版`)
            updated++
        } else {
            // 建立新英文商品
            const newEnProduct = {
                _type: 'product',
                title: translation.title,
                slug: {
                    _type: 'slug',
                    current: slug,
                },
                medusaId: zhProduct.medusaId,
                description: translation.description,
                body: translatedBody,
                images: images,
                language: 'en',
            }
            await client.create(newEnProduct)
            console.log(`   ✅ 已建立英文版`)
            created++
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 同步完成！')
    console.log(`   已更新: ${updated} 個商品`)
    console.log(`   已建立: ${created} 個商品`)
    console.log(`   失敗: ${failed} 個商品`)
    console.log('='.repeat(50))
}

syncProductsToEnglish().catch(console.error)

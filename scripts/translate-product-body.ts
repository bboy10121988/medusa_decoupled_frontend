/**
 * 翻譯商品詳細介紹到英文
 * 
 * 執行方式：
 * npx tsx scripts/translate-product-body.ts
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

// 商品詳細介紹翻譯（完整英文內容）
const productBodies: Record<string, string[]> = {
    '高支撐度髮泥 紅帽': [
        "Product Details:",
        "• Light texture with strong matte finish for lasting hold and high restylability",
        "• Suitable for short hair, coarse hair, and medium-length hair - easy finger comb application",
        "• Can be used on both dry and damp hair",
        "• Styling: Natural volume with light texture",
        "• Hold: Medium to high hold",
        "• Finish: Low-key matte",
        "• Fragrance: Geranium and musky wood notes",
        "• Size: 100ml",
        "",
        "How to Use:",
        "Apply appropriate amount to palms and spread evenly. Apply to hair and style in sections.",
        "Can also use with a comb and blow dryer to achieve your desired style."
    ],
    '強力定型髮油 黃罐': [
        "Product Details:",
        "• Classic pomade with strong hold and natural shine",
        "• Perfect for slick back, side part, and classic pompadour styles",
        "• Water-based formula for easy washout",
        "• Provides all-day hold with flexible control",
        "• Size: 100ml",
        "",
        "How to Use:",
        "Scoop a small amount with fingertips. Rub between palms to warm up product.",
        "Apply evenly through damp or dry hair. Style as desired with comb or fingers."
    ],
    '水凝髮蠟 綠罐': [
        "Product Details:",
        "• Lightweight water-based wax formula",
        "• Medium hold with natural movement",
        "• Easy to restyle throughout the day",
        "• No flaking or residue",
        "• Clean, fresh fragrance",
        "• Size: 100ml",
        "",
        "How to Use:",
        "Apply small amount to palms. Work through towel-dried or dry hair.",
        "Style as desired for natural texture and definition."
    ],
    '迷幻香根草洗髮精': [
        "Product Details:",
        "• Premium shampoo with vetiver essential oil",
        "• Deep cleanses scalp and hair",
        "• Nourishes and strengthens hair",
        "• Exotic woody fragrance with earthy notes",
        "• Suitable for all hair types",
        "• Size: 500ml",
        "",
        "How to Use:",
        "Apply to wet hair. Massage gently into scalp to create lather.",
        "Rinse thoroughly. Repeat if necessary. Follow with conditioner for best results."
    ],
    'Styling Spray定型噴霧': [
        "Product Details:",
        "• Firm hold styling spray",
        "• Flexible control without stiffness",
        "• Quick-drying formula",
        "• All-day hold",
        "• Humidity resistant",
        "• Easy to brush out",
        "• Size: 250ml",
        "",
        "How to Use:",
        "Hold 8-10 inches from hair. Spray evenly onto styled hair.",
        "Can be used for setting or to add texture during styling."
    ],
    '蓬蓬造型粉': [
        "Product Details:",
        "• Instant volume and texture powder",
        "• Creates natural lift at roots",
        "• Matte finish with no residue",
        "• Absorbs excess oil",
        "• Long-lasting volume",
        "• Travel-friendly size",
        "",
        "How to Use:",
        "Shake powder onto roots. Massage into scalp with fingertips.",
        "Style as desired for instant lift and texture."
    ],
    '髮根蓬蓬水': [
        "Product Details:",
        "• Lightweight root lifting spray",
        "• Instant volume and fullness",
        "• Heat-activated formula",
        "• Long-lasting lift",
        "• Non-sticky finish",
        "• Protects against heat damage",
        "• Size: 200ml",
        "",
        "How to Use:",
        "Spray onto damp roots. Blow dry while lifting hair with round brush.",
        "For extra volume, flip hair upside down while drying."
    ],
}

// 將文字陣列轉換為 Sanity block content
function textToBlocks(lines: string[]): any[] {
    return lines.map((text, index) => ({
        _type: 'block',
        _key: `block-en-${Date.now()}-${index}`,
        style: 'normal',
        markDefs: [],
        children: [
            {
                _type: 'span',
                _key: `span-en-${Date.now()}-${index}`,
                text: text,
                marks: [],
            },
        ],
    }))
}

async function translateProductBodies() {
    console.log('🌐 開始翻譯商品詳細介紹...\n')

    // 獲取所有英文商品
    const enProducts = await client.fetch(
        `*[_type == "product" && language == "en"]{_id, title, slug}`
    )

    console.log(`📦 找到 ${enProducts.length} 個英文商品\n`)

    // 獲取中文商品對照
    const zhProducts = await client.fetch(
        `*[_type == "product" && language == "zh-TW"]{title, slug}`
    )

    // 建立 slug -> 中文標題 對照
    const slugToZhTitle: Record<string, string> = {}
    for (const zh of zhProducts) {
        if (zh.slug?.current) {
            slugToZhTitle[zh.slug.current] = zh.title
        }
    }

    let updated = 0

    for (const enProduct of enProducts) {
        const slug = enProduct.slug?.current
        const zhTitle = slugToZhTitle[slug]

        console.log(`📦 ${enProduct.title}`)
        console.log(`   Slug: ${slug}, 中文標題: ${zhTitle || '無'}`)

        if (zhTitle && productBodies[zhTitle]) {
            const englishBody = textToBlocks(productBodies[zhTitle])

            await client.patch(enProduct._id).set({
                body: englishBody
            }).commit()

            console.log(`   ✅ 已更新詳細介紹 (${englishBody.length} 段落)`)
            updated++
        } else {
            console.log(`   ⏭️ 無對應翻譯，跳過`)
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 翻譯完成！')
    console.log(`   已更新: ${updated} 個商品`)
    console.log('='.repeat(50))
}

translateProductBodies().catch(console.error)

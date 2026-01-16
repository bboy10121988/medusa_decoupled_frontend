/**
 * 複製商品詳細內容到英文版
 * 
 * 用途：將中文版商品的 body 和 images 複製到英文版
 * 
 * 執行方式：
 * npx tsx scripts/copy-product-content.ts
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

async function copyProductContent() {
    console.log('📦 開始複製商品詳細內容到英文版...\n')

    // 獲取所有中文商品
    const zhProducts = await client.fetch(
        `*[_type == "product" && language == "zh-TW"]`
    )

    console.log(`✅ 找到 ${zhProducts.length} 個中文版商品\n`)

    let updated = 0
    let skipped = 0

    for (const zhProduct of zhProducts) {
        const slug = zhProduct.slug?.current
        if (!slug) {
            console.log(`   ⏭️ 跳過 (無 slug): ${zhProduct.title}`)
            skipped++
            continue
        }

        // 查找對應的英文版商品
        const enProduct = await client.fetch(
            `*[_type == "product" && language == "en" && slug.current == $slug][0]`,
            { slug }
        )

        if (!enProduct) {
            console.log(`   ⚠️ 找不到英文版: ${zhProduct.title} (${slug})`)
            skipped++
            continue
        }

        // 複製 body 和 images
        try {
            await client
                .patch(enProduct._id)
                .set({
                    body: zhProduct.body,
                    images: zhProduct.images,
                })
                .commit()

            console.log(`   ✅ 已複製: ${zhProduct.title}`)
            updated++
        } catch (error: any) {
            console.log(`   ❌ 複製失敗: ${zhProduct.title} - ${error.message}`)
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`🎉 完成！`)
    console.log(`   已更新: ${updated} 個商品`)
    console.log(`   已跳過: ${skipped} 個商品`)
    console.log('='.repeat(50))
    console.log('\n📝 提醒：')
    console.log('   1. 詳細介紹和圖集已複製到英文版')
    console.log('   2. 您可以在 Sanity Studio 中進一步編輯英文內容')
}

copyProductContent().catch(console.error)

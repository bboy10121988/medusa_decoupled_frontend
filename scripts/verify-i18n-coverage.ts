/**
 * 驗證多語系覆蓋率
 * 
 * 檢查所有中文文檔是否有對應的英文文檔
 * 
 * 執行方式：
 * npx tsx scripts/verify-i18n-coverage.ts
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

async function verifyCoverage() {
    console.log('🔍 開始檢查多語系覆蓋率...\n')

    const missing: string[] = []

    // 1. 檢查商品
    const zhProducts = await client.fetch('*[_type == "product" && language == "zh-TW"]')
    const enProducts = await client.fetch('*[_type == "product" && language == "en"]')

    console.log(`📦 商品: 中文 ${zhProducts.length}, 英文 ${enProducts.length}`)

    const enProductSlugs = new Set(enProducts.map((p: any) => p.slug?.current))
    for (const p of zhProducts) {
        if (!enProductSlugs.has(p.slug?.current)) {
            missing.push(`[商品] 缺少英文版: ${p.title} (slug: ${p.slug?.current})`)
        }
    }

    // 2. 檢查頁面
    const checkSingleType = async (type: string, name: string) => {
        const zh = await client.fetch(`*[_type == "${type}" && language == "zh-TW"][0]`)
        const en = await client.fetch(`*[_type == "${type}" && language == "en"][0]`)
        if (zh && !en) {
            missing.push(`[${name}] 缺少英文版`)
        } else if (zh && en) {
            console.log(`✅ ${name}: 已同步`)
        } else {
            console.log(`⚠️ ${name}: 無中文版，跳過`)
        }
    }

    await checkSingleType('homePage', '首頁')
    await checkSingleType('header', '頁首')
    await checkSingleType('footer', '頁腳')
    await checkSingleType('blogPage', '部落格頁面設定')

    // 3. 檢查動態頁面
    const zhDynamic = await client.fetch('*[_type == "dynamicPage" && language == "zh-TW"]')
    const enDynamic = await client.fetch('*[_type == "dynamicPage" && language == "en"]')

    console.log(`📄 動態頁面: 中文 ${zhDynamic.length}, 英文 ${enDynamic.length}`)

    const enDynamicSlugs = new Set(enDynamic.map((p: any) => p.slug?.current))
    for (const p of zhDynamic) {
        if (!enDynamicSlugs.has(p.slug?.current)) {
            missing.push(`[動態頁面] 缺少英文版: ${p.title} (slug: ${p.slug?.current})`)
        }
    }

    // 4. 檢查部落格文章
    const zhPosts = await client.fetch('*[_type == "post" && language == "zh-TW"]')
    const enPosts = await client.fetch('*[_type == "post" && language == "en"]')

    console.log(`📝 部落格文章: 中文 ${zhPosts.length}, 英文 ${enPosts.length}`)

    // 這裡不一定每篇中文文章都有英文版，我們只列出差異
    if (zhPosts.length !== enPosts.length) {
        console.log(`ℹ️ 文章數量不一致 (此為提醒，非錯誤)`)
    }

    console.log('\n' + '='.repeat(50))
    if (missing.length > 0) {
        console.log('❌ 發現遺漏：')
        missing.forEach(m => console.log(`   - ${m}`))
    } else {
        console.log('🎉 恭喜！核心內容皆已翻譯。')
    }
    console.log('='.repeat(50))
}

verifyCoverage().catch(console.error)

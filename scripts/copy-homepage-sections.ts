/**
 * 複製首頁區塊腳本
 * 
 * 用途：將中文版首頁的 mainSections 複製到英文版
 * 
 * 執行方式：
 * npx tsx scripts/copy-homepage-sections.ts
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// 載入環境變數
dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN!,
    useCdn: false,
})

async function copyHomePageSections() {
    console.log('🏠 開始複製首頁區塊到英文版...\n')

    // 1. 獲取中文版首頁
    const zhHomePage = await client.fetch(
        `*[_type == "homePage" && language == "zh-TW"][0]`
    )

    if (!zhHomePage) {
        console.error('❌ 找不到中文版首頁')
        return
    }

    console.log(`✅ 找到中文版首頁: ${zhHomePage.title}`)
    console.log(`   區塊數量: ${zhHomePage.mainSections?.length || 0}`)

    // 2. 獲取英文版首頁
    const enHomePage = await client.fetch(
        `*[_type == "homePage" && language == "en"][0]`
    )

    if (!enHomePage) {
        console.error('❌ 找不到英文版首頁')
        return
    }

    console.log(`✅ 找到英文版首頁: ${enHomePage.title}`)
    console.log(`   目前區塊數量: ${enHomePage.mainSections?.length || 0}`)

    // 3. 複製區塊到英文版
    if (!zhHomePage.mainSections || zhHomePage.mainSections.length === 0) {
        console.log('⚠️ 中文版首頁沒有任何區塊')
        return
    }

    try {
        // 複製 mainSections 和所有 SEO/社群設定
        await client
            .patch(enHomePage._id)
            .set({
                // 頁面區塊
                mainSections: zhHomePage.mainSections,

                // 基本 SEO 設定
                seoTitle: zhHomePage.seoTitle,
                seoDescription: zhHomePage.seoDescription,
                seoKeywords: zhHomePage.seoKeywords,
                canonicalUrl: zhHomePage.canonicalUrl,
                noIndex: zhHomePage.noIndex,
                noFollow: zhHomePage.noFollow,

                // 社群媒體分享設定
                ogTitle: zhHomePage.ogTitle,
                ogDescription: zhHomePage.ogDescription,
                ogImage: zhHomePage.ogImage,
                twitterCard: zhHomePage.twitterCard,
            })
            .commit()

        console.log('\n✅ 成功複製區塊和 SEO 設定！')
        console.log(`   已複製 ${zhHomePage.mainSections.length} 個區塊到英文版首頁`)
        console.log('   已複製基本 SEO 設定')
        console.log('   已複製社群媒體分享設定')
        console.log('\n📝 提醒：')
        console.log('   1. 區塊結構已複製，但文字仍是中文')
        console.log('   2. 請在 Sanity Studio 中手動翻譯文字內容')
        console.log('   3. 圖片已共用，如需英文版專屬圖片請手動更換')

    } catch (error) {
        console.error('❌ 複製失敗:', error)
    }
}

// 執行
copyHomePageSections().catch(console.error)

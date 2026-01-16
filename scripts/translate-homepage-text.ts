/**
 * 翻譯首頁文字腳本
 * 
 * 用途：將英文版首頁的中文文字翻譯成英文
 * 
 * 執行方式：
 * npx tsx scripts/translate-homepage-text.ts
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

// 翻譯對照表
const translations: Record<string, string> = {
    // 通用
    '立即選購': 'Shop Now',
    '了解更多': 'Learn More',
    '查看全部': 'View All',
    '查看更多': 'View More',
    '立即購買': 'Buy Now',
    '加入購物車': 'Add to Cart',
    '探索更多': 'Explore More',

    // Banner / Hero 區域
    '專業男士造型': 'Professional Men\'s Styling',
    '男士專業美髮造型': 'Professional Men\'s Hairstyling',
    '打造屬於你的風格': 'Create Your Own Style',
    '專屬造型師為您服務': 'Expert Stylists at Your Service',
    '預約服務': 'Book Now',
    '頂級髮品': 'Premium Hair Products',
    '髮蠟': 'Hair Wax',
    '髮泥': 'Hair Clay',
    '髮油': 'Pomade',
    '定型噴霧': 'Styling Spray',

    // 產品區塊
    '精選商品': 'Featured Products',
    '熱銷商品': 'Best Sellers',
    '新品上市': 'New Arrivals',
    '人氣商品': 'Popular Products',
    '推薦商品': 'Recommended',
    '所有商品': 'All Products',
    '商品': 'Products',
    '髮品造型': 'Hair Styling Products',

    // 產品名稱
    '高支撐度髮泥 紅帽': 'High Hold Clay - Red Cap',
    '強力定型髮油 黃罐': 'Strong Hold Pomade - Yellow',
    '水凝髮蠟 綠罐': 'Water-Based Wax - Green',
    '迷幻香根草洗髮精': 'Vetiver Shampoo',
    'Styling Spray定型噴霧': 'Styling Spray',
    '蓬蓬造型粉': 'Volumizing Powder',
    '髮根蓬蓬水': 'Root Volumizer',

    // 服務區塊
    '我們的服務': 'Our Services',
    '服務項目': 'Services',
    '專業剪髮': 'Professional Haircut',
    '男士剪髮': "Men's Haircut",
    '頭皮護理': 'Scalp Care',
    '男士燙髮': "Men's Perm",
    '男士染髮': "Men's Hair Coloring",
    '洗剪修眉': 'Wash, Cut & Brow Trim',

    // 部落格區塊
    '最新文章': 'Latest Articles',
    '部落格': 'Blog',
    '閱讀更多': 'Read More',

    // 關於我們
    '關於我們': 'About Us',
    '聯絡我們': 'Contact Us',
    '品牌故事': 'Our Story',

    // 頁腳相關
    '客戶服務': 'Customer Service',
    '常見問題': 'FAQ',
    '隱私權政策': 'Privacy Policy',
    '退換貨規則': 'Return Policy',

    // YouTube / 影片區塊
    '觀看影片': 'Watch Video',
    '影片介紹': 'Video Introduction',

    // 一般描述文字
    '專為亞洲男士設計': 'Designed for Asian Men',
    '提供最專業的服務': 'Professional Service Guaranteed',
    '堅持品質': 'Quality Assured',
    '用心服務': 'Dedicated Service',

    // SEO 相關
    '男士美髮': "Men's Hairstyling",
    '造型產品': 'Styling Products',
    '專業美髮沙龍': 'Professional Hair Salon',
}

// 遞迴翻譯函式
function translateValue(value: any): any {
    if (typeof value === 'string') {
        // 先嘗試完全匹配
        if (translations[value]) {
            return translations[value]
        }
        // 然後嘗試部分替換
        let translated = value
        for (const [zh, en] of Object.entries(translations)) {
            translated = translated.replace(new RegExp(zh, 'g'), en)
        }
        return translated
    }

    if (Array.isArray(value)) {
        return value.map(item => translateValue(item))
    }

    if (typeof value === 'object' && value !== null) {
        const translated: any = {}
        for (const [key, val] of Object.entries(value)) {
            // 跳過 Sanity 內部欄位和圖片參照
            if (key.startsWith('_') || key === 'asset') {
                translated[key] = val
            } else {
                translated[key] = translateValue(val)
            }
        }
        return translated
    }

    return value
}

async function translateHomePage() {
    console.log('🌐 開始翻譯英文版首頁...\n')

    // 獲取英文版首頁
    const enHomePage = await client.fetch(
        `*[_type == "homePage" && language == "en"][0]`
    )

    if (!enHomePage) {
        console.error('❌ 找不到英文版首頁')
        return
    }

    console.log(`✅ 找到英文版首頁: ${enHomePage.title}`)
    console.log(`   區塊數量: ${enHomePage.mainSections?.length || 0}`)

    try {
        // 翻譯 mainSections
        const translatedSections = translateValue(enHomePage.mainSections)

        // 翻譯 SEO 欄位
        const translatedSeoTitle = translateValue(enHomePage.seoTitle)
        const translatedSeoDescription = translateValue(enHomePage.seoDescription)
        const translatedOgTitle = translateValue(enHomePage.ogTitle)
        const translatedOgDescription = translateValue(enHomePage.ogDescription)

        // 更新文檔
        await client
            .patch(enHomePage._id)
            .set({
                title: 'Home',
                mainSections: translatedSections,
                seoTitle: translatedSeoTitle,
                seoDescription: translatedSeoDescription,
                ogTitle: translatedOgTitle,
                ogDescription: translatedOgDescription,
            })
            .commit()

        console.log('\n✅ 翻譯完成！')
        console.log('   已翻譯首頁區塊文字')
        console.log('   已翻譯 SEO 設定')
        console.log('\n📝 提醒：')
        console.log('   1. 自動翻譯僅供參考，建議檢查內容')
        console.log('   2. 您可以在 Sanity Studio 中進一步調整')

    } catch (error) {
        console.error('❌ 翻譯失敗:', error)
    }
}

// 執行
translateHomePage().catch(console.error)

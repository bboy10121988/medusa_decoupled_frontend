/**
 * 自動翻譯腳本 - 將中文內容翻譯成英文
 * 
 * 用途：讀取所有 zh-TW 文檔，建立對應的英文版本
 * 
 * 執行方式：
 * npx tsx scripts/translate-to-english.ts
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

// 翻譯對照表 - 常見詞彙
const translationMap: Record<string, string> = {
    // 頁面標題
    '首頁': 'Home',
    '部落格': 'Blog',
    '部落格文章': 'Blog Posts',
    '關於我們': 'About Us',
    '聯絡我們': 'Contact Us',
    '常見問題': 'FAQ',
    '隱私權政策': 'Privacy Policy',
    '退換貨規則': 'Return Policy',
    '服務項目': 'Services',

    // 導航
    '商品': 'Products',
    '首頁': 'Home',
    '幫助': 'Help',
    '登入': 'Login',
    '購物車': 'Cart',
    '帳戶': 'Account',

    // 產品相關
    '高支撐度髮泥 紅帽': 'High Hold Clay - Red Cap',
    '強力定型髮油 黃罐': 'Strong Hold Pomade - Yellow',
    '水凝髮蠟 綠罐': 'Water-Based Wax - Green',
    '迷幻香根草洗髮精': 'Vetiver Shampoo',
    'Styling Spray定型噴霧': 'Styling Spray',
    '蓬蓬造型粉': 'Volumizing Powder',
    '髮根蓬蓬水': 'Root Volumizer',

    // 文章標題
    '男士剪髮': "Men's Haircut",
    '頭皮護理': 'Scalp Care',
    '男士燙髮': "Men's Perm",
    '洗剪修眉': 'Wash, Cut & Brow Trim',
    '男士洗剪髮含頭皮噴霧': "Men's Cut with Scalp Treatment",
    '男士染髮': "Men's Hair Coloring",

    // 分類
    '設計趨勢': 'Design Trends',
    '理髮技巧': 'Barber Skills',
    '行業資訊': 'Industry News',
    '產品評測': 'Product Reviews',
    '造型指南': 'Styling Guide',

    // 按鈕/動作
    '立即選購': 'Shop Now',
    '了解更多': 'Learn More',
    '查看全部': 'View All',
    '加入購物車': 'Add to Cart',
    '立即購買': 'Buy Now',
    '前往結帳': 'Checkout',

    // 頁腳
    '網站頁腳設定': 'Footer Settings',
    '客戶服務': 'Customer Service',
    '關注我們': 'Follow Us',
    '訂閱電子報': 'Newsletter',
    '版權所有': 'All Rights Reserved',
}

// 簡單翻譯函式
function translateText(text: string | null | undefined): string {
    if (!text) return ''

    let translated = text

    // 先嘗試完全匹配
    if (translationMap[text]) {
        return translationMap[text]
    }

    // 然後嘗試部分匹配替換
    for (const [chinese, english] of Object.entries(translationMap)) {
        translated = translated.replace(new RegExp(chinese, 'g'), english)
    }

    return translated
}

// 翻譯區塊內容
function translateBlocks(blocks: any[] | null | undefined): any[] {
    if (!blocks || !Array.isArray(blocks)) return []

    return blocks.map(block => {
        if (block._type === 'block' && block.children) {
            return {
                ...block,
                children: block.children.map((child: any) => ({
                    ...child,
                    text: child.text ? translateText(child.text) : child.text
                }))
            }
        }
        return block
    })
}

// 需要翻譯的文檔類型
const schemaTypesToTranslate = [
    'homePage',
    'header',
    'footer',
    'dynamicPage',
    'blogPage',
    'post',
    'category',
    'product',
]

async function checkEnglishExists(originalId: string, schemaType: string): Promise<boolean> {
    // 檢查是否已有英文版本
    const query = `*[_type == $type && language == "en" && (
    _id == $englishId || 
    references($originalId)
  )][0]`

    const englishId = originalId.replace('drafts.', '') + '__i18n_en'
    const existing = await client.fetch(query, {
        type: schemaType,
        englishId,
        originalId: originalId.replace('drafts.', '')
    })

    return !!existing
}

async function translateDocuments() {
    console.log('🌐 開始自動翻譯到英文...\n')

    let totalCreated = 0
    let totalSkipped = 0
    let totalFailed = 0

    for (const schemaType of schemaTypesToTranslate) {
        console.log(`\n📂 處理類型: ${schemaType}`)

        // 查詢所有中文文檔
        const query = `*[_type == $type && language == "zh-TW" && !(_id match "drafts.*")]`
        const docs = await client.fetch(query, { type: schemaType })

        if (docs.length === 0) {
            console.log(`   沒有找到中文文檔`)
            continue
        }

        console.log(`   找到 ${docs.length} 個中文文檔`)

        for (const doc of docs) {
            try {
                // 檢查英文版是否已存在
                const englishExists = await checkEnglishExists(doc._id, schemaType)
                if (englishExists) {
                    console.log(`   ⏭️ 跳過 (英文版已存在): ${doc.title || doc.name || doc._id}`)
                    totalSkipped++
                    continue
                }

                // 建立英文版本
                const englishDoc: any = {
                    _type: schemaType,
                    language: 'en',
                }

                // 翻譯常見欄位
                if (doc.title) {
                    englishDoc.title = translateText(doc.title)
                }
                if (doc.name) {
                    englishDoc.name = translateText(doc.name)
                }
                if (doc.description) {
                    englishDoc.description = translateText(doc.description)
                }
                if (doc.excerpt) {
                    englishDoc.excerpt = translateText(doc.excerpt)
                }
                if (doc.body) {
                    englishDoc.body = translateBlocks(doc.body)
                }

                // 複製其他欄位 (圖片、slug 等)
                if (doc.slug) {
                    englishDoc.slug = doc.slug
                }
                if (doc.mainImage) {
                    englishDoc.mainImage = doc.mainImage
                }
                if (doc.images) {
                    englishDoc.images = doc.images
                }
                if (doc.medusaId) {
                    englishDoc.medusaId = doc.medusaId
                }
                if (doc.navigation) {
                    englishDoc.navigation = doc.navigation.map((nav: any) => ({
                        ...nav,
                        name: translateText(nav.name)
                    }))
                }
                if (doc.sections) {
                    englishDoc.sections = doc.sections.map((section: any) => ({
                        ...section,
                        title: translateText(section.title),
                        links: section.links?.map((link: any) => ({
                            ...link,
                            label: translateText(link.label)
                        }))
                    }))
                }

                // 建立文檔
                await client.create(englishDoc)
                console.log(`   ✅ 已建立英文版: ${englishDoc.title || englishDoc.name || doc._id}`)
                totalCreated++

            } catch (error: any) {
                console.error(`   ❌ 翻譯失敗: ${doc.title || doc._id}`, error.message)
                totalFailed++
            }
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 翻譯完成！')
    console.log(`   已建立: ${totalCreated} 個英文文檔`)
    console.log(`   已跳過: ${totalSkipped} 個 (已存在)`)
    console.log(`   失敗: ${totalFailed} 個`)
    console.log('='.repeat(50))

    if (totalCreated > 0) {
        console.log('\n📝 提醒：')
        console.log('   1. 自動翻譯僅供參考，請在 Sanity Studio 中校對內容')
        console.log('   2. 圖片已複製，如需英文版專屬圖片請手動更換')
    }
}

// 執行翻譯
translateDocuments().catch(console.error)

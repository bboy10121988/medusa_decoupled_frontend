/**
 * 翻譯所有英文版內容
 * 
 * 包含：Header, Footer, 動態頁面, 商品
 * 
 * 執行方式：
 * npx tsx scripts/translate-all-content.ts
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

// 翻譯對照表
const translations: Record<string, string> = {
    // 導航
    '首頁': 'Home',
    '商店': 'Store',
    '商品': 'Products',
    '髮品造型': 'Hair Products',
    '部落格': 'Blog',
    '關於我們': 'About Us',
    '聯絡我們': 'Contact Us',
    '服務': 'Services',
    '帳戶': 'Account',
    '購物車': 'Cart',
    '登入': 'Login',
    '註冊': 'Sign Up',
    '登出': 'Logout',

    // 頁腳
    '客戶服務': 'Customer Service',
    '常見問題': 'FAQ',
    '隱私權政策': 'Privacy Policy',
    '退換貨規則': 'Return Policy',
    '條款與細則': 'Terms & Conditions',
    '關注我們': 'Follow Us',
    '訂閱電子報': 'Newsletter',
    '版權所有': 'All Rights Reserved',
    '網站頁腳設定': 'Footer Settings',
    '快速連結': 'Quick Links',
    '政策說明': 'Policies',

    // 跑馬燈
    '滿千免運': 'Free Shipping Over $1000',
    '新會員享優惠': 'New Member Discount',
    'LINE好友募集中': 'Join Our LINE',

    // 動態頁面標題
    '退換貨規則': 'Return Policy',
    '常見問題': 'FAQ',
    '聯絡我們': 'Contact Us',
    '隱私權政策': 'Privacy Policy',

    // 商品名稱
    '高支撐度髮泥 紅帽': 'High Hold Clay - Red Cap',
    '強力定型髮油 黃罐': 'Strong Hold Pomade - Yellow',
    '水凝髮蠟 綠罐': 'Water-Based Wax - Green',
    '迷幻香根草洗髮精': 'Vetiver Shampoo',
    'Styling Spray定型噴霧': 'Styling Spray',
    '蓬蓬造型粉': 'Volumizing Powder',
    '髮根蓬蓬水': 'Root Volumizer',

    // 商品描述
    '專業髮品': 'Professional Hair Products',
    '造型產品': 'Styling Products',
    '男士專用': "For Men",
    '持久定型': 'Long-lasting Hold',
    '自然光澤': 'Natural Shine',
    '易於清洗': 'Easy to Wash',
    '不黏膩': 'Non-greasy',
    '強力定型': 'Strong Hold',
    '中等定型': 'Medium Hold',
    '輕度定型': 'Light Hold',
    '霧面效果': 'Matte Finish',
    '亮面效果': 'Shiny Finish',

    // 通用按鈕
    '立即選購': 'Shop Now',
    '了解更多': 'Learn More',
    '查看更多': 'View More',
    '閱讀更多': 'Read More',
    '加入購物車': 'Add to Cart',
    '立即購買': 'Buy Now',
    '返回': 'Back',
    '提交': 'Submit',
    '取消': 'Cancel',
    '確認': 'Confirm',

    // 表單
    '姓名': 'Name',
    '電話': 'Phone',
    '電子郵件': 'Email',
    '訊息': 'Message',
    '地址': 'Address',

    // 一般文字
    '歡迎': 'Welcome',
    '感謝您': 'Thank You',
    '請': 'Please',
    '我們': 'We',
    '您': 'You',
}

// 遞迴翻譯
function translateValue(value: any): any {
    if (typeof value === 'string') {
        if (translations[value]) {
            return translations[value]
        }
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

async function translateAllContent() {
    console.log('🌐 開始翻譯所有英文版內容...\n')

    let totalUpdated = 0

    // 1. 翻譯 Header
    console.log('📌 處理 Header...')
    const enHeader = await client.fetch(`*[_type == "header" && language == "en"][0]`)
    if (enHeader) {
        const zhHeader = await client.fetch(`*[_type == "header" && language == "zh-TW"][0]`)
        if (zhHeader) {
            await client.patch(enHeader._id).set({
                storeName: 'Tim\'s Fantasy World',
                navigation: translateValue(zhHeader.navigation),
                marquee: translateValue(zhHeader.marquee),
                logo: zhHeader.logo,
                favicon: zhHeader.favicon,
                logoSize: zhHeader.logoSize,
            }).commit()
            console.log('   ✅ Header 已翻譯')
            totalUpdated++
        }
    }

    // 2. 翻譯 Footer
    console.log('📌 處理 Footer...')
    const enFooter = await client.fetch(`*[_type == "footer" && language == "en"][0]`)
    if (enFooter) {
        const zhFooter = await client.fetch(`*[_type == "footer" && language == "zh-TW"][0]`)
        if (zhFooter) {
            await client.patch(enFooter._id).set({
                title: 'Footer Settings',
                sections: translateValue(zhFooter.sections),
                socialMedia: zhFooter.socialMedia,
                logo: zhFooter.logo,
                logoWidth: zhFooter.logoWidth,
                copyright: '© 2025 Tim\'s Fantasy World. All Rights Reserved.',
            }).commit()
            console.log('   ✅ Footer 已翻譯')
            totalUpdated++
        }
    }

    // 3. 翻譯動態頁面
    console.log('📌 處理動態頁面...')
    const enDynamicPages = await client.fetch(`*[_type == "dynamicPage" && language == "en"]`)
    for (const page of enDynamicPages) {
        const zhPage = await client.fetch(
            `*[_type == "dynamicPage" && language == "zh-TW" && slug.current == $slug][0]`,
            { slug: page.slug?.current }
        )
        if (zhPage) {
            await client.patch(page._id).set({
                title: translateValue(zhPage.title),
                description: translateValue(zhPage.description),
                pageContent: translateValue(zhPage.pageContent),
                seoTitle: translateValue(zhPage.seoTitle),
                seoDescription: translateValue(zhPage.seoDescription),
            }).commit()
            console.log(`   ✅ 動態頁面 "${translateValue(zhPage.title)}" 已翻譯`)
            totalUpdated++
        }
    }

    // 4. 翻譯商品
    console.log('📌 處理商品...')
    const enProducts = await client.fetch(`*[_type == "product" && language == "en"]`)
    for (const product of enProducts) {
        await client.patch(product._id).set({
            title: translateValue(product.title),
            description: translateValue(product.description),
            body: translateValue(product.body),
        }).commit()
        console.log(`   ✅ 商品 "${translateValue(product.title)}" 已翻譯`)
        totalUpdated++
    }

    // 5. 翻譯文章分類
    console.log('📌 處理文章分類...')
    const enCategories = await client.fetch(`*[_type == "category" && language == "en"]`)
    for (const category of enCategories) {
        await client.patch(category._id).set({
            title: translateValue(category.title),
            description: translateValue(category.description),
        }).commit()
        console.log(`   ✅ 分類 "${translateValue(category.title)}" 已翻譯`)
        totalUpdated++
    }

    // 6. 翻譯文章
    console.log('📌 處理文章...')
    const enPosts = await client.fetch(`*[_type == "post" && language == "en"]`)
    for (const post of enPosts) {
        await client.patch(post._id).set({
            title: translateValue(post.title),
            excerpt: translateValue(post.excerpt),
            body: translateValue(post.body),
            seoTitle: translateValue(post.seoTitle),
            seoDescription: translateValue(post.seoDescription),
        }).commit()
        console.log(`   ✅ 文章 "${translateValue(post.title)}" 已翻譯`)
        totalUpdated++
    }

    console.log('\n' + '='.repeat(50))
    console.log(`🎉 翻譯完成！共更新 ${totalUpdated} 個文檔`)
    console.log('='.repeat(50))
    console.log('\n📝 提醒：')
    console.log('   1. 自動翻譯僅供參考，建議在 Sanity Studio 中檢查')
    console.log('   2. 部分專業術語可能需要手動調整')
}

translateAllContent().catch(console.error)

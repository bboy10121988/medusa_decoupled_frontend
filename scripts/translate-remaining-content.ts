/**
 * 完整翻譯剩餘內容
 * 
 * 包含：首頁、動態頁面、部落格、網站頁首、頁腳
 * 
 * 執行方式：
 * npx tsx scripts/translate-remaining-content.ts
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

// ========== 翻譯對照表 ==========

// Header 翻譯
const headerTranslations = {
    storeName: "Tim's Fantasy World",
    marquee: {
        text: "★ Free Shipping on Orders Over NT$1000 ★ New Member Discounts ★ Join Our LINE for Exclusive Offers ★",
    },
    navigation: [
        { label: 'Home', href: '/' },
        { label: 'Store', href: '/store' },
        { label: 'Blog', href: '/blog' },
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ]
}

// Footer 翻譯
const footerTranslations = {
    title: 'Footer Settings',
    copyright: "© 2025 Tim's Fantasy World. All Rights Reserved.",
    sections: {
        quickLinks: {
            title: 'Quick Links',
            links: ['Home', 'Store', 'Blog', 'About Us']
        },
        customerService: {
            title: 'Customer Service',
            links: ['FAQ', 'Contact Us', 'Shipping Policy', 'Return Policy']
        },
        policies: {
            title: 'Policies',
            links: ['Privacy Policy', 'Terms & Conditions']
        }
    }
}

// 動態頁面翻譯
const dynamicPageTranslations: Record<string, { title: string; content: string[] }> = {
    'faq': {
        title: 'Frequently Asked Questions',
        content: [
            'Q: How long does shipping take?',
            'A: Domestic orders typically arrive within 1-3 business days. International shipping takes 7-14 business days.',
            '',
            'Q: What is your return policy?',
            'A: We accept returns within 7 days of delivery for unopened products in original condition.',
            '',
            'Q: How do I track my order?',
            'A: Once your order ships, you will receive an email with tracking information.',
            '',
            'Q: Do you offer international shipping?',
            'A: Yes, we ship to select countries. Shipping costs vary by destination.',
        ]
    },
    'privacy-policy': {
        title: 'Privacy Policy',
        content: [
            'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.',
            '',
            'Information We Collect:',
            '• Personal information (name, email, address) when you place an order',
            '• Payment information processed securely through our payment provider',
            '• Browsing data to improve our website experience',
            '',
            'How We Use Your Information:',
            '• To process and fulfill your orders',
            '• To communicate with you about your order',
            '• To improve our products and services',
            '',
            'We never sell your personal information to third parties.'
        ]
    },
    'return-policy': {
        title: 'Return & Exchange Policy',
        content: [
            'We want you to be completely satisfied with your purchase.',
            '',
            'Return Conditions:',
            '• Items must be returned within 7 days of delivery',
            '• Products must be unopened and in original packaging',
            '• Proof of purchase is required',
            '',
            'How to Return:',
            '1. Contact our customer service team',
            '2. Receive a return authorization number',
            '3. Ship the item back with the authorization number',
            '4. Refund will be processed within 5-7 business days',
            '',
            'Note: Shipping costs for returns are the responsibility of the customer unless the item was defective.'
        ]
    },
    'contact': {
        title: 'Contact Us',
        content: [
            "We'd love to hear from you!",
            '',
            'Customer Service Hours:',
            'Monday - Friday: 9:00 AM - 6:00 PM (Taiwan Time)',
            '',
            'Email: service@timsfantasyworld.com',
            'LINE: @timsfantasyworld',
            '',
            'For business inquiries:',
            'business@timsfantasyworld.com',
        ]
    }
}

// 部落格頁面翻譯
const blogPageTranslation = {
    title: 'Blog',
    description: 'Discover styling tips, product guides, and the latest trends in men\'s grooming.',
    seoTitle: 'Blog | Tim\'s Fantasy World',
    seoDescription: 'Expert styling tips, product reviews, and grooming guides for the modern man.',
}

// 首頁 SEO 翻譯
const homePageTranslation = {
    title: 'Home',
    seoTitle: "Tim's Fantasy World | Premium Men's Hair Styling Products",
    seoDescription: "Professional hair styling products designed for Asian men. High-hold clays, pomades, and styling sprays.",
    ogTitle: "Tim's Fantasy World",
    ogDescription: "Premium men's grooming products with professional quality.",
}

// ========== 翻譯函數 ==========

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

// 遞迴翻譯函式（用於複雜物件）
const textTranslations: Record<string, string> = {
    // Navigation
    '首頁': 'Home',
    '商店': 'Store',
    '商品': 'Products',
    '髮品造型': 'Hair Products',
    '部落格': 'Blog',
    '關於我們': 'About Us',
    '聯絡我們': 'Contact Us',
    '服務': 'Services',

    // Footer
    '客戶服務': 'Customer Service',
    '常見問題': 'FAQ',
    '隱私權政策': 'Privacy Policy',
    '退換貨規則': 'Return Policy',
    '條款與細則': 'Terms & Conditions',
    '快速連結': 'Quick Links',
    '政策說明': 'Policies',
    '關注我們': 'Follow Us',
    '版權所有': 'All Rights Reserved',

    // Marquee
    '滿千免運': 'Free Shipping on Orders Over NT$1000',
    '新會員享優惠': 'New Member Discounts',
    'LINE好友募集中': 'Join Our LINE for Exclusive Offers',

    // General
    '了解更多': 'Learn More',
    '立即選購': 'Shop Now',
    '查看更多': 'View More',
    '閱讀更多': 'Read More',
}

function translateValue(value: any): any {
    if (typeof value === 'string') {
        if (textTranslations[value]) {
            return textTranslations[value]
        }
        let translated = value
        for (const [zh, en] of Object.entries(textTranslations)) {
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

// ========== 主程式 ==========

async function translateRemainingContent() {
    console.log('🌐 開始翻譯剩餘內容...\n')

    // 1. 翻譯 Header
    console.log('📌 [1/5] 翻譯 Header...')
    const enHeader = await client.fetch(`*[_type == "header" && language == "en"][0]`)
    const zhHeader = await client.fetch(`*[_type == "header" && language == "zh-TW"][0]`)

    if (enHeader && zhHeader) {
        await client.patch(enHeader._id).set({
            storeName: headerTranslations.storeName,
            navigation: translateValue(zhHeader.navigation),
            marquee: {
                ...zhHeader.marquee,
                text: headerTranslations.marquee.text,
            },
            logo: zhHeader.logo,
            favicon: zhHeader.favicon,
            logoSize: zhHeader.logoSize,
        }).commit()
        console.log('   ✅ Header 已翻譯')
    } else {
        console.log('   ⚠️ 找不到 Header 文檔')
    }

    // 2. 翻譯 Footer
    console.log('📌 [2/5] 翻譯 Footer...')
    const enFooter = await client.fetch(`*[_type == "footer" && language == "en"][0]`)
    const zhFooter = await client.fetch(`*[_type == "footer" && language == "zh-TW"][0]`)

    if (enFooter && zhFooter) {
        await client.patch(enFooter._id).set({
            title: footerTranslations.title,
            sections: translateValue(zhFooter.sections),
            socialMedia: zhFooter.socialMedia,
            logo: zhFooter.logo,
            logoWidth: zhFooter.logoWidth,
            copyright: footerTranslations.copyright,
        }).commit()
        console.log('   ✅ Footer 已翻譯')
    } else {
        console.log('   ⚠️ 找不到 Footer 文檔')
    }

    // 3. 翻譯首頁
    console.log('📌 [3/5] 翻譯首頁...')
    const enHomePage = await client.fetch(`*[_type == "homePage" && language == "en"][0]`)

    if (enHomePage) {
        await client.patch(enHomePage._id).set({
            title: homePageTranslation.title,
            seoTitle: homePageTranslation.seoTitle,
            seoDescription: homePageTranslation.seoDescription,
            ogTitle: homePageTranslation.ogTitle,
            ogDescription: homePageTranslation.ogDescription,
            mainSections: translateValue(enHomePage.mainSections),
        }).commit()
        console.log('   ✅ 首頁已翻譯')
    } else {
        console.log('   ⚠️ 找不到首頁文檔')
    }

    // 4. 翻譯動態頁面
    console.log('📌 [4/5] 翻譯動態頁面...')
    const enDynamicPages = await client.fetch(`*[_type == "dynamicPage" && language == "en"]`)

    for (const page of enDynamicPages) {
        const slug = page.slug?.current
        const translation = dynamicPageTranslations[slug]

        if (translation) {
            await client.patch(page._id).set({
                title: translation.title,
                pageContent: textToBlocks(translation.content),
                seoTitle: translation.title,
            }).commit()
            console.log(`   ✅ 已翻譯: ${translation.title}`)
        } else {
            // 用通用翻譯
            await client.patch(page._id).set({
                title: translateValue(page.title),
                pageContent: translateValue(page.pageContent),
            }).commit()
            console.log(`   ✅ 已翻譯: ${page.title} (通用)`)
        }
    }

    // 5. 翻譯部落格頁面
    console.log('📌 [5/5] 翻譯部落格頁面...')
    const enBlogPage = await client.fetch(`*[_type == "blogPage" && language == "en"][0]`)

    if (enBlogPage) {
        await client.patch(enBlogPage._id).set({
            title: blogPageTranslation.title,
            description: blogPageTranslation.description,
            seoTitle: blogPageTranslation.seoTitle,
            seoDescription: blogPageTranslation.seoDescription,
        }).commit()
        console.log('   ✅ 部落格頁面已翻譯')
    } else {
        console.log('   ⚠️ 找不到部落格頁面文檔')
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 翻譯完成！')
    console.log('   ✅ Header')
    console.log('   ✅ Footer')
    console.log('   ✅ 首頁')
    console.log('   ✅ 動態頁面')
    console.log('   ✅ 部落格頁面')
    console.log('='.repeat(50))
}

translateRemainingContent().catch(console.error)

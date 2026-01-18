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

// SEO 內容
const seoContent: Record<string, any> = {
    // 首頁 SEO
    homePage: {
        'zh-TW': {
            seoTitle: "Tim's Fantasy World 男士專業美髮造型 | 台北男士理髮",
            seoDescription: "Tim's Fantasy World 提供專業男士理髮、染髮、燙髮服務。位於台北，經驗豐富的設計師為您打造完美造型。",
            seoKeywords: ['男士理髮', '男士染髮', '男士燙髮', '台北理髮廳', '男士造型', '專業理髮'],
            canonicalUrl: 'https://timsfantasyworld.com/tw',
            ogTitle: "Tim's Fantasy World | 男士專業美髮造型",
            ogDescription: "專業男士理髮、染髮、燙髮服務。經驗豐富的設計師為您打造完美造型。"
        },
        'ja-JP': {
            seoTitle: "Tim's Fantasy World メンズヘアサロン | 東京メンズ理容",
            seoDescription: "Tim's Fantasy Worldは、プロフェッショナルなメンズカット、カラー、パーマサービスを提供しています。経験豊富なスタイリストが理想のスタイルを作ります。",
            seoKeywords: ['メンズカット', 'メンズカラー', 'メンズパーマ', '理容室', 'メンズスタイリング', 'プロフェッショナル理容'],
            canonicalUrl: 'https://timsfantasyworld.com/jp',
            ogTitle: "Tim's Fantasy World | メンズヘアサロン",
            ogDescription: "プロフェッショナルなメンズカット、カラー、パーマサービス。経験豊富なスタイリストが理想のスタイルを作ります。"
        },
        'en': {
            seoKeywords: ['mens haircut', 'mens hair color', 'mens perm', 'barber shop', 'mens styling', 'professional barber'],
            canonicalUrl: 'https://timsfantasyworld.com/us'
        }
    },

    // 動態頁面 SEO
    dynamicPages: {
        'contact': {
            'zh-TW': {
                metaTitle: '聯絡我們 | Tim\'s Fantasy World',
                metaDescription: '歡迎聯絡 Tim\'s Fantasy World。我們提供專業男士理髮服務，期待為您服務。',
                canonicalUrl: 'https://timsfantasyworld.com/tw/contact'
            },
            'ja-JP': {
                metaTitle: 'お問い合わせ | Tim\'s Fantasy World',
                metaDescription: 'Tim\'s Fantasy Worldへのお問い合わせはこちら。プロフェッショナルなメンズヘアサービスを提供しています。',
                canonicalUrl: 'https://timsfantasyworld.com/jp/contact'
            },
            'en': {
                metaTitle: 'Contact Us | Tim\'s Fantasy World',
                metaDescription: 'Contact Tim\'s Fantasy World for professional men\'s hair services. We look forward to serving you.',
                canonicalUrl: 'https://timsfantasyworld.com/us/contact'
            }
        },
        'return': {
            'zh-TW': {
                metaTitle: '退換貨規則 | Tim\'s Fantasy World',
                metaDescription: '了解 Tim\'s Fantasy World 的退換貨政策。我們致力於提供最佳的客戶服務體驗。',
                canonicalUrl: 'https://timsfantasyworld.com/tw/return'
            },
            'ja-JP': {
                metaTitle: '返品・交換規則 | Tim\'s Fantasy World',
                metaDescription: 'Tim\'s Fantasy Worldの返品・交換ポリシーをご確認ください。最高のカスタマーサービスを提供します。',
                canonicalUrl: 'https://timsfantasyworld.com/jp/return'
            },
            'en': {
                metaTitle: 'Return Policy | Tim\'s Fantasy World',
                metaDescription: 'Learn about Tim\'s Fantasy World\'s return and exchange policy. We are committed to providing the best customer service.',
                canonicalUrl: 'https://timsfantasyworld.com/us/return'
            }
        },
        'faq': {
            'zh-TW': {
                metaTitle: '常見問題 | Tim\'s Fantasy World',
                metaDescription: '查看 Tim\'s Fantasy World 的常見問題解答。了解我們的服務、預約方式和營業時間。',
                canonicalUrl: 'https://timsfantasyworld.com/tw/faq'
            },
            'ja-JP': {
                metaTitle: 'よくある質問 | Tim\'s Fantasy World',
                metaDescription: 'Tim\'s Fantasy Worldのよくある質問をご覧ください。サービス、予約方法、営業時間についてご確認いただけます。',
                canonicalUrl: 'https://timsfantasyworld.com/jp/faq'
            },
            'en': {
                metaTitle: 'FAQ | Tim\'s Fantasy World',
                metaDescription: 'Find answers to frequently asked questions about Tim\'s Fantasy World. Learn about our services, booking, and hours.',
                canonicalUrl: 'https://timsfantasyworld.com/us/faq'
            }
        },
        'privacy-policy': {
            'zh-TW': {
                metaTitle: '隱私權政策 | Tim\'s Fantasy World',
                metaDescription: '閱讀 Tim\'s Fantasy World 的隱私權政策。我們重視並保護您的個人資料安全。',
                canonicalUrl: 'https://timsfantasyworld.com/tw/privacy-policy'
            },
            'ja-JP': {
                metaTitle: 'プライバシーポリシー | Tim\'s Fantasy World',
                metaDescription: 'Tim\'s Fantasy Worldのプライバシーポリシーをお読みください。お客様の個人情報を大切に保護します。',
                canonicalUrl: 'https://timsfantasyworld.com/jp/privacy-policy'
            },
            'en': {
                metaTitle: 'Privacy Policy | Tim\'s Fantasy World',
                metaDescription: 'Read Tim\'s Fantasy World\'s privacy policy. We value and protect your personal information.',
                canonicalUrl: 'https://timsfantasyworld.com/us/privacy-policy'
            }
        }
    },

    // 部落格頁面 SEO
    blogPage: {
        seoTitle: '部落格 | Tim\'s Fantasy World',
        seoDescription: '探索 Tim\'s Fantasy World 的部落格，了解最新的男士髮型趨勢、造型技巧和產品推薦。',
        seoKeywords: ['男士髮型', '造型技巧', '理髮趨勢', '產品評測', '髮型設計']
    }
}

async function updateSEO() {
    console.log('🌐 更新 SEO 內容...\n')

    // 1. 更新首頁 SEO
    console.log('📄 更新首頁 SEO...')
    const homePages = await client.fetch(`*[_type == "homePage"] {
    _id,
    language
  }`)

    for (const page of homePages) {
        const seo = seoContent.homePage[page.language]
        if (!seo) continue

        try {
            await client
                .patch(page._id)
                .set(seo)
                .commit()
            console.log(`  ✅ ${page.language}`)
        } catch (error) {
            console.error(`  ❌ ${page.language}:`, error)
        }
    }

    // 2. 更新動態頁面 SEO
    console.log('\n📄 更新動態頁面 SEO...')
    const dynamicPages = await client.fetch(`*[_type == "dynamicPage"] {
    _id,
    language,
    "slug": slug.current
  }`)

    for (const page of dynamicPages) {
        const seo = seoContent.dynamicPages[page.slug]?.[page.language]
        if (!seo) continue

        try {
            await client
                .patch(page._id)
                .set({ seo })
                .commit()
            console.log(`  ✅ ${page.language} - ${page.slug}`)
        } catch (error) {
            console.error(`  ❌ ${page.language} - ${page.slug}:`, error)
        }
    }

    // 3. 更新部落格頁面 SEO
    console.log('\n📄 更新部落格頁面 SEO...')
    const blogPage = await client.fetch(`*[_type == "blogPage"][0] {
    _id
  }`)

    if (blogPage) {
        try {
            await client
                .patch(blogPage._id)
                .set(seoContent.blogPage)
                .commit()
            console.log('  ✅ 部落格頁面')
        } catch (error) {
            console.error('  ❌ 部落格頁面:', error)
        }
    }

    console.log('\n✨ SEO 更新完成！')
}

updateSEO().catch(console.error)

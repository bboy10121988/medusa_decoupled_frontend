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

const featuredProductHeadings: Record<string, string> = {
    'zh-TW': '精選商品',
    'ja-JP': 'おすすめ商品',
    'en': 'Featured Products'
}

async function updateFeaturedProductHeadings() {
    console.log('🌐 更新精選商品標題...\n')

    const homePages = await client.fetch(`*[_type == "homePage"] {
    _id,
    language,
    mainSections
  }`)

    for (const page of homePages) {
        const language = page.language
        const heading = featuredProductHeadings[language]

        if (!heading) {
            console.log(`⏭️  跳過 ${language}: 沒有對應的標題`)
            continue
        }

        console.log(`📄 處理 ${language} 首頁...`)

        // 找到精選商品區塊並更新標題
        const updatedSections = page.mainSections.map((section: any) => {
            if (section._type === 'featuredProducts') {
                console.log(`   更新精選商品標題: "${heading}"`)
                return {
                    ...section,
                    heading: heading,
                    showHeading: true
                }
            }
            return section
        })

        try {
            await client
                .patch(page._id)
                .set({ mainSections: updatedSections })
                .commit()
            console.log(`   ✅ 已更新`)
        } catch (error) {
            console.error(`   ❌ 錯誤:`, error)
        }
    }

    console.log('\n✨ 完成！')
}

updateFeaturedProductHeadings().catch(console.error)

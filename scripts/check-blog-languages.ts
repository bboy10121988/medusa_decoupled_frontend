import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// 載入 .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
})

async function checkBlogPosts() {
    console.log('🔍 檢查 Sanity 中的部落格文章語言設定...\n')

    // 查詢所有文章及其語言
    const query = `*[_type == "post"] {
    _id,
    title,
    language,
    "slug": slug.current,
    publishedAt
  } | order(publishedAt desc)`

    try {
        const posts = await client.fetch(query)

        console.log(`📊 總共找到 ${posts.length} 篇文章\n`)

        // 按語言分組
        const byLanguage: Record<string, any[]> = {}
        posts.forEach((post: any) => {
            const lang = post.language || 'undefined'
            if (!byLanguage[lang]) {
                byLanguage[lang] = []
            }
            byLanguage[lang].push(post)
        })

        // 顯示統計
        console.log('📈 語言分布：')
        Object.keys(byLanguage).sort().forEach(lang => {
            console.log(`  ${lang}: ${byLanguage[lang].length} 篇`)
        })

        console.log('\n📝 各語言文章列表：\n')

        Object.keys(byLanguage).sort().forEach(lang => {
            console.log(`\n=== ${lang} (${byLanguage[lang].length} 篇) ===`)
            byLanguage[lang].slice(0, 5).forEach((post: any) => {
                console.log(`  - ${post.title}`)
                console.log(`    ID: ${post._id}`)
                console.log(`    Slug: ${post.slug}`)
                console.log(`    Published: ${post.publishedAt || 'N/A'}`)
            })
            if (byLanguage[lang].length > 5) {
                console.log(`  ... 還有 ${byLanguage[lang].length - 5} 篇`)
            }
        })

        // 檢查是否有 ja-JP 文章
        if (!byLanguage['ja-JP'] || byLanguage['ja-JP'].length === 0) {
            console.log('\n⚠️  警告：沒有找到 language 為 "ja-JP" 的文章！')
            console.log('   可能的原因：')
            console.log('   1. Sanity 中沒有日文文章')
            console.log('   2. 日文文章的 language 欄位設定錯誤（例如設為 "ja" 而不是 "ja-JP"）')
            console.log('   3. 日文文章尚未發布（status 不是 published）')
        }

    } catch (error) {
        console.error('❌ 錯誤：', error)
    }
}

checkBlogPosts()

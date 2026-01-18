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

async function checkBlogContent() {
    console.log('🔍 檢查日文文章的內容...\n')

    const query = `*[_type == "post" && language == "ja-JP"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    "hasBody": defined(body),
    "bodyLength": length(body),
    "bodyPreview": body[0..1]
  }`

    const posts = await client.fetch(query)

    console.log(`找到 ${posts.length} 篇日文文章\n`)

    posts.forEach((post: any) => {
        console.log(`📄 ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   有內文: ${post.hasBody ? '✅' : '❌'}`)
        console.log(`   內文長度: ${post.bodyLength || 0} 個區塊`)
        if (post.bodyPreview && post.bodyPreview.length > 0) {
            console.log(`   內文預覽: ${JSON.stringify(post.bodyPreview[0], null, 2).substring(0, 200)}...`)
        }
        console.log('')
    })

    const withoutBody = posts.filter((p: any) => !p.hasBody || p.bodyLength === 0)
    if (withoutBody.length > 0) {
        console.log(`\n⚠️  有 ${withoutBody.length} 篇文章沒有內文或內文為空`)
        console.log('   這些文章需要在 Sanity Studio 中手動編輯日文內容')
    }
}

checkBlogContent().catch(console.error)

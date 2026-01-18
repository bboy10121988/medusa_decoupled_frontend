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

async function testQuery() {
    console.log('🔍 測試日文文章查詢...\n')

    const lang = 'ja-JP'

    // 測試基本查詢
    const query1 = `*[_type == "post" && language == $lang] | order(publishedAt desc) [0...10] {
    _id,
    title,
    language,
    status,
    publishedAt,
    "slug": slug.current
  }`

    console.log('查詢 1: 基本查詢（無 status 過濾）')
    console.log(`Query: ${query1}`)
    console.log(`Params: { lang: "${lang}" }\n`)

    const posts1 = await client.fetch(query1, { lang })
    console.log(`結果: 找到 ${posts1.length} 篇文章`)
    posts1.forEach((post: any) => {
        console.log(`  - ${post.title}`)
        console.log(`    Status: ${post.status || 'undefined'}`)
        console.log(`    Published: ${post.publishedAt || 'N/A'}`)
    })

    // 測試加上 status 過濾
    const query2 = `*[_type == "post" && language == $lang && status == "published"] | order(publishedAt desc) [0...10] {
    _id,
    title,
    language,
    status,
    publishedAt,
    "slug": slug.current
  }`

    console.log('\n\n查詢 2: 加上 status == "published" 過濾')
    console.log(`Query: ${query2}`)
    console.log(`Params: { lang: "${lang}" }\n`)

    const posts2 = await client.fetch(query2, { lang })
    console.log(`結果: 找到 ${posts2.length} 篇文章`)
    posts2.forEach((post: any) => {
        console.log(`  - ${post.title}`)
        console.log(`    Status: ${post.status}`)
        console.log(`    Published: ${post.publishedAt}`)
    })

    if (posts1.length > posts2.length) {
        console.log(`\n⚠️  有 ${posts1.length - posts2.length} 篇文章因為 status 不是 "published" 而被過濾掉`)
    }
}

testQuery().catch(console.error)

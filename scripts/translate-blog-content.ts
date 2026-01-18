import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import fetch from 'node-fetch'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
})

const DEEPL_API_KEY = process.env.DEEPL_API_KEY || ''

async function translateText(text: string, targetLang: string): Promise<string> {
    if (!DEEPL_API_KEY) {
        console.log('⚠️  DEEPL_API_KEY 未設定，跳過翻譯')
        return text
    }

    try {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                text: text,
                target_lang: targetLang,
                source_lang: 'ZH',
            }),
        })

        const data = await response.json() as any
        return data.translations?.[0]?.text || text
    } catch (error) {
        console.error('翻譯錯誤:', error)
        return text
    }
}

async function translatePortableText(blocks: any[], targetLang: string): Promise<any[]> {
    const translatedBlocks = []

    for (const block of blocks) {
        if (block._type === 'block' && block.children) {
            // 翻譯文字區塊
            const translatedChildren = []
            for (const child of block.children) {
                if (child._type === 'span' && child.text) {
                    const translatedText = await translateText(child.text, targetLang)
                    translatedChildren.push({
                        ...child,
                        text: translatedText
                    })
                    // 避免 API 限流
                    await new Promise(resolve => setTimeout(resolve, 100))
                } else {
                    translatedChildren.push(child)
                }
            }
            translatedBlocks.push({
                ...block,
                children: translatedChildren
            })
        } else {
            // 非文字區塊（如圖片）直接保留
            translatedBlocks.push(block)
        }
    }

    return translatedBlocks
}

async function translateBlogPosts(dryRun: boolean = true) {
    console.log('🌐 開始翻譯日文部落格文章內容...\n')

    if (dryRun) {
        console.log('🔍 DRY-RUN 模式：不會實際修改 Sanity 資料\n')
    }

    // 獲取所有日文文章
    const query = `*[_type == "post" && language == "ja-JP"] | order(publishedAt desc) {
    _id,
    _rev,
    title,
    "slug": slug.current,
    body
  }`

    const posts = await client.fetch(query)
    console.log(`找到 ${posts.length} 篇日文文章\n`)

    for (const post of posts) {
        console.log(`\n📄 處理: ${post.title}`)
        console.log(`   ID: ${post._id}`)

        if (!post.body || post.body.length === 0) {
            console.log('   ⏭️  跳過：沒有內容')
            continue
        }

        console.log(`   📝 翻譯 ${post.body.length} 個內容區塊...`)

        try {
            const translatedBody = await translatePortableText(post.body, 'JA')

            // 顯示翻譯前後對比
            const originalFirstText = post.body[0]?.children?.[0]?.text || ''
            const translatedFirstText = translatedBody[0]?.children?.[0]?.text || ''

            if (originalFirstText) {
                console.log(`   原文: ${originalFirstText.substring(0, 50)}...`)
                console.log(`   譯文: ${translatedFirstText.substring(0, 50)}...`)
            }

            if (!dryRun) {
                // 更新到 Sanity
                await client
                    .patch(post._id)
                    .set({ body: translatedBody })
                    .commit()
                console.log('   ✅ 已更新到 Sanity')
            } else {
                console.log('   ℹ️  DRY-RUN: 未實際更新')
            }

        } catch (error) {
            console.error(`   ❌ 錯誤:`, error)
        }
    }

    console.log('\n✨ 完成！')

    if (dryRun) {
        console.log('\n💡 提示：執行時不加 --dry-run 參數即可實際更新 Sanity')
    }
}

// 檢查命令列參數
const isDryRun = !process.argv.includes('--execute')

translateBlogPosts(isDryRun).catch(console.error)

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

async function checkActualContent() {
    console.log('🔍 檢查實際的文章內容...\n')

    const query = `*[_type == "post" && language == "ja-JP" && slug.current == "wash-cut-eyebrow"][0] {
    _id,
    title,
    body
  }`

    const post = await client.fetch(query)

    console.log(`文章: ${post.title}`)
    console.log(`\n完整內容:\n`)

    post.body.forEach((block: any, index: number) => {
        console.log(`\n區塊 ${index + 1} (${block._type}):`)
        if (block._type === 'block' && block.children) {
            block.children.forEach((child: any) => {
                if (child._type === 'span') {
                    console.log(`  文字: "${child.text}"`)
                }
            })
        }
    })
}

checkActualContent().catch(console.error)

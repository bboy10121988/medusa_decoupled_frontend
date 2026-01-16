/**
 * Sanity 多語系遷移腳本
 * 
 * 用途：將現有的 Sanity 文檔添加 language 欄位，設為預設語言 'zh-TW'
 * 
 * 執行方式：
 * npx ts-node --esm scripts/migrate-i18n.ts
 * 
 * 或者直接:
 * npx sanity exec scripts/migrate-i18n.ts --with-user-token
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// 載入環境變數
dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN!, // 需要有寫入權限的 Token
    useCdn: false,
})

// 需要添加語言欄位的文檔類型
const schemaTypesToMigrate = [
    'homePage',
    'dynamicPage',
    'blogPage',
    'post',
    'category',
    'header',
    'footer',
]

const DEFAULT_LANGUAGE = 'zh-TW'

async function migrateDocuments() {
    console.log('🚀 開始執行多語系遷移...')
    console.log(`📝 將為以下類型的文檔添加 language: ${DEFAULT_LANGUAGE}`)
    console.log(`   類型: ${schemaTypesToMigrate.join(', ')}`)
    console.log('')

    let totalMigrated = 0
    let totalSkipped = 0

    for (const schemaType of schemaTypesToMigrate) {
        console.log(`\n📂 處理類型: ${schemaType}`)

        // 查詢所有該類型的文檔（沒有 language 欄位的）
        const query = `*[_type == $type && !defined(language)]`
        const docs = await client.fetch(query, { type: schemaType })

        if (docs.length === 0) {
            console.log(`   ✅ 沒有需要遷移的文檔`)
            continue
        }

        console.log(`   找到 ${docs.length} 個需要遷移的文檔`)

        for (const doc of docs) {
            try {
                await client
                    .patch(doc._id)
                    .set({ language: DEFAULT_LANGUAGE })
                    .commit()

                console.log(`   ✅ 已遷移: ${doc._id} (${doc.title || doc.name || '無標題'})`)
                totalMigrated++
            } catch (error) {
                console.error(`   ❌ 遷移失敗: ${doc._id}`, error)
            }
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`🎉 遷移完成！`)
    console.log(`   已遷移: ${totalMigrated} 個文檔`)
    console.log(`   跳過: ${totalSkipped} 個文檔`)
    console.log('='.repeat(50))
}

// 執行遷移
migrateDocuments().catch(console.error)

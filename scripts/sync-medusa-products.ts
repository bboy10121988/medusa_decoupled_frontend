/**
 * Medusa 商品同步到 Sanity 腳本
 * 
 * 用途：從 Medusa 抓取所有商品，在 Sanity 中建立對應的 product 文檔
 * 
 * 執行方式：
 * npx ts-node --esm scripts/sync-medusa-products.ts
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// 載入環境變數
dotenv.config({ path: '.env.local' })

const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN, // 需要有寫入權限的 Token
    useCdn: false,
})

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://admin.timsfantasyworld.com'
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
const DEFAULT_LANGUAGE = 'zh-TW'

interface MedusaProduct {
    id: string
    title: string
    handle: string
    description: string | null
    metadata: {
        detail_content?: string
        detail_images?: string
    } | null
}

async function fetchMedusaProducts(): Promise<MedusaProduct[]> {
    console.log('📦 正在從 Medusa 獲取商品列表...')
    console.log(`   Backend URL: ${MEDUSA_BACKEND_URL}`)

    try {
        const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?limit=100`, {
            headers: {
                'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`Medusa API 錯誤: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`   找到 ${data.products?.length || 0} 個商品`)
        return data.products || []
    } catch (error) {
        console.error('❌ 無法連接 Medusa:', error)
        throw error
    }
}

async function checkExistingProduct(medusaId: string): Promise<boolean> {
    const query = `*[_type == "product" && medusaId == $medusaId][0]`
    const existing = await sanityClient.fetch(query, { medusaId })
    return !!existing
}

async function syncProducts() {
    console.log('🚀 開始同步 Medusa 商品到 Sanity...')
    console.log('')

    const products = await fetchMedusaProducts()

    if (products.length === 0) {
        console.log('⚠️ 沒有找到任何商品')
        return
    }

    let created = 0
    let skipped = 0
    let failed = 0

    for (const product of products) {
        console.log(`\n📦 處理商品: ${product.title}`)

        // 檢查是否已存在
        const exists = await checkExistingProduct(product.id)
        if (exists) {
            console.log(`   ⏭️ 已存在，跳過`)
            skipped++
            continue
        }

        try {
            // 解析 detail_images (從 Medusa metadata)
            let detailImages: string[] = []
            if (product.metadata?.detail_images) {
                try {
                    detailImages = JSON.parse(product.metadata.detail_images)
                } catch {
                    // 如果不是 JSON 格式，當作單個 URL
                    detailImages = [product.metadata.detail_images]
                }
            }

            // 建立 Sanity 文檔
            const doc = {
                _type: 'product',
                title: product.title,
                slug: {
                    _type: 'slug',
                    current: product.handle,
                },
                medusaId: product.id,
                description: product.description || '',
                language: DEFAULT_LANGUAGE,
                // 如果有 detail_content，放入 body (簡化處理，只放純文字)
                body: product.metadata?.detail_content
                    ? [
                        {
                            _type: 'block',
                            _key: 'initial-block',
                            style: 'normal',
                            markDefs: [],
                            children: [
                                {
                                    _type: 'span',
                                    _key: 'initial-span',
                                    text: product.metadata.detail_content,
                                    marks: [],
                                },
                            ],
                        },
                    ]
                    : [],
                // 圖片 URL 需要另外處理（Sanity 需要上傳圖片）
                // 這裡暫時只記錄 URL，之後可以手動上傳
            }

            await sanityClient.create(doc)
            console.log(`   ✅ 已建立`)
            created++
        } catch (error) {
            console.error(`   ❌ 建立失敗:`, error)
            failed++
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 同步完成！')
    console.log(`   已建立: ${created} 個商品`)
    console.log(`   已跳過: ${skipped} 個商品 (已存在)`)
    console.log(`   失敗: ${failed} 個商品`)
    console.log('='.repeat(50))

    if (created > 0) {
        console.log('\n📝 提醒：')
        console.log('   1. 詳情圖片需要在 Sanity Studio 中手動上傳')
        console.log('   2. 建立英文版本請使用 Sanity Studio 的「翻譯」功能')
    }
}

// 執行同步
syncProducts().catch(console.error)

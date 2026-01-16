/**
 * 更新 Sanity 商品詳情內容（從 Medusa 取得）
 * 
 * 用途：
 * 1. 從 Medusa 獲取商品的 detail_content 和 detail_images
 * 2. 更新對應的 Sanity product 文檔
 * 3. 上傳圖片到 Sanity 資產庫
 * 
 * 執行方式：
 * npx tsx scripts/update-products-from-medusa.ts
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config({ path: '.env.local' })

const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://admin.timsfantasyworld.com'
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

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

// 從 URL 上傳圖片到 Sanity
async function uploadImageFromUrl(imageUrl: string): Promise<any> {
    try {
        console.log(`      📷 上傳圖片: ${imageUrl.substring(0, 50)}...`)

        const response = await fetch(imageUrl)
        if (!response.ok) {
            throw new Error(`無法獲取圖片: ${response.status}`)
        }

        const buffer = await response.buffer()
        const contentType = response.headers.get('content-type') || 'image/jpeg'

        // 從 URL 取得檔名
        const urlParts = imageUrl.split('/')
        const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg'

        const asset = await sanityClient.assets.upload('image', buffer, {
            filename,
            contentType,
        })

        return {
            _type: 'image',
            _key: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            asset: {
                _type: 'reference',
                _ref: asset._id,
            },
        }
    } catch (error: any) {
        console.log(`      ⚠️ 圖片上傳失敗: ${error.message}`)
        return null
    }
}

// 解析 HTML 內容為 Sanity block content
function parseHtmlToBlocks(html: string): any[] {
    if (!html) return []

    // 簡單解析：去除 HTML 標籤，保留文字內容
    // 按段落分割
    const cleanText = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .trim()

    if (!cleanText) return []

    const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim())

    return paragraphs.map((text, index) => ({
        _type: 'block',
        _key: `block-${Date.now()}-${index}`,
        style: 'normal',
        markDefs: [],
        children: [
            {
                _type: 'span',
                _key: `span-${Date.now()}-${index}`,
                text: text.trim(),
                marks: [],
            },
        ],
    }))
}

async function updateProductsFromMedusa() {
    console.log('🔄 開始從 Medusa 更新商品詳情...\n')

    // 1. 獲取 Medusa 商品
    console.log('📦 正在從 Medusa 獲取商品...')
    console.log(`   Backend URL: ${MEDUSA_BACKEND_URL}`)

    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?limit=100`, {
        headers: {
            'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Medusa API 錯誤: ${response.status}`)
    }

    const data = await response.json()
    const medusaProducts: MedusaProduct[] = data.products || []
    console.log(`   找到 ${medusaProducts.length} 個商品\n`)

    let updated = 0
    let noChanges = 0
    let failed = 0

    for (const medusaProduct of medusaProducts) {
        console.log(`\n📦 處理: ${medusaProduct.title}`)

        // 找到對應的 Sanity 商品（中文版）
        const sanityProduct = await sanityClient.fetch(
            `*[_type == "product" && medusaId == $medusaId && language == "zh-TW"][0]`,
            { medusaId: medusaProduct.id }
        )

        if (!sanityProduct) {
            console.log(`   ⚠️ 找不到 Sanity 對應的中文版商品`)
            continue
        }

        // 檢查 Medusa metadata
        const detailContent = medusaProduct.metadata?.detail_content
        const detailImagesRaw = medusaProduct.metadata?.detail_images

        console.log(`   📝 detail_content: ${detailContent ? '有資料' : '無'}`)
        console.log(`   📷 detail_images: ${detailImagesRaw ? '有資料' : '無'}`)

        if (!detailContent && !detailImagesRaw) {
            console.log(`   ⏭️ 無詳情內容，跳過`)
            noChanges++
            continue
        }

        try {
            const updateData: any = {}

            // 處理 detail_content
            if (detailContent) {
                updateData.body = parseHtmlToBlocks(detailContent)
                console.log(`   ✅ 解析詳細介紹: ${updateData.body.length} 個段落`)
            }

            // 處理 detail_images
            if (detailImagesRaw) {
                let imageUrls: string[] = []
                try {
                    imageUrls = JSON.parse(detailImagesRaw)
                } catch {
                    imageUrls = [detailImagesRaw]
                }

                if (imageUrls.length > 0) {
                    console.log(`   📷 準備上傳 ${imageUrls.length} 張圖片...`)

                    const uploadedImages = []
                    for (const url of imageUrls) {
                        if (url && typeof url === 'string' && url.startsWith('http')) {
                            const uploaded = await uploadImageFromUrl(url)
                            if (uploaded) {
                                uploadedImages.push(uploaded)
                            }
                        }
                    }

                    if (uploadedImages.length > 0) {
                        updateData.images = uploadedImages
                        console.log(`   ✅ 成功上傳 ${uploadedImages.length} 張圖片`)
                    }
                }
            }

            // 更新 Sanity 文檔
            if (Object.keys(updateData).length > 0) {
                await sanityClient.patch(sanityProduct._id).set(updateData).commit()
                console.log(`   ✅ 已更新商品`)
                updated++
            } else {
                noChanges++
            }

        } catch (error: any) {
            console.log(`   ❌ 更新失敗: ${error.message}`)
            failed++
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 更新完成！')
    console.log(`   已更新: ${updated} 個商品`)
    console.log(`   無變更: ${noChanges} 個商品`)
    console.log(`   失敗: ${failed} 個商品`)
    console.log('='.repeat(50))
}

updateProductsFromMedusa().catch(console.error)

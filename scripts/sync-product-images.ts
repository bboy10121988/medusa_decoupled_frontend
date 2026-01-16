/**
 * 同步 Medusa 商品圖片到 Sanity
 * 
 * 用途：
 * 1. 從 Medusa 獲取商品的 images 陣列
 * 2. 上傳圖片到 Sanity 資產庫
 * 3. 更新 Sanity product 文檔的 images 欄位
 * 
 * 執行方式：
 * npx tsx scripts/sync-product-images.ts
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN!,
    useCdn: false,
})

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://admin.timsfantasyworld.com'
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

interface MedusaImage {
    id: string
    url: string
    rank: number
}

interface MedusaProduct {
    id: string
    title: string
    handle: string
    description: string | null
    images: MedusaImage[]
}

// 從 URL 上傳圖片到 Sanity
async function uploadImageFromUrl(imageUrl: string, index: number): Promise<any> {
    try {
        console.log(`      📷 上傳圖片 ${index + 1}: ${imageUrl.split('/').pop()?.substring(0, 30)}...`)

        const response = await fetch(imageUrl)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const contentType = response.headers.get('content-type') || 'image/webp'

        const urlParts = imageUrl.split('/')
        const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.webp'

        const asset = await sanityClient.assets.upload('image', buffer, {
            filename,
            contentType,
        })

        console.log(`         ✅ 上傳成功: ${asset._id}`)

        return {
            _type: 'image',
            _key: `img-${Date.now()}-${index}`,
            asset: {
                _type: 'reference',
                _ref: asset._id,
            },
        }
    } catch (error: any) {
        console.log(`         ❌ 上傳失敗: ${error.message}`)
        return null
    }
}

// 解析 description 為 Sanity block content
function parseDescriptionToBlocks(description: string): any[] {
    if (!description) return []

    const paragraphs = description.split(/\n\n+|\n/).filter(p => p.trim())

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

async function syncProductImages() {
    console.log('📦 開始同步 Medusa 商品圖片到 Sanity...\n')
    console.log(`   Medusa URL: ${MEDUSA_BACKEND_URL}`)
    console.log(`   Publishable Key: ${MEDUSA_PUBLISHABLE_KEY.substring(0, 20)}...\n`)

    // 1. 獲取 Medusa 商品
    console.log('🔍 正在從 Medusa 獲取商品...')

    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?limit=100`, {
        headers: {
            'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Medusa API 錯誤: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const medusaProducts: MedusaProduct[] = data.products || []
    console.log(`   找到 ${medusaProducts.length} 個商品\n`)

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const medusaProduct of medusaProducts) {
        console.log(`\n📦 ${medusaProduct.title}`)
        console.log(`   Handle: ${medusaProduct.handle}`)
        console.log(`   圖片數量: ${medusaProduct.images?.length || 0}`)

        // 找到對應的 Sanity 商品（中文版）
        const sanityProduct = await sanityClient.fetch(
            `*[_type == "product" && medusaId == $medusaId && language == "zh-TW"][0]`,
            { medusaId: medusaProduct.id }
        )

        if (!sanityProduct) {
            console.log(`   ⚠️ 找不到對應的 Sanity 商品 (ID: ${medusaProduct.id})`)
            skipped++
            continue
        }

        console.log(`   Sanity ID: ${sanityProduct._id}`)

        // 檢查是否已有圖片
        if (sanityProduct.images && sanityProduct.images.length > 0) {
            console.log(`   ⏭️ 已有 ${sanityProduct.images.length} 張圖片，跳過`)
            skipped++
            continue
        }

        if (!medusaProduct.images || medusaProduct.images.length === 0) {
            console.log(`   ⏭️ Medusa 無圖片，跳過`)
            skipped++
            continue
        }

        try {
            const updateData: any = {}

            // 上傳圖片（跳過第一張 thumbnail）
            const imagesToUpload = medusaProduct.images.slice(1) // 第一張通常是 thumbnail

            if (imagesToUpload.length > 0) {
                console.log(`   📷 準備上傳 ${imagesToUpload.length} 張詳情圖片...`)

                const uploadedImages = []
                for (let i = 0; i < imagesToUpload.length; i++) {
                    const img = imagesToUpload[i]
                    if (img.url) {
                        const uploaded = await uploadImageFromUrl(img.url, i)
                        if (uploaded) {
                            uploadedImages.push(uploaded)
                        }
                    }
                }

                if (uploadedImages.length > 0) {
                    updateData.images = uploadedImages
                }
            }

            // 如果 description 很長，同時更新 body
            if (medusaProduct.description && medusaProduct.description.length > 100) {
                const existingBody = sanityProduct.body || []
                if (existingBody.length === 0) {
                    updateData.body = parseDescriptionToBlocks(medusaProduct.description)
                    console.log(`   📝 已解析 description (${updateData.body.length} 段落)`)
                }
            }

            // 更新 Sanity 文檔
            if (Object.keys(updateData).length > 0) {
                await sanityClient.patch(sanityProduct._id).set(updateData).commit()
                console.log(`   ✅ 已更新！`)
                if (updateData.images) {
                    console.log(`      - ${updateData.images.length} 張圖片`)
                }
                if (updateData.body) {
                    console.log(`      - ${updateData.body.length} 段詳細介紹`)
                }
                updated++
            } else {
                console.log(`   ⏭️ 無需更新`)
                skipped++
            }

        } catch (error: any) {
            console.log(`   ❌ 更新失敗: ${error.message}`)
            failed++
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 同步完成！')
    console.log(`   已更新: ${updated} 個商品`)
    console.log(`   已跳過: ${skipped} 個商品`)
    console.log(`   失敗: ${failed} 個商品`)
    console.log('='.repeat(50))
}

syncProductImages().catch(console.error)

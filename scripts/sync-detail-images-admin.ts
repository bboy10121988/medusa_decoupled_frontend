/**
 * 同步 Medusa 商品詳情圖到 Sanity
 * 
 * 使用 Medusa Admin API 來獲取 detail_images (metadata)
 * 
 * 執行方式：
 * npx tsx scripts/sync-detail-images-admin.ts
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


// 從 URL 上傳圖片到 Sanity
async function uploadImageFromUrl(imageUrl: string, index: number): Promise<any> {
    try {
        // 清理 URL（移除可能的多餘字元）
        const cleanUrl = imageUrl.trim()
        if (!cleanUrl || !cleanUrl.startsWith('http')) {
            console.log(`         ⚠️ 無效 URL: ${cleanUrl?.substring(0, 30)}...`)
            return null
        }

        console.log(`      📷 上傳圖片 ${index + 1}: ${cleanUrl.split('/').pop()?.substring(0, 40)}...`)

        const response = await fetch(cleanUrl)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const contentType = response.headers.get('content-type') || 'image/webp'

        const urlParts = cleanUrl.split('/')
        const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.webp'

        const asset = await sanityClient.assets.upload('image', buffer, {
            filename,
            contentType,
        })

        console.log(`         ✅ 上傳成功`)

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

async function syncDetailImages() {
    console.log('📷 開始同步 Medusa 商品詳情圖到 Sanity...\n')

    // 1. 獲取所有 Sanity 中文版商品
    const sanityProducts = await sanityClient.fetch(
        `*[_type == "product" && language == "zh-TW"]{_id, title, medusaId, slug, images}`
    )

    console.log(`📦 找到 ${sanityProducts.length} 個 Sanity 商品\n`)

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const sanityProduct of sanityProducts) {
        console.log(`\n📦 ${sanityProduct.title}`)
        console.log(`   Medusa ID: ${sanityProduct.medusaId}`)

        // 跳過已有圖片的商品 (註解掉以便重新同步)
        // if (sanityProduct.images && sanityProduct.images.length > 0) {
        //     console.log(`   ⏭️ 已有 ${sanityProduct.images.length} 張圖片，跳過`)
        //     skipped++
        //     continue
        // }

        // 2. 使用公開的 Store API 獲取商品詳情
        try {
            const detailUrl = `${MEDUSA_BACKEND_URL}/store/products/${sanityProduct.medusaId}/detail-content`
            console.log(`   🔍 獲取詳情...`)

            const response = await fetch(detailUrl, {
                headers: {
                    'x-publishable-api-key': 'pk_df177fe4f1c94ded6d9f25681a9519cb20f462f9d240d4de1708304f9cc05dd7',
                    'Content-Type': 'application/json',
                }
            })

            if (!response.ok) {
                console.log(`   ⚠️ 無法獲取詳情 (HTTP ${response.status})`)
                skipped++
                continue
            }

            const detailData = await response.json()
            const detailImages = detailData.detail_images || []

            console.log(`   📷 detail_images: ${detailImages.length} 張`)

            if (detailImages.length === 0) {
                console.log(`   ⏭️ 無詳情圖，跳過`)
                skipped++
                continue
            }

            // 3. 上傳圖片到 Sanity
            console.log(`   📤 準備上傳 ${detailImages.length} 張圖片...`)

            const uploadedImages = []
            for (let i = 0; i < detailImages.length; i++) {
                const imgUrl = detailImages[i]
                const uploaded = await uploadImageFromUrl(imgUrl, i)
                if (uploaded) {
                    uploadedImages.push(uploaded)
                }
            }

            if (uploadedImages.length > 0) {
                await sanityClient.patch(sanityProduct._id).set({
                    images: uploadedImages
                }).commit()

                console.log(`   ✅ 已更新 ${uploadedImages.length} 張圖片`)
                updated++
            } else {
                console.log(`   ⚠️ 無圖片上傳成功`)
                skipped++
            }

        } catch (error: any) {
            console.log(`   ❌ 錯誤: ${error.message}`)
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

syncDetailImages().catch(console.error)

import { createClient } from '@sanity/client'
import 'dotenv/config'

// DeepL API 設定
const DEEPL_API_KEY = process.env.DEEPL_API_KEY
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'

// Sanity 客戶端
const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
})

// 翻譯函數
async function translateText(text: string, targetLang: 'EN' | 'JA'): Promise<string> {
    if (!text || text.trim() === '') return text
    if (!DEEPL_API_KEY) {
        console.log('⚠️ No DeepL API key, skipping translation')
        return text
    }

    try {
        const response = await fetch(DEEPL_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                text: text,
                source_lang: 'ZH',
                target_lang: targetLang,
            }),
        })

        if (!response.ok) {
            console.log(`⚠️ DeepL API error: ${response.status}`)
            return text
        }

        const data = await response.json()
        return data.translations[0].text
    } catch (error: any) {
        console.log(`⚠️ Translation error: ${error.message}`)
        return text
    }
}

// 翻譯產品內容
async function translateProducts() {
    console.log('🌐 Starting product content translation...\n')

    // 獲取所有中文產品內容
    const zhProducts = await client.fetch(`
    *[_type == "product" && language == "zh-TW"] {
      _id,
      title,
      description,
      productId,
      language
    }
  `)

    console.log(`Found ${zhProducts.length} Chinese products\n`)

    for (const zhProduct of zhProducts) {
        console.log(`\n📦 Processing: ${zhProduct.title}`)
        console.log(`   Product ID: ${zhProduct.productId}`)

        // 檢查是否有英文版本
        const enProduct = await client.fetch(`
      *[_type == "product" && language == "en" && productId == $productId][0]
    `, { productId: zhProduct.productId })

        // 檢查是否有日文版本
        const jaProduct = await client.fetch(`
      *[_type == "product" && language == "ja-JP" && productId == $productId][0]
    `, { productId: zhProduct.productId })

        // 翻譯成英文
        if (!enProduct || !enProduct.description) {
            console.log('   🇺🇸 Translating to English...')
            const enTitle = await translateText(zhProduct.title, 'EN')
            const enDescription = await translateText(zhProduct.description || '', 'EN')

            if (enProduct) {
                // 更新現有文件
                await client.patch(enProduct._id)
                    .set({
                        title: enTitle,
                        description: enDescription
                    })
                    .commit()
                console.log('   ✅ English product updated')
            } else {
                // 創建新文件
                await client.create({
                    _type: 'product',
                    productId: zhProduct.productId,
                    language: 'en',
                    title: enTitle,
                    description: enDescription
                })
                console.log('   ✅ English product created')
            }
        } else {
            console.log('   ℹ️ English version already exists')
        }

        // 翻譯成日文
        if (!jaProduct || !jaProduct.description) {
            console.log('   🇯🇵 Translating to Japanese...')
            const jaTitle = await translateText(zhProduct.title, 'JA')
            const jaDescription = await translateText(zhProduct.description || '', 'JA')

            if (jaProduct) {
                // 更新現有文件
                await client.patch(jaProduct._id)
                    .set({
                        title: jaTitle,
                        description: jaDescription
                    })
                    .commit()
                console.log('   ✅ Japanese product updated')
            } else {
                // 創建新文件
                await client.create({
                    _type: 'product',
                    productId: zhProduct.productId,
                    language: 'ja-JP',
                    title: jaTitle,
                    description: jaDescription
                })
                console.log('   ✅ Japanese product created')
            }
        } else {
            console.log('   ℹ️ Japanese version already exists')
        }

        // 避免 API 速率限制
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n\n✅ Translation completed!')
}

translateProducts().catch(console.error)

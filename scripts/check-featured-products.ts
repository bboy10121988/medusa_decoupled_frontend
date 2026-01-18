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

async function checkFeaturedProducts() {
    console.log('🔍 檢查精選商品結構...\n')

    // 檢查首頁中的精選商品區塊
    const homePages = await client.fetch(`*[_type == "homePage"] {
    language,
    "featuredSections": mainSections[_type == "featuredProducts"] {
      _type,
      heading,
      collection_id,
      isActive
    }
  }`)

    console.log('首頁中的精選商品區塊：')
    homePages.forEach((page: any) => {
        console.log(`\n語言: ${page.language}`)
        if (page.featuredSections && page.featuredSections.length > 0) {
            page.featuredSections.forEach((section: any) => {
                console.log(`  - 標題: ${section.heading || 'N/A'}`)
                console.log(`    Collection ID: ${section.collection_id || 'N/A'}`)
                console.log(`    啟用: ${section.isActive}`)
            })
        } else {
            console.log('  沒有精選商品區塊')
        }
    })

    // 檢查獨立的 featuredProducts 文檔
    const featuredProducts = await client.fetch(`*[_type == "featuredProducts"] {
    _id,
    title,
    language,
    handle,
    collection_id,
    isActive
  }`)

    console.log(`\n\n獨立的 featuredProducts 文檔: ${featuredProducts.length} 個`)
    featuredProducts.forEach((fp: any) => {
        console.log(`  - ${fp.title} (${fp.language})`)
    })
}

checkFeaturedProducts().catch(console.error)

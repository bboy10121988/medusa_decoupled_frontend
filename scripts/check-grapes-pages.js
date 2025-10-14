import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  apiVersion: '2023-10-01',
  useCdn: false
})

// 查詢所有 GrapesJS 頁面
async function checkGrapesPages() {
  try {
    const pages = await client.fetch(`
      *[_type == "grapesJSPageV2"] | order(_createdAt desc) {
        _id,
        title,
        slug,
        status,
        _createdAt,
        _updatedAt,
        grapesHtml != null => true,
        grapesCss != null => true
      }
    `)

    console.log('📄 找到的 GrapesJS 頁面:')
    console.log(`總數: ${pages.length}`)
    
    if (pages.length > 0) {
      pages.forEach((page, index) => {
        console.log(`\n${index + 1}. ${page.title}`)
        console.log(`   ID: ${page._id}`)
        console.log(`   Slug: ${page.slug?.current || '無'}`)
        console.log(`   狀態: ${page.status}`)
        console.log(`   建立時間: ${page._createdAt}`)
        console.log(`   更新時間: ${page._updatedAt}`)
        console.log(`   有 HTML 內容: ${page.grapesHtml ? '是' : '否'}`)
        console.log(`   有 CSS 樣式: ${page.grapesCss ? '是' : '否'}`)
      })
    } else {
      console.log('沒有找到任何頁面，建議建立一個測試頁面')
    }

  } catch (error) {
    console.error('查詢失敗:', error)
  }
}

checkGrapesPages()
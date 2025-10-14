const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'sk7cy9IXVaYXflEPWIWlstCEq6dxEugXVr9ZTCr9qlaReOdYzbtGAyoq1rkua38lgx7wO4EzbfgeOi18NmurGZp4kjv6lh91dCreUBdaGjLQzt0ur9tTEd3Vg08r05eDToBMRZaie18uzxBet1SR9bNnz5LRdeMvwbMjuVsnvudW3wH3Np1s'
})

async function checkContent() {
  try {
    // 檢查新的動態頁面內容
    console.log('🔍 檢查新的動態頁面內容...')
    const dynamicPages = await client.fetch(`
      *[_type == "dynamicPage"]{
        _id,
        title,
        slug,
        pageContent,
        _migration
      }
    `)
    
    console.log('\n📋 動態頁面內容檢查:')
    dynamicPages.forEach((page, index) => {
      console.log(`\n${index + 1}. ${page.title}`)
      console.log(`   Slug: ${page.slug?.current}`)
      console.log(`   pageContent 長度: ${page.pageContent?.length || 0}`)
      console.log(`   原始 ID: ${page._migration?.originalId}`)
      
      if (page.pageContent && page.pageContent.length > 0) {
        page.pageContent.forEach((block, blockIndex) => {
          console.log(`     區塊 ${blockIndex + 1}: ${block._type} - "${block.title}"`)
          if (block.content && block.content[0]?.children?.[0]?.text) {
            const text = block.content[0].children[0].text
            console.log(`       內容預覽: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`)
          }
        })
      } else {
        console.log('     ⚠️  沒有 pageContent')
      }
    })
    
    // 檢查原始資料
    console.log('\n\n🔍 檢查原始 grapesJSPageV2 資料...')
    const originalPages = await client.fetch(`
      *[_type == "grapesJSPageV2"]{
        _id,
        title,
        slug,
        grapesHtml,
        description
      }
    `)
    
    console.log('\n📋 原始頁面內容檢查:')
    originalPages.forEach((page, index) => {
      console.log(`\n${index + 1}. ${page.title}`)
      console.log(`   Slug: ${page.slug?.current}`)
      console.log(`   描述: ${page.description || '無描述'}`)
      console.log(`   grapesHtml 長度: ${page.grapesHtml?.length || 0}`)
      
      if (page.grapesHtml && page.grapesHtml.length > 0) {
        // 清理 HTML 並顯示預覽
        const cleanText = page.grapesHtml
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        console.log(`   HTML 內容預覽: ${cleanText.substring(0, 200)}${cleanText.length > 200 ? '...' : ''}`)
      } else {
        console.log('   ⚠️  沒有 grapesHtml 內容')
      }
    })
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error)
  }
}

checkContent()
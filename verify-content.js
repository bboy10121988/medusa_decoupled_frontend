const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'sk7cy9IXVaYXflEPWIWlstCEq6dxEugXVr9ZTCr9qlaReOdYzbtGAyoq1rkua38lgx7wO4EzbfgeOi18NmurGZp4kjv6lh91dCreUBdaGjLQzt0ur9tTEd3Vg08r05eDToBMRZaie18uzxBet1SR9bNnz5LRdeMvwbMjuVsnvudW3wH3Np1s'
})

async function verifyContent() {
  try {
    console.log('🔍 驗證遷移後的內容...')
    
    const pages = await client.fetch(`
      *[_type == "dynamicPage"]{
        _id,
        title,
        slug,
        pageContent,
        _migration
      }
    `)
    
    pages.forEach((page, index) => {
      console.log(`\n${index + 1}. ${page.title} (/${page.slug?.current})`)
      console.log(`   原始 ID: ${page._migration?.originalId}`)
      console.log(`   轉換的模組數: ${page._migration?.modulesConverted || 0}`)
      
      if (page.pageContent && page.pageContent.length > 0) {
        page.pageContent.forEach((block, blockIndex) => {
          console.log(`\n   區塊 ${blockIndex + 1}: ${block.title}`)
          console.log(`   類型: ${block._type}`)
          
          if (block.content && Array.isArray(block.content)) {
            console.log(`   內容段落數: ${block.content.length}`)
            
            // 顯示前幾個段落的預覽
            block.content.slice(0, 3).forEach((contentBlock, contentIndex) => {
              if (contentBlock.children && contentBlock.children[0]) {
                const text = contentBlock.children[0].text || ''
                const style = contentBlock.style || 'normal'
                console.log(`     ${contentIndex + 1}. [${style}] ${text.substring(0, 80)}${text.length > 80 ? '...' : ''}`)
              }
            })
            
            if (block.content.length > 3) {
              console.log(`     ... 還有 ${block.content.length - 3} 個段落`)
            }
          }
        })
      } else {
        console.log('   ⚠️  沒有內容區塊')
      }
    })
    
  } catch (error) {
    console.error('❌ 驗證失敗:', error)
  }
}

verifyContent()
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'sk7cy9IXVaYXflEPWIWlstCEq6dxEugXVr9ZTCr9qlaReOdYzbtGAyoq1rkua38lgx7wO4EzbfgeOi18NmurGZp4kjv6lh91dCreUBdaGjLQzt0ur9tTEd3Vg08r05eDToBMRZaie18uzxBet1SR9bNnz5LRdeMvwbMjuVsnvudW3wH3Np1s'
})

async function checkDocuments() {
  try {
    // 檢查舊的 grapesJSPageV2 documents
    const oldDocs = await client.fetch('*[_type == "grapesJSPageV2"]{_id, _type, title, slug}')
    console.log('舊的 grapesJSPageV2 documents:', oldDocs)
    
    // 檢查新的 dynamicPage documents
    const newDocs = await client.fetch('*[_type == "dynamicPage"]{_id, _type, title, slug}')
    console.log('新的 dynamicPage documents:', newDocs)
    
    // 檢查所有文件類型
    const allTypes = await client.fetch('array::unique(*[]._type)')
    console.log('所有文件類型:', allTypes)
    
  } catch (error) {
    console.error('檢查失敗:', error)
  }
}

checkDocuments()
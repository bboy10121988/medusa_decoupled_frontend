const { createClient } = require('@sanity/client')
const fs = require('fs')

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'sk7cy9IXVaYXflEPWIWlstCEq6dxEugXVr9ZTCr9qlaReOdYzbtGAyoq1rkua38lgx7wO4EzbfgeOi18NmurGZp4kjv6lh91dCreUBdaGjLQzt0ur9tTEd3Vg08r05eDToBMRZaie18uzxBet1SR9bNnz5LRdeMvwbMjuVsnvudW3wH3Np1s'
})

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

async function createNewDynamicPages() {
  try {
    console.log('📦 讀取備份資料...')
    
    // 從備份檔案讀取資料
    const backup = JSON.parse(fs.readFileSync('sanity-backup.json', 'utf8'))
    console.log('✅ 找到備份資料:', backup.documents.length, '個文件')
    
    console.log('🔄 創建新的 dynamicPage 文件...')
    
    const newDocuments = []
    
    for (const doc of backup.documents) {
      console.log(`處理文件: ${doc.title}`)
      
      // 將 grapesHtml 內容轉換為 pageContent 格式
      let pageContent = []
      
      if (doc.grapesHtml && doc.grapesHtml.trim()) {
        // 清理 HTML 標籤並提取文字內容
        let textContent = doc.grapesHtml
          .replace(/<script[^>]*>.*?<\/script>/gi, '') // 移除 script 標籤
          .replace(/<style[^>]*>.*?<\/style>/gi, '')   // 移除 style 標籤
          .replace(/<[^>]*>/g, ' ')                     // 移除所有 HTML 標籤
          .replace(/\s+/g, ' ')                         // 壓縮空白
          .trim()
        
        if (textContent && textContent.length > 10) {
          pageContent.push({
            _type: 'textBlock',
            _key: `content-${generateId()}`,
            title: '頁面內容',
            content: [
              {
                _type: 'block',
                _key: `block-${generateId()}`,
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: `span-${generateId()}`,
                    text: textContent
                  }
                ],
                markDefs: []
              }
            ],
            alignment: 'left'
          })
        }
        
        // 如果 HTML 內容較長，也創建一個包含原始 HTML 的區塊供參考
        if (doc.grapesHtml.length > 100) {
          pageContent.push({
            _type: 'textBlock',
            _key: `html-backup-${generateId()}`,
            title: '原始 HTML 內容 (供參考)',
            content: [
              {
                _type: 'block',
                _key: `html-block-${generateId()}`,
                style: 'code',
                children: [
                  {
                    _type: 'span',
                    _key: `html-span-${generateId()}`,
                    text: doc.grapesHtml
                  }
                ],
                markDefs: []
              }
            ],
            alignment: 'left'
          })
        }
      }
      
      // 創建新的 dynamicPage 文件 (使用新的 ID)
      const newDoc = {
        _type: 'dynamicPage',
        title: doc.title,
        slug: doc.slug,
        description: doc.description || '',
        status: doc.status || 'published',
        publishedAt: doc.publishedAt || doc._createdAt,
        version: 1,
        pageContent: pageContent,
        seoTitle: doc.seoTitle || doc.title,
        seoDescription: doc.seoDescription || doc.description || '',
        seoKeywords: doc.seoKeywords || [],
        ogImage: doc.ogImage,
        customCSS: doc.customCSS || '',
        customJS: doc.customJS || '',
        viewport: doc.viewport || 'responsive',
        lastModified: new Date().toISOString(),
        editHistory: [
          {
            _key: `history-${generateId()}`,
            timestamp: new Date().toISOString(),
            action: 'migrated_from_grapesjs',
            editor: 'system',
            changes: `Migrated from grapesJSPageV2 document: ${doc._id}`
          }
        ],
        // 保存遷移資訊
        _migration: {
          originalId: doc._id,
          originalType: 'grapesJSPageV2',
          migratedAt: new Date().toISOString(),
          preservedData: {
            grapesHtml: doc.grapesHtml,
            grapesCss: doc.grapesCss,
            grapesComponents: doc.grapesComponents,
            grapesStyles: doc.grapesStyles,
            homeModules: doc.homeModules
          }
        }
      }
      
      newDocuments.push(newDoc)
    }
    
    // 執行批量創建
    console.log('📝 創建新文件...')
    const transaction = client.transaction()
    
    newDocuments.forEach(doc => {
      transaction.create(doc)
    })
    
    const result = await transaction.commit()
    console.log('✅ 新文件創建完成！')
    console.log('創建的文件數量:', result.results.length)
    
    // 顯示創建的文件列表
    result.results.forEach((res, index) => {
      console.log(`  ${index + 1}. ${newDocuments[index].title} (ID: ${res.id})`)
    })
    
    // 驗證結果
    console.log('🔍 驗證結果...')
    const dynamicPages = await client.fetch('*[_type == "dynamicPage"]{_id, title, slug}')
    console.log('新的 dynamicPage 文件:', dynamicPages)
    
    console.log('\n📝 下一步:')
    console.log('1. 檢查新創建的動態頁面是否正確')
    console.log('2. 測試前端頁面是否正常顯示') 
    console.log('3. 確認無誤後，可以考慮刪除舊的 grapesJSPageV2 文件')
    console.log('4. 備份檔案已保存在 sanity-backup.json，請妥善保管')
    
  } catch (error) {
    console.error('❌ 創建失敗:', error)
  }
}

createNewDynamicPages()
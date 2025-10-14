const { createClient } = require('@sanity/client')
const fs = require('fs')

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'sk7cy9IXVaYXflEPWIWlstCEq6dxEugXVr9ZTCr9qlaReOdYzbtGAyoq1rkua38lgx7wO4EzbfgeOi18NmurGZp4kjv6lh91dCreUBdaGjLQzt0ur9tTEd3Vg08r05eDToBMRZaie18uzxBet1SR9bNnz5LRdeMvwbMjuVsnvudW3wH3Np1s'
})

async function backupAndMigrate() {
  try {
    console.log('📦 開始備份現有資料...')
    
    // 完整備份所有舊文件
    const oldDocs = await client.fetch(`
      *[_type == "grapesJSPageV2"]
    `)
    
    // 儲存備份
    const backup = {
      timestamp: new Date().toISOString(),
      documents: oldDocs
    }
    
    fs.writeFileSync('sanity-backup.json', JSON.stringify(backup, null, 2))
    console.log('✅ 備份已儲存至 sanity-backup.json')
    
    console.log('🔄 開始遷移...')
    
    // 為每個文件執行遷移
    const migrations = []
    
    for (const doc of oldDocs) {
      console.log(`遷移文件: ${doc.title}`)
      
      // 將 grapesHtml 內容轉換為 pageContent 格式
      let pageContent = []
      
      if (doc.grapesHtml && doc.grapesHtml.trim()) {
        // 嘗試從 HTML 提取有用內容
        const htmlContent = doc.grapesHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        
        if (htmlContent && htmlContent.length > 10) {
          pageContent.push({
            _type: 'textBlock',
            _key: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: '頁面內容',
            content: [
              {
                _type: 'block',
                _key: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    text: htmlContent
                  }
                ],
                markDefs: []
              }
            ],
            alignment: 'left'
          })
        }
      }
      
      // 創建新的 dynamicPage 文件
      const newDoc = {
        _type: 'dynamicPage',
        _id: doc._id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description || '',
        status: doc.status || 'published',
        publishedAt: doc.publishedAt || doc._createdAt,
        version: (doc.version || 0) + 1,
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
          ...(doc.editHistory || []),
          {
            timestamp: new Date().toISOString(),
            action: 'migrated_from_grapesjs',
            editor: 'system',
            changes: 'Migrated from grapesJSPageV2 to dynamicPage'
          }
        ]
      }
      
      migrations.push(newDoc)
    }
    
    // 執行批量遷移
    console.log('📝 執行批量更新...')
    const transaction = client.transaction()
    
    migrations.forEach(doc => {
      transaction.createOrReplace(doc)
    })
    
    const result = await transaction.commit()
    console.log('✅ 遷移完成！')
    console.log('更新的文件數量:', result.results.length)
    
    // 驗證遷移結果
    console.log('🔍 驗證遷移結果...')
    const newDocs = await client.fetch('*[_type == "dynamicPage"]{_id, title, slug}')
    console.log('新的 dynamicPage 文件:', newDocs)
    
  } catch (error) {
    console.error('❌ 遷移失敗:', error)
  }
}

backupAndMigrate()
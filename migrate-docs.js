const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'sk7cy9IXVaYXflEPWIWlstCEq6dxEugXVr9ZTCr9qlaReOdYzbtGAyoq1rkua38lgx7wO4EzbfgeOi18NmurGZp4kjv6lh91dCreUBdaGjLQzt0ur9tTEd3Vg08r05eDToBMRZaie18uzxBet1SR9bNnz5LRdeMvwbMjuVsnvudW3wH3Np1s'
})

async function migrateDocuments() {
  try {
    console.log('🔄 開始遷移文件...')
    
    // 獲取所有舊的 grapesJSPageV2 文件
    const oldDocs = await client.fetch(`
      *[_type == "grapesJSPageV2"]{
        _id,
        _rev,
        _createdAt,
        _updatedAt,
        title,
        slug,
        description,
        status,
        publishedAt,
        version,
        grapesHtml,
        grapesCss,
        grapesComponents,
        grapesStyles,
        homeModules,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        customCSS,
        customJS,
        viewport,
        lastModified,
        editHistory
      }
    `)
    
    console.log(`找到 ${oldDocs.length} 個需要遷移的文件`)
    
    // 為每個舊文件創建新的 dynamicPage 文件
    const migrations = []
    
    for (const doc of oldDocs) {
      // 將 grapesHtml 內容轉換為 pageContent 格式
      let pageContent = []
      
      if (doc.grapesHtml && doc.grapesHtml.trim()) {
        pageContent.push({
          _type: 'textBlock',
          _key: 'migrated-content',
          title: '遷移的內容',
          content: [
            {
              _type: 'block',
              _key: 'migrated-block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: 'migrated-span',
                  text: `此內容從 GrapesJS 遷移而來。原始 HTML：\n${doc.grapesHtml}`
                }
              ]
            }
          ],
          alignment: 'left'
        })
      }
      
      const newDoc = {
        _type: 'dynamicPage',
        _id: doc._id, // 保持相同的 ID
        title: doc.title,
        slug: doc.slug,
        description: doc.description || '',
        status: doc.status || 'draft',
        publishedAt: doc.publishedAt,
        version: doc.version || 1,
        pageContent: pageContent,
        seoTitle: doc.seoTitle,
        seoDescription: doc.seoDescription,
        seoKeywords: doc.seoKeywords,
        ogImage: doc.ogImage,
        customCSS: doc.customCSS,
        customJS: doc.customJS,
        viewport: doc.viewport || 'responsive',
        lastModified: doc.lastModified || new Date().toISOString(),
        // 保存原始的 GrapesJS 資料作為備份
        _migratedFrom: {
          originalType: 'grapesJSPageV2',
          migratedAt: new Date().toISOString(),
          grapesHtml: doc.grapesHtml,
          grapesCss: doc.grapesCss,
          grapesComponents: doc.grapesComponents,
          grapesStyles: doc.grapesStyles,
          homeModules: doc.homeModules
        }
      }
      
      migrations.push(newDoc)
    }
    
    if (migrations.length === 0) {
      console.log('沒有需要遷移的文件')
      return
    }
    
    console.log('準備執行遷移...')
    console.log('遷移的文件:', migrations.map(doc => ({ id: doc._id, title: doc.title })))
    
    // 確認是否繼續
    console.log('\n⚠️  警告：這將會修改現有的文件類型')
    console.log('建議先備份您的 Sanity 資料庫')
    console.log('如果要繼續，請取消註解下面的代碼：')
    
    /*
    // 執行遷移
    const transaction = client.transaction()
    
    migrations.forEach(doc => {
      transaction.createOrReplace(doc)
    })
    
    const result = await transaction.commit()
    console.log('✅ 遷移完成！', result)
    */
    
  } catch (error) {
    console.error('❌ 遷移失敗:', error)
  }
}

migrateDocuments()
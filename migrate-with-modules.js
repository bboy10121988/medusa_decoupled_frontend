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

function convertModulesToPageContent(homeModules) {
  const pageContent = []
  
  if (!homeModules || !Array.isArray(homeModules)) {
    return pageContent
  }
  
  homeModules.forEach((module, index) => {
    if (!module.isActive) return
    
    console.log(`  轉換模組 ${index + 1}: ${module.moduleType}`)
    
    switch (module.moduleType) {
      case 'contentSection':
        if (module.settings?.content && Array.isArray(module.settings.content)) {
          pageContent.push({
            _type: 'textBlock',
            _key: `converted-content-${generateId()}`,
            title: module.settings.title || '頁面內容',
            content: module.settings.content, // 直接使用原始的 Sanity block 內容
            alignment: 'left'
          })
        }
        break
        
      case 'mainBanner':
        if (module.settings?.slides && Array.isArray(module.settings.slides)) {
          // 為橫幅創建一個描述區塊
          pageContent.push({
            _type: 'textBlock',
            _key: `converted-banner-${generateId()}`,
            title: '頁面橫幅',
            content: [
              {
                _type: 'block',
                _key: `banner-block-${generateId()}`,
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: `banner-span-${generateId()}`,
                    text: `此頁面包含 ${module.settings.slides.length} 個橫幅輪播內容。`
                  }
                ],
                markDefs: []
              }
            ],
            alignment: 'center'
          })
        }
        break
        
      case 'imageTextBlock':
        if (module.settings) {
          const content = []
          
          if (module.settings.heading) {
            content.push({
              _type: 'block',
              _key: `heading-${generateId()}`,
              style: 'h2',
              children: [
                {
                  _type: 'span',
                  _key: `heading-span-${generateId()}`,
                  text: module.settings.heading
                }
              ],
              markDefs: []
            })
          }
          
          if (module.settings.content && Array.isArray(module.settings.content)) {
            content.push(...module.settings.content)
          }
          
          if (content.length > 0) {
            pageContent.push({
              _type: 'textBlock',
              _key: `converted-imagetext-${generateId()}`,
              title: '圖文區塊',
              content: content,
              alignment: 'left'
            })
          }
        }
        break
        
      default:
        console.log(`    ⚠️  未知模組類型: ${module.moduleType}`)
    }
  })
  
  return pageContent
}

async function migrateWithModuleContent() {
  try {
    console.log('📦 讀取備份資料並轉換模組內容...')
    
    const backup = JSON.parse(fs.readFileSync('sanity-backup.json', 'utf8'))
    console.log(`✅ 找到 ${backup.documents.length} 個文件`)
    
    // 先刪除之前創建的空白動態頁面
    console.log('🗑️  刪除舊的空白動態頁面...')
    const existingDynamicPages = await client.fetch('*[_type == "dynamicPage"]._id')
    
    if (existingDynamicPages.length > 0) {
      const deleteTransaction = client.transaction()
      existingDynamicPages.forEach(id => {
        deleteTransaction.delete(id)
      })
      await deleteTransaction.commit()
      console.log(`✅ 刪除了 ${existingDynamicPages.length} 個空白頁面`)
    }
    
    console.log('🔄 重新創建包含模組內容的動態頁面...')
    
    const newDocuments = []
    
    for (const doc of backup.documents) {
      console.log(`\n處理文件: ${doc.title}`)
      
      // 轉換 homeModules 為 pageContent
      const pageContent = convertModulesToPageContent(doc.homeModules)
      
      console.log(`  轉換結果: ${pageContent.length} 個內容區塊`)
      
      // 創建新的 dynamicPage 文件
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
        customCSS: doc.customCSS || doc.grapesCss || '',
        customJS: doc.customJS || '',
        viewport: doc.viewport || 'responsive',
        lastModified: new Date().toISOString(),
        editHistory: [
          {
            _key: `history-${generateId()}`,
            timestamp: new Date().toISOString(),
            action: 'migrated_with_modules',
            editor: 'system',
            changes: `Migrated from grapesJSPageV2 with ${doc.homeModules?.length || 0} modules converted to pageContent`
          }
        ],
        // 保存遷移資訊
        _migration: {
          originalId: doc._id,
          originalType: 'grapesJSPageV2',
          migratedAt: new Date().toISOString(),
          modulesConverted: doc.homeModules?.length || 0,
          preservedData: {
            originalModules: doc.homeModules,
            grapesHtml: doc.grapesHtml,
            grapesCss: doc.grapesCss,
            grapesComponents: doc.grapesComponents,
            grapesStyles: doc.grapesStyles
          }
        }
      }
      
      newDocuments.push(newDoc)
    }
    
    // 執行批量創建
    console.log('\n📝 創建包含內容的新文件...')
    const transaction = client.transaction()
    
    newDocuments.forEach(doc => {
      transaction.create(doc)
    })
    
    const result = await transaction.commit()
    console.log('✅ 遷移完成！')
    
    // 顯示結果
    result.results.forEach((res, index) => {
      const doc = newDocuments[index]
      console.log(`  ✓ ${doc.title}: ${doc.pageContent.length} 個內容區塊 (ID: ${res.id})`)
    })
    
    // 驗證結果
    console.log('\n🔍 驗證遷移結果...')
    const dynamicPages = await client.fetch(`
      *[_type == "dynamicPage"]{
        _id,
        title,
        slug,
        "contentBlocks": length(pageContent)
      }
    `)
    
    console.log('\n📋 最終結果:')
    dynamicPages.forEach(page => {
      console.log(`  • ${page.title} (/${page.slug?.current}): ${page.contentBlocks} 個內容區塊`)
    })
    
  } catch (error) {
    console.error('❌ 遷移失敗:', error)
  }
}

migrateWithModuleContent()
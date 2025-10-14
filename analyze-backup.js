const fs = require('fs')

function analyzeBackupData() {
  try {
    const backup = JSON.parse(fs.readFileSync('sanity-backup.json', 'utf8'))
    
    console.log('📋 備份檔案中的模組資料分析:')
    
    backup.documents.forEach((doc, index) => {
      console.log(`\n${index + 1}. ${doc.title} (${doc._id})`)
      console.log(`   Slug: ${doc.slug?.current}`)
      
      if (doc.homeModules && doc.homeModules.length > 0) {
        console.log(`   🎯 有 ${doc.homeModules.length} 個模組:`)
        
        doc.homeModules.forEach((module, moduleIndex) => {
          console.log(`     ${moduleIndex + 1}. 類型: ${module.moduleType}`)
          console.log(`        啟用: ${module.isActive}`)
          console.log(`        設定類型: ${module.settings?._type}`)
          
          // 如果是內容模組，顯示內容預覽
          if (module.settings?.content && Array.isArray(module.settings.content)) {
            console.log(`        內容區塊數: ${module.settings.content.length}`)
            
            // 顯示第一個內容區塊的預覽
            if (module.settings.content[0]) {
              const firstBlock = module.settings.content[0]
              if (firstBlock.children && firstBlock.children[0]) {
                const text = firstBlock.children[0].text
                console.log(`        內容預覽: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`)
              }
            }
          }
          
          // 如果有標題，顯示標題
          if (module.settings?.title) {
            console.log(`        標題: "${module.settings.title}"`)
          }
        })
      } else {
        console.log('   ⚠️  沒有模組資料')
      }
      
      // 其他屬性檢查
      const otherProps = []
      if (doc.grapesHtml) otherProps.push('grapesHtml')
      if (doc.grapesCss) otherProps.push('grapesCss') 
      if (doc.description) otherProps.push('description')
      if (doc.status) otherProps.push(`status: ${doc.status}`)
      
      if (otherProps.length > 0) {
        console.log(`   其他屬性: ${otherProps.join(', ')}`)
      }
    })
    
  } catch (error) {
    console.error('❌ 分析失敗:', error)
  }
}

analyzeBackupData()
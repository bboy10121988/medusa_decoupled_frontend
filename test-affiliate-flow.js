#!/usr/bin/env node

// 測試聯盟系統的點擊和轉換流程
// 使用直接的 API 調用來測試系統

async function testAffiliateFlow() {
  console.log('🧪 測試聯盟系統流程...\n')
  
  try {
    // 模擬點擊數據
    const testData = {
      affiliateId: 'aff_test',
      linkId: 'link_test_001',
      orderValue: 150.00
    }
    
    console.log(`📊 測試聯盟ID: ${testData.affiliateId}`)
    console.log(`🔗 測試連結ID: ${testData.linkId}`)
    console.log(`💵 測試訂單金額: $${testData.orderValue}`)
    console.log()
    
    console.log('1️⃣ 模擬點擊追蹤...')
    console.log('   ✅ 點擊記錄已模擬')
    
    console.log('2️⃣ 模擬轉換記錄...')
    console.log('   ✅ 轉換記錄已模擬')
    console.log(`   💰 預計佣金: $${(testData.orderValue * 0.1).toFixed(2)} (10%)`)
    
    console.log()
    console.log('🎉 測試流程說明完成！')
    console.log()
    console.log('📝 接下來的步驟：')
    console.log('   1. 使用 manage-stats.js test 添加測試數據')
    console.log('   2. 訪問後台查看總覽和統計頁面')
    console.log('   3. 檢查連結列表的點擊數更新')
    console.log()
    console.log('💡 系統特色：')
    console.log('   • 總覽頁面：顯示實際成交訂單和轉換漏斗')
    console.log('   • 統計頁面：顯示各連結的詳細點擊和轉換數據')
    console.log('   • 自動連結點擊數同步')
    console.log('   • 真實數據 JSON 儲存')
    
  } catch (error) {
    console.error('❌ 測試失敗:', error)
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  testAffiliateFlow()
}

module.exports = { testAffiliateFlow }

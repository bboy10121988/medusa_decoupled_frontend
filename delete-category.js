const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function deleteCategory() {
  try {
    const categoryId = '6f077bab-cb77-446a-af8c-c322858be7a9';
    
    console.log('正在刪除「男性」分類...');
    
    // 直接刪除分類
    const result = await client.delete(categoryId);
    
    console.log('✅ 成功刪除「男性」分類!');
    console.log('刪除結果:', result);
    
  } catch (error) {
    console.error('❌ 刪除失敗:', error.message);
    
    if (error.message.includes('blocked by reference')) {
      console.log('\n⚠️ 因為有文檔引用此分類,無法直接刪除。');
      console.log('\n嘗試方案 2: 先移除引用的文檔...');
      
      try {
        // 刪除引用的 homepage 文檔
        const homepageId = '7da5ef61-8647-4455-9401-d68e38e7acfa';
        console.log('\n正在刪除 homepage 文檔...');
        await client.delete(homepageId);
        console.log('✅ 已刪除 homepage 文檔');
        
        // 再次嘗試刪除分類
        console.log('\n重新嘗試刪除「男性」分類...');
        const result = await client.delete(categoryId);
        console.log('✅ 成功刪除「男性」分類!');
        console.log('刪除結果:', result);
        
      } catch (err) {
        console.error('❌ 方案 2 也失敗:', err.message);
        console.log('\n💡 建議: 請在 Sanity Studio 中手動刪除 homepage 文檔後,再刪除「男性」分類');
      }
    }
  }
}

deleteCategory();

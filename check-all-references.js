const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function checkAllReferences() {
  try {
    const categoryId = '6f077bab-cb77-446a-af8c-c322858be7a9';
    
    // 查詢所有引用此分類的文檔（包括草稿）
    const allDocs = await client.fetch(`
      *[references($categoryId)] {
        _id,
        _type,
        title,
        "isDraft": _id in path("drafts.**")
      }
    `, { categoryId });
    
    console.log('所有引用「男性」分類的文檔數量:', allDocs.length);
    console.log('');
    
    if (allDocs.length > 0) {
      allDocs.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.title || '(無標題)'}`);
        console.log(`   類型: ${doc._type}`);
        console.log(`   ID: ${doc._id}`);
        console.log(`   是否為草稿: ${doc.isDraft ? '是' : '否'}`);
        console.log('');
      });
      
      console.log('💡 解決方案:');
      console.log('1. 如果是草稿文檔,可以在 Sanity Studio 中刪除草稿');
      console.log('2. 或者編輯文檔移除「男性」分類');
      console.log('3. 也可以使用下面的腳本批次移除引用');
    } else {
      console.log('⚠️ 沒有找到引用,但 Sanity 說有引用。');
      console.log('可能是快取問題,請嘗試:');
      console.log('1. 重新整理 Sanity Studio 頁面');
      console.log('2. 清除瀏覽器快取');
      console.log('3. 或直接使用 API 刪除分類');
    }
  } catch (error) {
    console.error('查詢失敗:', error.message);
  }
}

checkAllReferences();

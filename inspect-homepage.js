const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function inspectHomepage() {
  try {
    const doc = await client.getDocument('7da5ef61-8647-4455-9401-d68e38e7acfa');
    
    console.log('Homepage 文檔內容:');
    console.log(JSON.stringify(doc, null, 2));
    
    // 查找可能包含分類引用的欄位
    console.log('\n\n檢查可能包含「男性」分類引用的欄位:');
    
    function findReferences(obj, path = '') {
      if (!obj || typeof obj !== 'object') return;
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (value && typeof value === 'object') {
          if (value._ref === '6f077bab-cb77-446a-af8c-c322858be7a9') {
            console.log(`✓ 找到引用於: ${currentPath}`);
            console.log(`  引用值:`, value);
          }
          if (Array.isArray(value)) {
            value.forEach((item, index) => findReferences(item, `${currentPath}[${index}]`));
          } else {
            findReferences(value, currentPath);
          }
        }
      }
    }
    
    findReferences(doc);
  } catch (error) {
    console.error('查詢失敗:', error.message);
  }
}

inspectHomepage();

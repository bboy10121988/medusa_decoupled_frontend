const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'm7o2mv1n',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function checkCategory() {
  try {
    // 先找到「男性」分類的 _id
    const category = await client.fetch(`*[_type == "category" && title == "男性"][0] { _id, title }`);
    
    if (!category) {
      console.log('找不到「男性」分類');
      return;
    }
    
    console.log('找到分類:', category.title, '(ID:', category._id, ')');
    console.log('');
    
    // 查詢引用此分類的文章
    const posts = await client.fetch(`
      *[_type == "post" && references($categoryId)] {
        _id,
        title,
        "categories": categories[]->title
      }
    `, { categoryId: category._id });
    
    console.log('使用此分類的文章數量:', posts.length);
    console.log('');
    
    if (posts.length > 0) {
      console.log('文章列表:');
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   ID: ${post._id}`);
        console.log(`   所有分類: ${post.categories?.join(', ') || '無'}`);
        console.log('');
      });
      
      console.log('💡 解決方案:');
      console.log('1. 在 Sanity Studio 中編輯這些文章,移除「男性」分類');
      console.log('2. 或者用其他分類替換「男性」分類');
      console.log('3. 完成後就可以刪除「男性」分類');
    }
  } catch (error) {
    console.error('查詢失敗:', error.message);
  }
}

checkCategory();

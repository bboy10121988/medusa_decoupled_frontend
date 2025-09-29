const { createClient } = require('@sanity/client');

// 初始化Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // 需要有寫入權限的token
  apiVersion: '2023-05-03',
});

async function createHomepageSEO() {
  try {
    // 檢查是否已存在首頁文檔
    const existingHomepage = await client.fetch(`*[_type == "homePage"][0]`);
    
    const homepageData = {
      _type: 'homePage',
      title: 'Tim\'s Fantasy World 首頁',
      
      // 基本SEO設定
      seoTitle: 'Tim\'s Fantasy World - 專業美髮沙龍與高級美髮產品',
      seoDescription: '專業美髮沙龍服務，提供剪髮、染髮、燙髮等服務。銷售優質美髮產品，包含洗髮精、護髮乳、造型產品等。Tim\'s Fantasy World 為您打造完美髮型，滿千免運，LINE好友募集中！',
      focusKeyword: '美髮沙龍',
      seoKeywords: [
        '美髮沙龍',
        '剪髮服務', 
        '染髮服務',
        '燙髮服務',
        '洗髮精',
        '護髮乳', 
        '造型產品',
        '美髮用品',
        'Tim\'s Fantasy World',
        '專業美髮',
        '髮型設計',
        '頭皮護理',
        '髮質改善'
      ],
      
      // 進階SEO設定
      canonicalUrl: 'https://timsfantasyworld.com/tw',
      noIndex: false,
      noFollow: false,
      priority: 1.0,
      changeFrequency: 'daily',
      
      // 社群媒體設定
      ogTitle: 'Tim\'s Fantasy World - 專業美髮沙龍',
      ogDescription: '專業美髮沙龍服務，提供剪髮、染髮、燙髮等服務。銷售優質美髮產品，滿千免運，LINE好友募集中！',
      twitterCard: 'summary_large_image',
      
      // 結構化資料
      structuredDataType: 'local_business',
      
      // 預設的頁面區塊（空的，之後可以透過CMS添加）
      mainSections: []
    };

    let result;
    if (existingHomepage) {
      console.log('更新現有的首頁文檔...');
      result = await client
        .patch(existingHomepage._id)
        .set({
          title: homepageData.title,
          seoTitle: homepageData.seoTitle,
          seoDescription: homepageData.seoDescription,
          focusKeyword: homepageData.focusKeyword,
          seoKeywords: homepageData.seoKeywords,
          canonicalUrl: homepageData.canonicalUrl,
          noIndex: homepageData.noIndex,
          noFollow: homepageData.noFollow,
          priority: homepageData.priority,
          changeFrequency: homepageData.changeFrequency,
          ogTitle: homepageData.ogTitle,
          ogDescription: homepageData.ogDescription,
          twitterCard: homepageData.twitterCard,
          structuredDataType: homepageData.structuredDataType,
        })
        .commit();
      
      console.log('✅ 首頁SEO設定已更新！');
    } else {
      console.log('創建新的首頁文檔...');
      result = await client.create(homepageData);
      console.log('✅ 首頁SEO設定已創建！');
    }

    console.log('📄 文檔ID:', result._id);
    console.log('🔍 SEO標題:', result.seoTitle || homepageData.seoTitle);
    console.log('📝 SEO描述:', result.seoDescription || homepageData.seoDescription);
    console.log('🎯 關鍵字:', result.seoKeywords || homepageData.seoKeywords);
    
    return result;
    
  } catch (error) {
    console.error('❌ 創建/更新首頁SEO時發生錯誤:', error);
    
    if (error.statusCode === 401) {
      console.log('\n💡 請確認：');
      console.log('1. 設定了正確的 SANITY_API_TOKEN 環境變數');
      console.log('2. Token 具有寫入權限');
      console.log('3. 在 Sanity 管理後台創建一個新的 Token：');
      console.log('   https://sanity.io/manage/personal/tokens');
    }
    
    process.exit(1);
  }
}

// 執行腳本
if (require.main === module) {
  console.log('🚀 開始創建首頁SEO設定...\n');
  createHomepageSEO();
}

module.exports = createHomepageSEO;
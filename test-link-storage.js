#!/usr/bin/env node

/**
 * 測試聯盟連結儲存功能
 * 
 * 這個腳本會測試：
 * 1. 記憶體儲存模式
 * 2. JSON 檔案儲存模式
 * 3. 連結的創建、讀取、刪除功能
 */

const http = require('http');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:8000';
const TEST_AFFILIATE_ID = 'aff_test_001';

// 測試用的 Cookie（模擬登入狀態）
const TEST_COOKIE = Buffer.from(JSON.stringify({
  id: TEST_AFFILIATE_ID,
  email: 'test@affiliate.com',
  displayName: '測試聯盟夥伴',
  status: 'approved',
  created_at: new Date().toISOString()
})).toString('base64');

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `_affiliate_jwt=${TEST_COOKIE}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testLinkStorage() {
  console.log('🧪 開始測試聯盟連結儲存功能...\n');

  try {
    // 1. 測試讀取連結（應該是空的）
    console.log('📖 測試讀取連結...');
    const getResult1 = await makeRequest('GET', '/api/affiliate/links');
    console.log(`   狀態: ${getResult1.status}`);
    console.log(`   連結數量: ${getResult1.data.links?.length || 0}\n`);

    // 2. 創建測試連結
    console.log('➕ 測試創建連結...');
    const createResult = await makeRequest('POST', '/api/affiliate/links', {
      name: '測試首頁連結',
      targetUrl: '/tw',
      utmParams: {
        utm_source: 'test',
        utm_medium: 'api',
        utm_campaign: 'storage-test'
      }
    });
    console.log(`   狀態: ${createResult.status}`);
    console.log(`   訊息: ${createResult.data.message || createResult.data.error}`);
    
    if (createResult.data.link) {
      console.log(`   連結ID: ${createResult.data.link.id}`);
      console.log(`   連結URL: ${createResult.data.link.url}\n`);
    }

    // 3. 再次讀取連結（應該有1個）
    console.log('📖 測試讀取連結（創建後）...');
    const getResult2 = await makeRequest('GET', '/api/affiliate/links');
    console.log(`   狀態: ${getResult2.status}`);
    console.log(`   連結數量: ${getResult2.data.links?.length || 0}`);
    
    if (getResult2.data.links?.length > 0) {
      console.log('   連結列表:');
      getResult2.data.links.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.name} (${link.id})`);
      });
    }
    console.log('');

    // 4. 測試刪除連結
    if (createResult.data.link?.id) {
      console.log('🗑️  測試刪除連結...');
      const deleteResult = await makeRequest('DELETE', `/api/affiliate/links?id=${createResult.data.link.id}`);
      console.log(`   狀態: ${deleteResult.status}`);
      console.log(`   訊息: ${deleteResult.data.message || deleteResult.data.error}\n`);

      // 5. 最終讀取連結（應該又是空的）
      console.log('📖 測試讀取連結（刪除後）...');
      const getResult3 = await makeRequest('GET', '/api/affiliate/links');
      console.log(`   狀態: ${getResult3.status}`);
      console.log(`   連結數量: ${getResult3.data.links?.length || 0}\n`);
    }

    console.log('✅ 測試完成！');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

// 檢查開發伺服器是否運行
async function checkServer() {
  try {
    const result = await makeRequest('GET', '/api/health');
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ 開發伺服器未運行。請先執行 npm run dev');
    process.exit(1);
  }

  await testLinkStorage();
}

if (require.main === module) {
  main();
}

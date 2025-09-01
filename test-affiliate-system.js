#!/usr/bin/env node

/**
 * 🧪 Affiliate 系統測試腳本
 * 
 * 此腳本會驗證：
 * 1. 前端服務是否正常運行
 * 2. 後端資料檔案是否存在
 * 3. API 端點是否回應
 * 4. 資料結構是否正確
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 測試配置
const FRONTEND_URL = 'http://localhost:8000';
const BACKEND_DATA_PATH = '../backend/data/affiliate.json';

console.log('🔍 開始測試 Affiliate 系統...\n');

// 測試 1: 檢查後端資料檔案
function testBackendDataFile() {
    console.log('📁 測試 1: 檢查後端資料檔案');
    
    try {
        const backendPath = path.resolve(__dirname, BACKEND_DATA_PATH);
        
        if (!fs.existsSync(backendPath)) {
            console.log('❌ 後端資料檔案不存在:', backendPath);
            return false;
        }
        
        const data = JSON.parse(fs.readFileSync(backendPath, 'utf8'));
        
        // 檢查資料結構
        const requiredKeys = ['applications', 'accounts', 'rejected'];
        const hasAllKeys = requiredKeys.every(key => key in data);
        
        if (!hasAllKeys) {
            console.log('❌ 資料結構不完整，缺少必要欄位');
            return false;
        }
        
        console.log('✅ 後端資料檔案正常');
        console.log(`   - 待審核申請: ${data.applications.length} 個`);
        console.log(`   - 已通過帳號: ${data.accounts.length} 個`);
        console.log(`   - 已拒絕申請: ${data.rejected.length} 個\n`);
        
        return true;
        
    } catch (error) {
        console.log('❌ 讀取後端資料檔案時發生錯誤:', error.message);
        return false;
    }
}

// 測試 2: 檢查前端服務
function testFrontendService() {
    return new Promise((resolve) => {
        console.log('🌐 測試 2: 檢查前端服務');
        
        const req = http.get(`${FRONTEND_URL}/tw`, (res) => {
            if (res.statusCode === 200 || res.statusCode === 302) {
                console.log('✅ 前端服務正常運行\n');
                resolve(true);
            } else {
                console.log(`❌ 前端服務異常，狀態碼: ${res.statusCode}\n`);
                resolve(false);
            }
        });
        
        req.on('error', (error) => {
            console.log('❌ 無法連接前端服務:', error.message);
            console.log('   請確認前端伺服器是否已啟動 (yarn dev)\n');
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ 前端服務連接超時\n');
            resolve(false);
        });
    });
}

// 測試 3: 檢查 API 端點
function testAPIEndpoints() {
    return new Promise((resolve) => {
        console.log('🔌 測試 3: 檢查 API 端點');
        
        const testEndpoints = [
            '/api/affiliate-admin/applications',
            '/tw/affiliate/register',
            '/tw/affiliate-admin/login'
        ];
        
        let completedTests = 0;
        let passedTests = 0;
        
        testEndpoints.forEach((endpoint) => {
            const req = http.get(`${FRONTEND_URL}${endpoint}`, (res) => {
                completedTests++;
                
                // API 端點應該回傳 401 (Unauthorized) 或 200/302
                if ([200, 302, 401].includes(res.statusCode)) {
                    console.log(`✅ ${endpoint} - 狀態碼: ${res.statusCode}`);
                    passedTests++;
                } else {
                    console.log(`❌ ${endpoint} - 異常狀態碼: ${res.statusCode}`);
                }
                
                if (completedTests === testEndpoints.length) {
                    console.log(`\n📊 API 測試結果: ${passedTests}/${testEndpoints.length} 個端點正常\n`);
                    resolve(passedTests === testEndpoints.length);
                }
            });
            
            req.on('error', (error) => {
                completedTests++;
                console.log(`❌ ${endpoint} - 連接錯誤: ${error.message}`);
                
                if (completedTests === testEndpoints.length) {
                    console.log(`\n📊 API 測試結果: ${passedTests}/${testEndpoints.length} 個端點正常\n`);
                    resolve(passedTests === testEndpoints.length);
                }
            });
            
            req.setTimeout(3000, () => {
                req.abort();
            });
        });
    });
}

// 主要測試函數
async function runTests() {
    const results = {
        backendData: false,
        frontendService: false,
        apiEndpoints: false
    };
    
    // 執行所有測試
    results.backendData = testBackendDataFile();
    results.frontendService = await testFrontendService();
    results.apiEndpoints = await testAPIEndpoints();
    
    // 顯示總結
    console.log('🎯 測試總結:');
    console.log('================');
    console.log(`後端資料檔案: ${results.backendData ? '✅ 正常' : '❌ 異常'}`);
    console.log(`前端服務: ${results.frontendService ? '✅ 正常' : '❌ 異常'}`);
    console.log(`API 端點: ${results.apiEndpoints ? '✅ 正常' : '❌ 異常'}`);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 所有測試通過！Affiliate 系統已準備就緒。');
        console.log('\n🚀 你現在可以：');
        console.log('   1. 訪問 http://localhost:8000/tw/affiliate/register 進行會員註冊');
        console.log('   2. 訪問 http://localhost:8000/tw/affiliate-admin/login 登入管理後台');
        console.log('   3. 管理員帳號: admin@local.dev / MySecure2024Admin');
    } else {
        console.log('\n⚠️  部分測試失敗，請檢查上述錯誤訊息。');
    }
    
    console.log('\n完成測試。');
}

// 執行測試
runTests().catch(console.error);

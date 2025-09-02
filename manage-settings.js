#!/usr/bin/env node

/**
 * 聯盟設定管理工具
 * 用於管理聯盟會員的帳戶設定
 */

const fs = require('fs').promises;
const path = require('path');

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'affiliate-settings.json');

// 確保數據文件存在
async function ensureDataFiles() {
  try {
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  } catch (error) {
    // 目錄已存在，忽略錯誤
  }

  try {
    await fs.access(SETTINGS_FILE);
  } catch (error) {
    // 文件不存在，創建初始數據
    const initialData = {
      settings: {},
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(initialData, null, 2));
  }
}

// 讀取設定數據
async function getSettingsData() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { settings: {}, lastUpdated: new Date().toISOString() };
  }
}

// 保存設定數據
async function saveSettingsData(data) {
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

// 顯示所有設定
async function showAllSettings() {
  await ensureDataFiles();
  
  const settingsData = await getSettingsData();
  
  console.log('\n⚙️  聯盟會員設定');
  console.log('='.repeat(80));
  
  if (Object.keys(settingsData.settings).length === 0) {
    console.log('目前沒有任何聯盟會員設定');
    return;
  }

  for (const [affiliateId, settings] of Object.entries(settingsData.settings)) {
    console.log(`\n📧 ${affiliateId}`);
    console.log(`  顯示名稱: ${settings.displayName}`);
    console.log(`  公司名稱: ${settings.profile?.company || '未設定'}`);
    console.log(`  網站: ${settings.website || '未設定'}`);
    console.log(`  電話: ${settings.profile?.phone || '未設定'}`);
    console.log(`  收款方式: ${getPaymentMethodLabel(settings.payoutMethod)}`);
    
    if (settings.payoutMethod === 'bank_transfer' && settings.bankAccount) {
      console.log(`    銀行: ${settings.bankAccount.bankName}`);
      console.log(`    帳戶: ${settings.bankAccount.accountName} (${settings.bankAccount.accountNumber})`);
      if (settings.bankAccount.branch) {
        console.log(`    分行: ${settings.bankAccount.branch}`);
      }
    }
    
    if (settings.payoutMethod === 'paypal' && settings.paypalEmail) {
      console.log(`    PayPal: ${settings.paypalEmail}`);
    }
    
    if (settings.payoutMethod === 'stripe' && settings.stripeAccountId) {
      console.log(`    Stripe: ${settings.stripeAccountId}`);
    }

    console.log(`  通知設定:`);
    console.log(`    新訂單: ${settings.notifications?.emailOnNewOrder ? '✅' : '❌'}`);
    console.log(`    結算: ${settings.notifications?.emailOnPayment ? '✅' : '❌'}`);
    console.log(`    佣金更新: ${settings.notifications?.emailOnCommissionUpdate ? '✅' : '❌'}`);
  }
  
  console.log(`\n最後更新: ${new Date(settingsData.lastUpdated).toLocaleString('zh-TW')}`);
}

// 獲取收款方式標籤
function getPaymentMethodLabel(method) {
  switch (method) {
    case 'bank_transfer': return '銀行轉帳';
    case 'paypal': return 'PayPal';
    case 'stripe': return 'Stripe';
    default: return method;
  }
}

// 生成測試設定數據
async function generateTestData() {
  await ensureDataFiles();
  
  const settingsData = await getSettingsData();
  const testSettings = {
    'test@example.com': {
      displayName: '測試聯盟會員',
      website: 'https://test-affiliate.example.com',
      payoutMethod: 'bank_transfer',
      bankAccount: {
        bankName: '台灣銀行',
        accountName: '測試帳戶',
        accountNumber: '12345678901',
        branch: '台北分行'
      },
      notifications: {
        emailOnNewOrder: true,
        emailOnPayment: true,
        emailOnCommissionUpdate: false
      },
      profile: {
        company: '測試公司',
        phone: '0912-345-678',
        address: '台北市信義區信義路五段7號',
        taxId: '12345678'
      }
    },
    'test2@example.com': {
      displayName: 'PayPal 測試會員',
      website: 'https://paypal-test.example.com',
      payoutMethod: 'paypal',
      paypalEmail: 'paypal-test@example.com',
      notifications: {
        emailOnNewOrder: true,
        emailOnPayment: true,
        emailOnCommissionUpdate: true
      },
      profile: {
        company: 'PayPal 測試公司',
        phone: '0987-654-321'
      }
    },
    'test3@example.com': {
      displayName: 'Stripe 測試會員',
      payoutMethod: 'stripe',
      stripeAccountId: 'acct_1234567890abcdef',
      notifications: {
        emailOnNewOrder: false,
        emailOnPayment: true,
        emailOnCommissionUpdate: false
      },
      profile: {
        company: 'Stripe 測試公司'
      }
    }
  };
  
  // 移除現有測試數據
  for (const key of Object.keys(settingsData.settings)) {
    if (key.includes('test') || key.includes('example.com')) {
      delete settingsData.settings[key];
    }
  }
  
  // 添加新測試數據
  Object.assign(settingsData.settings, testSettings);
  
  await saveSettingsData(settingsData);
  console.log('✅ 測試設定數據已生成');
  console.log(`   生成設定: ${Object.keys(testSettings).length}`);
}

// 清除所有設定數據
async function clearAllSettings() {
  await ensureDataFiles();
  
  const emptyData = {
    settings: {},
    lastUpdated: new Date().toISOString()
  };
  
  await saveSettingsData(emptyData);
  console.log('🗑️  所有設定數據已清除');
}

// 顯示特定會員設定
async function showMemberSettings(affiliateId) {
  await ensureDataFiles();
  
  const settingsData = await getSettingsData();
  const settings = settingsData.settings[affiliateId];
  
  if (!settings) {
    console.log(`❌ 找不到聯盟會員 ${affiliateId} 的設定`);
    return;
  }
  
  console.log(`\n⚙️  ${affiliateId} 的設定詳情`);
  console.log('='.repeat(50));
  console.log(JSON.stringify(settings, null, 2));
}

// 主程序
async function main() {
  const command = process.argv[2];
  const affiliateId = process.argv[3];
  
  switch (command) {
    case 'show':
      if (affiliateId) {
        await showMemberSettings(affiliateId);
      } else {
        await showAllSettings();
      }
      break;
    case 'test':
      await generateTestData();
      break;
    case 'clear':
      await clearAllSettings();
      break;
    default:
      console.log('聯盟設定管理工具');
      console.log('');
      console.log('使用方式:');
      console.log('  node manage-settings.js show              # 顯示所有設定');
      console.log('  node manage-settings.js show <email>      # 顯示特定會員設定');
      console.log('  node manage-settings.js test              # 生成測試數據');
      console.log('  node manage-settings.js clear             # 清除所有數據');
      console.log('');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

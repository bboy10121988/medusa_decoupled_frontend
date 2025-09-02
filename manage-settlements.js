#!/usr/bin/env node

/**
 * 聯盟結算管理工具
 * 用於管理每月25號的自動結算
 */

const fs = require('fs').promises;
const path = require('path');

const SETTLEMENT_FILE = path.join(process.cwd(), 'data', 'affiliate-settlements.json');
const STATS_FILE = path.join(process.cwd(), 'data', 'affiliate-stats.json');

// 確保數據文件存在
async function ensureDataFiles() {
  try {
    await fs.mkdir(path.dirname(SETTLEMENT_FILE), { recursive: true });
  } catch (error) {
    // 目錄已存在，忽略錯誤
  }

  try {
    await fs.access(SETTLEMENT_FILE);
  } catch (error) {
    // 文件不存在，創建初始數據
    const initialData = {
      settlements: [],
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(SETTLEMENT_FILE, JSON.stringify(initialData, null, 2));
  }
}

// 讀取統計數據
async function getAffiliateStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('⚠️  統計數據文件不存在，返回空數據');
    return { affiliates: {}, lastUpdated: new Date().toISOString() };
  }
}

// 讀取結算數據
async function getSettlementData() {
  try {
    const data = await fs.readFile(SETTLEMENT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { settlements: [], lastUpdated: new Date().toISOString() };
  }
}

// 保存結算數據
async function saveSettlementData(data) {
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(SETTLEMENT_FILE, JSON.stringify(data, null, 2));
}

// 計算聯盟商未結算金額
function calculatePendingSettlement(affiliateId, stats, settlements) {
  const totalEarned = stats.totalCommission || 0;
  const totalSettled = settlements
    .filter(s => s.affiliateId === affiliateId && s.status === 'settled')
    .reduce((sum, s) => sum + s.amount, 0);
  
  return Math.max(0, totalEarned - totalSettled);
}

// 格式化期間字符串
function formatPeriod(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

// 獲取上個月的年月
function getLastMonth() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() - 1;
  
  if (month < 0) {
    month = 11;
    year -= 1;
  }
  
  return { year, month };
}

// 執行結算
async function processSettlement(targetPeriod = null) {
  await ensureDataFiles();
  
  const statsData = await getAffiliateStats();
  const settlementData = await getSettlementData();
  
  // 如果沒有指定期間，使用上個月
  const { year, month } = targetPeriod || getLastMonth();
  const period = formatPeriod(year, month);
  
  console.log(`\n🏦 開始處理 ${period} 期間的結算...`);
  
  let processedCount = 0;
  let totalAmount = 0;
  
  // 遍歷所有聯盟商
  for (const [affiliateId, stats] of Object.entries(statsData.affiliates || {})) {
    const pendingAmount = calculatePendingSettlement(affiliateId, stats, settlementData.settlements);
    
    if (pendingAmount > 0) {
      // 檢查是否已有該期間的結算記錄
      const existingSettlement = settlementData.settlements.find(
        s => s.affiliateId === affiliateId && s.period === period
      );
      
      if (existingSettlement) {
        console.log(`⚠️  ${affiliateId} 在 ${period} 已有結算記錄，跳過`);
        continue;
      }
      
      // 創建結算記錄
      const settlementRecord = {
        id: `settlement_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        affiliateId,
        amount: pendingAmount,
        currency: 'USD',
        status: 'settled',
        settlementDate: new Date().toISOString(),
        period,
        method: 'bank_transfer', // 預設支付方式
        note: `${period} 自動結算`
      };
      
      settlementData.settlements.push(settlementRecord);
      processedCount++;
      totalAmount += pendingAmount;
      
      console.log(`✅ ${affiliateId}: $${pendingAmount.toFixed(2)}`);
    } else {
      console.log(`➖ ${affiliateId}: 無需結算`);
    }
  }
  
  if (processedCount > 0) {
    await saveSettlementData(settlementData);
    console.log(`\n🎉 結算完成！`);
    console.log(`   處理聯盟商: ${processedCount}`);
    console.log(`   結算總額: $${totalAmount.toFixed(2)}`);
  } else {
    console.log('\n💤 沒有需要結算的聯盟商');
  }
}

// 顯示結算概況
async function showSettlementSummary() {
  await ensureDataFiles();
  
  const statsData = await getAffiliateStats();
  const settlementData = await getSettlementData();
  
  console.log('\n📊 結算概況');
  console.log('='.repeat(60));
  
  let totalEarned = 0;
  let totalSettled = 0;
  let totalPending = 0;
  
  for (const [affiliateId, stats] of Object.entries(statsData.affiliates || {})) {
    const earned = stats.totalCommission || 0;
    const settled = settlementData.settlements
      .filter(s => s.affiliateId === affiliateId && s.status === 'settled')
      .reduce((sum, s) => sum + s.amount, 0);
    const pending = Math.max(0, earned - settled);
    
    totalEarned += earned;
    totalSettled += settled;
    totalPending += pending;
    
    if (earned > 0) {
      console.log(`${affiliateId.padEnd(25)} | 總收入: $${earned.toFixed(2).padStart(8)} | 已結算: $${settled.toFixed(2).padStart(8)} | 未結算: $${pending.toFixed(2).padStart(8)}`);
    }
  }
  
  console.log('='.repeat(60));
  console.log(`${'總計'.padEnd(25)} | 總收入: $${totalEarned.toFixed(2).padStart(8)} | 已結算: $${totalSettled.toFixed(2).padStart(8)} | 未結算: $${totalPending.toFixed(2).padStart(8)}`);
  
  console.log(`\n📅 最近結算記錄:`);
  const recentSettlements = settlementData.settlements
    .sort((a, b) => new Date(b.settlementDate) - new Date(a.settlementDate))
    .slice(0, 5);
  
  if (recentSettlements.length > 0) {
    recentSettlements.forEach(s => {
      console.log(`   ${s.period} | ${s.affiliateId} | $${s.amount.toFixed(2)} | ${s.status}`);
    });
  } else {
    console.log('   尚未有結算記錄');
  }
}

// 生成測試結算數據
async function generateTestData() {
  await ensureDataFiles();
  
  const settlementData = await getSettlementData();
  const testSettlements = [
    {
      id: `settlement_test_001`,
      affiliateId: 'test@example.com',
      amount: 125.50,
      currency: 'USD',
      status: 'settled',
      settlementDate: new Date(2024, 11, 25).toISOString(), // 2024-12-25
      period: '2024-11',
      method: 'bank_transfer',
      note: '2024-11 自動結算'
    },
    {
      id: `settlement_test_002`,
      affiliateId: 'test@example.com',
      amount: 89.25,
      currency: 'USD',
      status: 'settled',
      settlementDate: new Date(2025, 0, 25).toISOString(), // 2025-01-25
      period: '2024-12',
      method: 'paypal',
      note: '2024-12 自動結算'
    },
    {
      id: `settlement_test_003`,
      affiliateId: 'test2@example.com',
      amount: 67.80,
      currency: 'USD',
      status: 'pending',
      settlementDate: new Date().toISOString(),
      period: '2025-01',
      method: 'bank_transfer',
      note: '2025-01 待結算'
    }
  ];
  
  // 移除現有測試數據
  settlementData.settlements = settlementData.settlements.filter(s => !s.id.includes('test'));
  
  // 添加新測試數據
  settlementData.settlements.push(...testSettlements);
  
  await saveSettlementData(settlementData);
  console.log('✅ 測試結算數據已生成');
  console.log(`   生成記錄: ${testSettlements.length}`);
}

// 清除所有結算數據
async function clearSettlementData() {
  await ensureDataFiles();
  
  const emptyData = {
    settlements: [],
    lastUpdated: new Date().toISOString()
  };
  
  await saveSettlementData(emptyData);
  console.log('🗑️  結算數據已清除');
}

// 主程序
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'settle':
      await processSettlement();
      break;
    case 'summary':
    case 'show':
      await showSettlementSummary();
      break;
    case 'test':
      await generateTestData();
      break;
    case 'clear':
      await clearSettlementData();
      break;
    default:
      console.log('聯盟結算管理工具');
      console.log('');
      console.log('使用方式:');
      console.log('  node manage-settlements.js show     # 顯示結算概況');
      console.log('  node manage-settlements.js settle   # 執行結算（每月25號）');
      console.log('  node manage-settlements.js test     # 生成測試數據');
      console.log('  node manage-settlements.js clear    # 清除所有數據');
      console.log('');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

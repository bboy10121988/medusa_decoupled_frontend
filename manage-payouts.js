#!/usr/bin/env node

// 管理聯盟結算數據的工具

const fs = require('fs').promises
const path = require('path')

const PAYOUT_FILE = path.join(__dirname, 'data', 'affiliate-payouts.json')

// 確保數據目錄存在
async function ensureDataDir() {
  const dataDir = path.dirname(PAYOUT_FILE)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // 目錄已存在
  }
}

// 讀取結算數據
async function loadPayouts() {
  try {
    const data = await fs.readFile(PAYOUT_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return {
      payouts: [],
      lastUpdated: new Date().toISOString()
    }
  }
}

// 儲存結算數據
async function savePayouts(data) {
  await ensureDataDir()
  data.lastUpdated = new Date().toISOString()
  await fs.writeFile(PAYOUT_FILE, JSON.stringify(data, null, 2))
}

// 顯示結算數據
async function showPayouts() {
  const data = await loadPayouts()
  
  console.log('💰 聯盟結算數據')
  console.log('=' .repeat(50))
  console.log(`更新時間: ${data.lastUpdated}`)
  console.log(`總申請數: ${data.payouts.length}`)
  console.log()
  
  if (data.payouts.length === 0) {
    console.log('📭 目前沒有結算記錄')
    return
  }
  
  // 按狀態分組
  const byStatus = {
    pending: data.payouts.filter(p => p.status === 'pending'),
    processing: data.payouts.filter(p => p.status === 'processing'),
    paid: data.payouts.filter(p => p.status === 'paid'),
    failed: data.payouts.filter(p => p.status === 'failed')
  }
  
  Object.entries(byStatus).forEach(([status, payouts]) => {
    if (payouts.length > 0) {
      const statusLabels = {
        pending: '待處理',
        processing: '處理中',
        paid: '已支付',
        failed: '失敗'
      }
      
      console.log(`\n📊 ${statusLabels[status]} (${payouts.length}):`)
      payouts.forEach(payout => {
        console.log(`  ${payout.id}`)
        console.log(`    聯盟ID: ${payout.affiliateId}`)
        console.log(`    金額: $${payout.amount}`)
        console.log(`    方式: ${payout.method}`)
        console.log(`    申請時間: ${new Date(payout.requestedAt).toLocaleString('zh-TW')}`)
        if (payout.processedAt) {
          console.log(`    處理時間: ${new Date(payout.processedAt).toLocaleString('zh-TW')}`)
        }
        console.log()
      })
    }
  })
}

// 添加測試結算數據
async function addTestPayouts() {
  const data = await loadPayouts()
  
  const testPayouts = [
    {
      id: `payout_${Date.now()}_test1`,
      affiliateId: 'aff_test',
      amount: 150.00,
      currency: 'USD',
      status: 'paid',
      requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      method: 'bank_transfer',
      reference: 'TX123456789'
    },
    {
      id: `payout_${Date.now()}_test2`,
      affiliateId: 'aff_test',
      amount: 75.50,
      currency: 'USD',
      status: 'processing',
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      method: 'paypal'
    },
    {
      id: `payout_${Date.now()}_test3`,
      affiliateId: 'aff_test',
      amount: 200.00,
      currency: 'USD',
      status: 'pending',
      requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      method: 'stripe'
    }
  ]
  
  data.payouts.push(...testPayouts)
  await savePayouts(data)
  
  console.log('✅ 測試結算數據已添加')
  console.log(`📊 新增了 ${testPayouts.length} 筆結算記錄`)
}

// 清除所有結算數據
async function clearPayouts() {
  const emptyData = {
    payouts: [],
    lastUpdated: new Date().toISOString()
  }
  
  await savePayouts(emptyData)
  console.log('🗑️  結算數據已清除')
}

// 處理命令列參數
const command = process.argv[2]

switch (command) {
  case 'show':
    showPayouts().catch(console.error)
    break
  case 'test':
    addTestPayouts().catch(console.error)
    break
  case 'clear':
    clearPayouts().catch(console.error)
    break
  default:
    console.log('📖 聯盟結算管理工具')
    console.log()
    console.log('使用方式:')
    console.log('  node manage-payouts.js show   - 顯示所有結算記錄')
    console.log('  node manage-payouts.js test   - 添加測試結算數據')
    console.log('  node manage-payouts.js clear  - 清除所有結算數據')
    break
}

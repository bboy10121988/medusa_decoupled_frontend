#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

const STATS_FILE = path.join(process.cwd(), 'affiliate-stats.json')

async function viewStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf-8')
    const stats = JSON.parse(data)
    
    console.log('📊 聯盟行銷統計資料')
    console.log('='.repeat(50))
    console.log(`📅 最後更新: ${stats.lastUpdated}`)
    console.log(`📍 總點擊數: ${stats.clicks.length}`)
    
    // 按聯盟夥伴分組統計
    const affiliateStats = {}
    stats.clicks.forEach(click => {
      if (!affiliateStats[click.affiliateId]) {
        affiliateStats[click.affiliateId] = {
          clicks: 0,
          conversions: 0,
          revenue: 0
        }
      }
      affiliateStats[click.affiliateId].clicks++
      if (click.converted) {
        affiliateStats[click.affiliateId].conversions++
        affiliateStats[click.affiliateId].revenue += click.conversionValue || 0
      }
    })
    
    console.log('\n👥 各聯盟夥伴統計:')
    Object.entries(affiliateStats).forEach(([affiliateId, stat]) => {
      console.log(`\n🔸 ${affiliateId}:`)
      console.log(`   📍 點擊: ${stat.clicks}`)
      console.log(`   💰 轉換: ${stat.conversions}`)
      console.log(`   💵 營收: $${stat.revenue.toFixed(2)}`)
      console.log(`   📈 轉換率: ${stat.clicks ? (stat.conversions / stat.clicks * 100).toFixed(2) : 0}%`)
    })
    
    // 最近點擊
    console.log('\n📋 最近 5 次點擊:')
    const recentClicks = stats.clicks.slice(-5).reverse()
    recentClicks.forEach((click, index) => {
      const date = new Date(click.timestamp).toLocaleString('zh-TW')
      const status = click.converted ? '✅ 已轉換' : '⏳ 待轉換'
      console.log(`${index + 1}. ${click.affiliateId} -> ${click.linkId} (${date}) ${status}`)
    })
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📊 尚無統計資料')
      console.log('💡 當有用戶點擊聯盟連結時，統計資料會自動生成')
    } else {
      console.error('❌ 讀取統計資料失敗:', error.message)
    }
  }
}

async function clearStats() {
  try {
    const initialData = {
      clicks: [],
      lastUpdated: new Date().toISOString(),
    }
    await fs.writeFile(STATS_FILE, JSON.stringify(initialData, null, 2))
    console.log('🗑️  統計資料已清除')
  } catch (error) {
    console.error('❌ 清除統計資料失敗:', error.message)
  }
}

async function addTestClicks() {
  try {
    let stats
    try {
      const data = await fs.readFile(STATS_FILE, 'utf-8')
      stats = JSON.parse(data)
    } catch {
      stats = { clicks: [], lastUpdated: new Date().toISOString() }
    }
    
    // 添加一些測試點擊
    const testClicks = [
      {
        id: `clk_${Date.now()}_test1`,
        affiliateId: 'aff_test',
        linkId: 'lnk_home',
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: 'Test Browser',
        converted: true,
        conversionValue: 100,
        conversionTimestamp: new Date(Date.now() + 1000 * 60 * 30).toISOString()
      },
      {
        id: `clk_${Date.now()}_test2`,
        affiliateId: 'aff_test',
        linkId: 'lnk_products',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        ip: '127.0.0.1',
        userAgent: 'Test Browser',
        converted: false
      }
    ]
    
    stats.clicks.push(...testClicks)
    stats.lastUpdated = new Date().toISOString()
    
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2))
    console.log('✅ 測試資料已添加')
    console.log(`📊 新增了 ${testClicks.length} 筆測試點擊記錄`)
  } catch (error) {
    console.error('❌ 添加測試資料失敗:', error.message)
  }
}

// 主程式
const command = process.argv[2]

switch (command) {
  case 'show':
  case 'view':
  case 'list':
    viewStats()
    break
  case 'clear':
  case 'clean':
    clearStats()
    break
  case 'test':
  case 'demo':
    addTestClicks()
    break
  default:
    console.log('📊 聯盟行銷統計管理工具\n')
    console.log('使用方法:')
    console.log('  node manage-stats.js [command]\n')
    console.log('可用指令:')
    console.log('  show, view, list    顯示統計資料')
    console.log('  clear, clean        清除所有統計資料')
    console.log('  test, demo          添加測試資料\n')
    console.log('範例:')
    console.log('  node manage-stats.js show     # 查看統計')
    console.log('  node manage-stats.js test     # 添加測試資料')
    break
}

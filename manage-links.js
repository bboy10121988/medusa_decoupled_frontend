#!/usr/bin/env node

/**
 * 聯盟連結管理工具
 * 
 * 功能：
 * - 查看所有儲存的連結
 * - 切換儲存模式（記憶體 <-> JSON）
 * - 清理連結資料
 */

const fs = require('fs').promises;
const path = require('path');

const STORAGE_FILE = path.join(__dirname, 'data', 'affiliate-links', 'links.json');
const ENV_FILE = path.join(__dirname, '.env.local');

async function loadLinksFromFile() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function getCurrentStorageMode() {
  try {
    const envContent = await fs.readFile(ENV_FILE, 'utf-8');
    const match = envContent.match(/AFFILIATE_STORAGE_MODE=(.+)/);
    return match ? match[1].trim() : 'memory';
  } catch (error) {
    return 'memory';
  }
}

async function setStorageMode(mode) {
  try {
    let envContent = await fs.readFile(ENV_FILE, 'utf-8');
    
    if (envContent.includes('AFFILIATE_STORAGE_MODE=')) {
      envContent = envContent.replace(
        /AFFILIATE_STORAGE_MODE=.+/g, 
        `AFFILIATE_STORAGE_MODE=${mode}`
      );
    } else {
      envContent += `\nAFFILIATE_STORAGE_MODE=${mode}\n`;
    }
    
    await fs.writeFile(ENV_FILE, envContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('設定儲存模式失敗:', error.message);
    return false;
  }
}

async function displayLinks() {
  console.log('📋 聯盟推廣連結總覽\n');
  
  const currentMode = await getCurrentStorageMode();
  console.log(`🔧 目前儲存模式: ${currentMode.toUpperCase()}`);
  
  if (currentMode === 'json') {
    const allLinks = await loadLinksFromFile();
    const affiliateIds = Object.keys(allLinks);
    
    if (affiliateIds.length === 0) {
      console.log('📭 沒有找到任何連結\n');
      return;
    }
    
    console.log(`👥 聯盟夥伴數量: ${affiliateIds.length}`);
    
    let totalLinks = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    
    affiliateIds.forEach((affiliateId, index) => {
      const links = allLinks[affiliateId];
      const affiliateClicks = links.reduce((sum, link) => sum + link.clicks, 0);
      const affiliateConversions = links.reduce((sum, link) => sum + link.conversions, 0);
      
      console.log(`\n${index + 1}. 聯盟夥伴 ID: ${affiliateId}`);
      console.log(`   📊 連結數量: ${links.length}`);
      console.log(`   👆 總點擊: ${affiliateClicks}`);
      console.log(`   💰 總轉換: ${affiliateConversions}`);
      
      links.forEach((link, linkIndex) => {
        console.log(`   ${linkIndex + 1}. ${link.name} (${link.id})`);
        console.log(`      🔗 ${link.url}`);
        console.log(`      📅 ${new Date(link.createdAt).toLocaleString('zh-TW')}`);
        console.log(`      📊 點擊: ${link.clicks} | 轉換: ${link.conversions}`);
      });
      
      totalLinks += links.length;
      totalClicks += affiliateClicks;
      totalConversions += affiliateConversions;
    });
    
    console.log(`\n📊 總計統計:`);
    console.log(`   總連結數: ${totalLinks}`);
    console.log(`   總點擊數: ${totalClicks}`);
    console.log(`   總轉換數: ${totalConversions}`);
    
  } else {
    console.log('ℹ️  記憶體儲存模式：連結只在伺服器運行時存在');
    console.log('   要查看記憶體中的連結，請先切換到 JSON 模式或直接使用 API');
  }
  
  console.log('');
}

async function clearLinks() {
  try {
    const currentMode = await getCurrentStorageMode();
    
    if (currentMode === 'json') {
      await fs.writeFile(STORAGE_FILE, '{}', 'utf-8');
      console.log('✅ JSON 檔案中的所有連結已清理');
    } else {
      console.log('ℹ️  記憶體模式：重啟伺服器即可清理記憶體中的連結');
    }
  } catch (error) {
    console.error('❌ 清理連結失敗:', error.message);
  }
}

async function switchMode() {
  const currentMode = await getCurrentStorageMode();
  const newMode = currentMode === 'json' ? 'memory' : 'json';
  
  console.log(`🔄 切換儲存模式: ${currentMode} -> ${newMode}`);
  
  const success = await setStorageMode(newMode);
  if (success) {
    console.log('✅ 儲存模式已更新');
    console.log('⚠️  請重新啟動開發伺服器以使設定生效');
  } else {
    console.log('❌ 更新儲存模式失敗');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('🔗 聯盟連結管理工具\n');
  
  switch (command) {
    case 'show':
    case 'list':
    case 'ls':
      await displayLinks();
      break;
      
    case 'clear':
    case 'clean':
      await clearLinks();
      break;
      
    case 'switch':
    case 'toggle':
      await switchMode();
      break;
      
    case 'help':
    case '-h':
    case '--help':
    default:
      console.log('使用方法:');
      console.log('  node manage-links.js [command]');
      console.log('');
      console.log('可用指令:');
      console.log('  show, list, ls    顯示所有儲存的連結');
      console.log('  clear, clean      清理所有連結資料');
      console.log('  switch, toggle    切換儲存模式 (memory <-> json)');
      console.log('  help              顯示此說明');
      console.log('');
      console.log('範例:');
      console.log('  node manage-links.js show     # 查看所有連結');
      console.log('  node manage-links.js switch   # 切換儲存模式');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

const fs = require('fs');
const path = require('path');

// 讀取並分析配置文件
const configPath = path.join(__dirname, '../src/components/grapesjs/components-config.ts');
const advancedPath = path.join(__dirname, '../src/components/grapesjs/advanced-components.ts');

console.log('🔍 檢查配置文件...\n');

try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  const advancedContent = fs.readFileSync(advancedPath, 'utf8');
  
  console.log('📄 基本配置文件大小:', configContent.length, '字元');
  console.log('📄 進階配置文件大小:', advancedContent.length, '字元');
  
  // 檢查導入
  const hasAdvancedImport = configContent.includes("import { advancedBlocks } from './advanced-components'");
  console.log('✅ 進階元件導入狀況:', hasAdvancedImport ? '已導入' : '❌ 未導入');
  
  // 檢查 getAllBlocks 函數
  const hasAdvancedInFunction = configContent.includes('...advancedBlocks');
  console.log('✅ getAllBlocks 包含進階元件:', hasAdvancedInFunction ? '是' : '❌ 否');
  
  // 分析進階配置中的元件數量
  const advancedComponentCount = (advancedContent.match(/id:\s*['"`]/g) || []).length;
  console.log('🔢 進階配置中的元件數量:', advancedComponentCount);
  
  // 分析基本配置中的元件數量
  const basicComponentCount = (configContent.match(/id:\s*['"`]/g) || []).length;
  console.log('🔢 基本配置中的元件數量:', basicComponentCount);
  
  console.log('\n📋 進階配置中的元件 ID:');
  const advancedIds = [...advancedContent.matchAll(/id:\s*['"`]([^'"`]+)['"`]/g)];
  advancedIds.forEach((match, index) => {
    console.log(`   ${index + 1}. ${match[1]}`);
  });
  
} catch (error) {
  console.error('❌ 讀取文件時發生錯誤:', error.message);
}

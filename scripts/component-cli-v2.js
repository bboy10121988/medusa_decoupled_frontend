#!/usr/bin/env node

/**
 * GrapesJS 元件庫管理工具
 * 用於管理自定義元件的 CLI 工具
 */

const fs = require('fs').promises;
const path = require('path');

const COMPONENTS_CONFIG_PATH = path.join(__dirname, '../src/components/grapesjs/components-config.ts');
const ADVANCED_CONFIG_PATH = path.join(__dirname, '../src/components/grapesjs/advanced-components.ts');

class ComponentManager {
  async readConfig() {
    try {
      const content = await fs.readFile(COMPONENTS_CONFIG_PATH, 'utf8');
      return content;
    } catch (error) {
      console.error('❌ 無法讀取元件配置文件:', error.message);
      process.exit(1);
    }
  }

  async readAdvancedConfig() {
    try {
      const content = await fs.readFile(ADVANCED_CONFIG_PATH, 'utf8');
      return content;
    } catch (error) {
      console.error('❌ 無法讀取進階配置文件:', error.message);
      return '';
    }
  }

  async writeConfig(content) {
    try {
      await fs.writeFile(COMPONENTS_CONFIG_PATH, content, 'utf8');
      console.log('✅ 配置文件已更新');
    } catch (error) {
      console.error('❌ 無法寫入配置文件:', error.message);
      process.exit(1);
    }
  }

  async listComponents() {
    const mainContent = await this.readConfig();
    const advancedContent = await this.readAdvancedConfig();
    
    // 合併兩個配置的內容來分析
    const allContent = mainContent + '\n' + advancedContent;
    
    // 提取元件資訊
    const componentRegex = /{\s*id:\s*['"`]([^'"`]+)['"`][^}]*?category:\s*componentCategories\.([A-Z_]+)/gs;
    const matches = [...allContent.matchAll(componentRegex)];
    
    if (matches.length === 0) {
      console.log('📦 沒有找到任何元件');
      return;
    }

    console.log('📦 已註冊的元件:');
    console.log('─'.repeat(50));
    
    const categories = {};
    matches.forEach(match => {
      const [, id, category] = match;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(id);
    });

    // 按分類排序顯示
    const sortedCategories = Object.keys(categories).sort();
    sortedCategories.forEach(category => {
      const displayName = this.getCategoryDisplayName(category);
      console.log(`\n📁 ${displayName}:`);
      categories[category].forEach(component => {
        console.log(`   • ${component}`);
      });
    });

    console.log(`\n📊 總計: ${matches.length} 個元件`);
  }

  getCategoryDisplayName(category) {
    const categoryMap = {
      'BASIC': '基本元件',
      'LAYOUT': '版面配置',
      'MEDIA': '媒體',
      'INTERACTIVE': '互動元件',
      'ECOMMERCE': '電商元件',
      'FORMS': '表單元件',
      'CONTENT': '內容元件'
    };
    return categoryMap[category] || category;
  }

  async addComponent() {
    console.log('🔧 添加新元件');
    console.log('您可以透過以下方式添加新元件:\n');
    
    console.log('1. 📝 編輯基本元件:');
    console.log('   直接編輯 src/components/grapesjs/components-config.ts');
    console.log('   將新元件添加到 defaultBlocks 或 customBlocks 陣列中\n');
    
    console.log('2. 🚀 編輯進階元件:');
    console.log('   直接編輯 src/components/grapesjs/advanced-components.ts');
    console.log('   將新元件添加到相應的陣列中\n');
    
    console.log('📋 元件結構範例:');
    console.log(`{
  id: 'my-custom-component',
  label: '<i class="fa fa-star"></i><div>我的元件</div>',
  category: componentCategories.BASIC,
  content: '<div style="padding: 20px;">我的自定義內容</div>',
  attributes: { class: 'my-custom-component' }
}`);

    console.log('\n🎯 可用分類:');
    const categories = ['BASIC', 'LAYOUT', 'MEDIA', 'INTERACTIVE', 'ECOMMERCE', 'FORMS', 'CONTENT'];
    categories.forEach(cat => {
      console.log(`   • componentCategories.${cat} - ${this.getCategoryDisplayName(cat)}`);
    });
  }

  async removeComponent(componentId) {
    if (!componentId) {
      console.log('❌ 請指定要移除的元件 ID');
      console.log('使用方法: npm run components remove <component-id>');
      return;
    }

    console.log(`🗑️  準備移除元件: ${componentId}`);
    
    // 檢查元件是否存在
    const mainContent = await this.readConfig();
    const advancedContent = await this.readAdvancedConfig();
    const allContent = mainContent + '\n' + advancedContent;
    
    const componentExists = allContent.includes(`id: '${componentId}'`) || 
                           allContent.includes(`id: "${componentId}"`) ||
                           allContent.includes(`id: \`${componentId}\``);
    
    if (!componentExists) {
      console.log(`❌ 找不到元件: ${componentId}`);
      return;
    }
    
    console.log('⚠️  請手動編輯配置文件來移除元件:');
    console.log('   1. 檢查 components-config.ts');
    console.log('   2. 檢查 advanced-components.ts');
    console.log(`   3. 搜尋並刪除 id: '${componentId}' 的整個區塊`);
  }

  async showCategories() {
    console.log('📚 可用的元件分類:');
    console.log('─'.repeat(40));
    
    const categories = [
      { key: 'BASIC', name: '基本元件', desc: '文字、標題、基本區塊等' },
      { key: 'LAYOUT', name: '版面配置', desc: '主視覺、卡片、欄位等' },
      { key: 'MEDIA', name: '媒體', desc: '圖片、影片等媒體元件' },
      { key: 'INTERACTIVE', name: '互動元件', desc: '按鈕、連結等可點擊元件' },
      { key: 'ECOMMERCE', name: '電商元件', desc: '商品、購物車等電商相關元件' },
      { key: 'FORMS', name: '表單元件', desc: '表單、輸入框等表單相關元件' },
      { key: 'CONTENT', name: '內容元件', desc: '部落格、文章等內容展示元件' }
    ];

    categories.forEach(cat => {
      console.log(`\n📁 ${cat.name} (${cat.key})`);
      console.log(`   ${cat.desc}`);
      console.log(`   使用: componentCategories.${cat.key}`);
    });
  }

  async generateShowcase() {
    console.log('🎨 生成元件展示頁面...');
    
    const mainContent = await this.readConfig();
    const advancedContent = await this.readAdvancedConfig();
    
    // 簡單解析元件
    const allContent = mainContent + '\n' + advancedContent;
    const componentRegex = /{\s*id:\s*['"`]([^'"`]+)['"`][^}]*?label:\s*['"`]([^'"`]*?)['"`][^}]*?category:\s*componentCategories\.([A-Z_]+)[^}]*?content:\s*['"`]([^]*?)['"`][^}]*?}/gs;
    const matches = [...allContent.matchAll(componentRegex)];
    
    if (matches.length === 0) {
      console.log('❌ 沒有找到可解析的元件');
      return;
    }

    const components = matches.map(match => ({
      id: match[1],
      label: match[2],
      category: this.getCategoryDisplayName(match[3]),
      content: match[4].replace(/\\n/g, '\n').replace(/\\"/g, '"')
    }));

    const showcaseHtml = this.generateShowcaseHtml(components);
    const outputPath = path.join(__dirname, '../public/component-showcase.html');
    
    try {
      await fs.writeFile(outputPath, showcaseHtml, 'utf8');
      console.log('✅ 展示頁面已生成');
      console.log(`📄 文件位置: ${outputPath}`);
      console.log('🌐 您可以在瀏覽器中打開此文件查看所有元件');
    } catch (error) {
      console.error('❌ 無法寫入展示頁面:', error.message);
    }
  }

  generateShowcaseHtml(components) {
    const categorizedComponents = components.reduce((acc, comp) => {
      if (!acc[comp.category]) {
        acc[comp.category] = [];
      }
      acc[comp.category].push(comp);
      return acc;
    }, {});

    let html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GrapesJS 元件庫展示</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
    .header { text-align: center; margin-bottom: 40px; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; }
    .category-section { margin-bottom: 50px; }
    .category-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #2d3748; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    .component-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
    .component-card { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .component-header { background: #f7fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .component-title { font-weight: 600; color: #2d3748; }
    .component-id { font-family: 'Courier New', monospace; background: #edf2f7; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .component-preview { padding: 20px; min-height: 200px; overflow: hidden; }
    .stats { background: white; border-radius: 12px; padding: 20px; margin: 30px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .stat-item { text-align: center; padding: 20px; background: #f7fafc; border-radius: 8px; }
    .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 GrapesJS 元件庫展示</h1>
    <p>所有可用元件的視覺化預覽 (${components.length} 個元件)</p>
  </div>
  
  <div class="stats">
    <div class="stat-item">
      <div class="stat-number">${components.length}</div>
      <div>總元件數</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">${Object.keys(categorizedComponents).length}</div>
      <div>元件分類</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">${new Date().toLocaleDateString('zh-TW')}</div>
      <div>最後更新</div>
    </div>
  </div>`;

    Object.entries(categorizedComponents).forEach(([category, categoryComponents]) => {
      html += `
  <div class="category-section">
    <h2 class="category-title">📁 ${category}</h2>
    <div class="component-grid">`;
      
      categoryComponents.forEach(comp => {
        const cleanLabel = comp.label.replace(/<[^>]*>/g, '').replace(/div>/g, '').trim();
        html += `
      <div class="component-card">
        <div class="component-header">
          <div class="component-title">${cleanLabel}</div>
          <div class="component-id">${comp.id}</div>
        </div>
        <div class="component-preview">${comp.content}</div>
      </div>`;
      });
      
      html += `
    </div>
  </div>`;
    });

    html += `
  <footer style="text-align: center; margin-top: 50px; padding: 20px; color: #718096;">
    <p>🎨 由 GrapesJS 元件庫管理器生成 | ${new Date().toLocaleString('zh-TW')}</p>
  </footer>
</body>
</html>`;

    return html;
  }

  async stats() {
    const mainContent = await this.readConfig();
    const advancedContent = await this.readAdvancedConfig();
    const allContent = mainContent + '\n' + advancedContent;
    
    const componentMatches = [...allContent.matchAll(/{\s*id:\s*['"`]([^'"`]+)['"`]/gs)];
    const categoryMatches = [...allContent.matchAll(/category:\s*componentCategories\.([A-Z_]+)/gs)];
    
    console.log('📊 元件庫統計資訊:');
    console.log('─'.repeat(40));
    console.log(`📦 總元件數量: ${componentMatches.length}`);
    console.log(`📁 使用的分類數: ${new Set(categoryMatches.map(m => m[1])).size}`);
    console.log(`📄 配置文件: 2 個 (.ts 檔案)`);
    console.log(`💾 總檔案大小: ${Math.round((mainContent.length + advancedContent.length) / 1024)} KB`);
    
    // 分類統計
    const categoryCount = {};
    categoryMatches.forEach(match => {
      const category = match[1];
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    console.log('\n📋 各分類元件數量:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`   ${this.getCategoryDisplayName(cat)}: ${count} 個`);
    });
  }
}

// CLI 介面
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new ComponentManager();

  console.log('🎨 GrapesJS 元件庫管理器\n');

  switch (command) {
    case 'list':
    case 'ls':
      await manager.listComponents();
      break;

    case 'categories':
    case 'cat':
      await manager.showCategories();
      break;

    case 'add':
      await manager.addComponent();
      break;

    case 'remove':
    case 'rm':
      await manager.removeComponent(args[1]);
      break;

    case 'showcase':
    case 'preview':
      await manager.generateShowcase();
      break;

    case 'stats':
    case 'status':
      await manager.stats();
      break;

    case 'help':
    case '--help':
    case '-h':
    default:
      console.log('📋 可用命令:');
      console.log('──────────────────────────────────');
      console.log('  npm run components list          - 📦 列出所有元件');
      console.log('  npm run components categories     - 📚 列出所有分類');
      console.log('  npm run components showcase       - 🎨 生成元件展示頁面');
      console.log('  npm run components add            - ➕ 添加新元件指南');
      console.log('  npm run components remove <id>    - 🗑️  移除元件');
      console.log('  npm run components stats          - 📊 顯示統計資訊');
      console.log('  npm run components help           - ❓ 顯示此幫助');
      console.log('\n💡 提示: 元件配置位於 src/components/grapesjs/ 目錄');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComponentManager;

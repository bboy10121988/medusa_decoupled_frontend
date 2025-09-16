#!/usr/bin/env node

/**
 * GrapesJS 元件庫管理工具
 * 用於管理自定義元件的 CLI 工具
 */

const fs = require('fs').promises;
const path = require('path');

const COMPONENTS_CONFIG_PATH = path.join(__dirname, '../src/components/grapesjs/components-config.ts');

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
    const content = await this.readConfig();
    
    console.log('🔍 正在分析配置文件...\n');
    console.log('檔案大小:', content.length, '字元');
    
    // 簡單解析來提取元件資訊 - 更新正則表達式
    const componentRegex = /{\s*id:\s*['"`]([^'"`]+)['"`][^}]*?category:\s*componentCategories\.([A-Z_]+)|{\s*id:\s*['"`]([^'"`]+)['"`][^}]*?category:\s*['"`]([^'"`]+)['"`]/gs;
    const matches = [...content.matchAll(componentRegex)];
    
    console.log('找到的匹配項:', matches.length);
    
    if (matches.length === 0) {
      console.log('📦 沒有找到任何元件');
      console.log('正在嘗試更寬鬆的搜尋...');
      
      // 嘗試更寬鬆的搜尋
      const looseRegex = /id:\s*['"`]([^'"`]+)['"`]/g;
      const looseMatches = [...content.matchAll(looseRegex)];
      console.log('寬鬆搜尋找到:', looseMatches.length, '個元件ID');
      
      looseMatches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match[1]}`);
      });
      
      return;
    }

    console.log('📦 已註冊的元件:');
    console.log('─'.repeat(50));
    
    const categories = {};
    matches.forEach(match => {
      const [fullMatch, id1, category1, id2, category2] = match;
      const id = id1 || id2;
      const category = category1 || category2;
      
      console.log(`匹配: ${id} -> ${category}`);
      
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(id);
    });

    Object.entries(categories).forEach(([category, components]) => {
      console.log(`\n📁 ${category}:`);
      components.forEach(component => {
        console.log(`   • ${component}`);
      });
    });
  }

  async addComponent() {
    console.log('🔧 添加新元件 (即將推出)');
    console.log('請直接編輯 components-config.ts 文件來添加新元件');
    
    // 顯示範例
    console.log('\n範例元件結構:');
    console.log(`{
  id: 'my-component',
  label: '<i class="fa fa-star"></i><div>我的元件</div>',
  category: componentCategories.BASIC,
  content: '<div>我的自定義內容</div>',
  attributes: { class: 'my-component' }
}`);
  }

  async removeComponent(componentId) {
    if (!componentId) {
      console.log('❌ 請指定要移除的元件 ID');
      return;
    }

    console.log(`🗑️  移除元件: ${componentId} (即將推出)`);
    console.log('請直接編輯 components-config.ts 文件來移除元件');
  }

  async exportComponent(componentId) {
    if (!componentId) {
      console.log('❌ 請指定要匯出的元件 ID');
      return;
    }

    console.log(`📤 匯出元件: ${componentId} (即將推出)`);
  }

  async importComponent(filePath) {
    if (!filePath) {
      console.log('❌ 請指定要匯入的檔案路徑');
      return;
    }

    console.log(`📥 匯入元件: ${filePath} (即將推出)`);
  }

  async showCategories() {
    const content = await this.readConfig();
    
    // 提取 componentCategories
    const categoriesMatch = content.match(/export const componentCategories = {([^}]*)}/s);
    
    if (!categoriesMatch) {
      console.log('❌ 無法解析分類');
      return;
    }

    console.log('📚 可用的分類:');
    console.log('─'.repeat(30));
    
    const categoriesContent = categoriesMatch[1];
    const categoryMatches = [...categoriesContent.matchAll(/([A-Z_]+):\s*['"`]([^'"`]+)['"`]/g)];
    
    categoryMatches.forEach(([, key, value]) => {
      console.log(`• ${key}: ${value}`);
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

    case 'export':
      await manager.exportComponent(args[1]);
      break;

    case 'import':
      await manager.importComponent(args[1]);
      break;

    case 'help':
    case '--help':
    case '-h':
    default:
      console.log('使用方法:');
      console.log('  npm run components list     - 列出所有元件');
      console.log('  npm run components categories - 列出所有分類');
      console.log('  npm run components add       - 添加新元件');
      console.log('  npm run components remove <id> - 移除元件');
      console.log('  npm run components export <id> - 匯出元件');
      console.log('  npm run components import <file> - 匯入元件');
      console.log('  npm run components help      - 顯示幫助');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComponentManager;

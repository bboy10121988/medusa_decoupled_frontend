#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 配置
const PAGES_FILE = path.join(process.cwd(), 'data', 'grapesjs-pages', 'pages.json');
const STORAGE_DIR = path.dirname(PAGES_FILE);

// 確保儲存目錄存在
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

// 讀取頁面資料
function loadPages() {
  try {
    if (!fs.existsSync(PAGES_FILE)) {
      return {};
    }
    const data = fs.readFileSync(PAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 讀取頁面資料失敗:', error.message);
    return {};
  }
}

// 儲存頁面資料
function savePages(pages) {
  try {
    ensureStorageDir();
    fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2));
    return true;
  } catch (error) {
    console.error('❌ 儲存頁面資料失敗:', error.message);
    return false;
  }
}

// 列出所有頁面
function listPages() {
  const pages = loadPages();
  const pageList = Object.values(pages);
  
  if (pageList.length === 0) {
    console.log('📝 目前沒有任何頁面');
    return;
  }
  
  console.log(`📋 共有 ${pageList.length} 個頁面:\n`);
  pageList.forEach(page => {
    console.log(`🔹 ${page.id}`);
    console.log(`   名稱: ${page.name}`);
    console.log(`   建立時間: ${new Date(page.createdAt).toLocaleString('zh-TW')}`);
    console.log(`   更新時間: ${new Date(page.updatedAt).toLocaleString('zh-TW')}`);
    console.log(`   訪問網址: http://localhost:8000/tw/${page.id}\n`);
  });
}

// 建立新頁面
function createPage(id, name) {
  if (!id || !name) {
    console.error('❌ 請提供頁面 ID 和名稱');
    console.log('使用方式: npm run create-page <id> <name>');
    return;
  }
  
  const pages = loadPages();
  
  if (pages[id]) {
    console.error(`❌ 頁面 "${id}" 已存在`);
    return;
  }
  
  const now = new Date().toISOString();
  const newPage = {
    id,
    name,
    html: `<div style="padding: 40px; text-align: center;"><h1 style="color: #333; margin-bottom: 20px;">${name}</h1><p style="color: #666; font-size: 18px;">這是新創建的頁面，請使用編輯器進行編輯。</p></div>`,
    css: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; }',
    components: {},
    styles: {},
    createdAt: now,
    updatedAt: now
  };
  
  pages[id] = newPage;
  
  if (savePages(pages)) {
    console.log(`✅ 頁面 "${id}" 建立成功！`);
    console.log(`🌐 訪問網址: http://localhost:8000/tw/${id}`);
    console.log(`✏️  編輯網址: http://localhost:8000/studio`);
  }
}

// 刪除頁面
function deletePage(id) {
  if (!id) {
    console.error('❌ 請提供要刪除的頁面 ID');
    console.log('使用方式: npm run delete-page <id>');
    return;
  }
  
  const pages = loadPages();
  
  if (!pages[id]) {
    console.error(`❌ 找不到頁面 "${id}"`);
    return;
  }
  
  delete pages[id];
  
  if (savePages(pages)) {
    console.log(`✅ 頁面 "${id}" 已刪除`);
  }
}

// 匯出頁面
function exportPage(id) {
  if (!id) {
    console.error('❌ 請提供要匯出的頁面 ID');
    console.log('使用方式: npm run export-page <id>');
    return;
  }
  
  const pages = loadPages();
  const page = pages[id];
  
  if (!page) {
    console.error(`❌ 找不到頁面 "${id}"`);
    return;
  }
  
  const exportFile = path.join(process.cwd(), `${id}.html`);
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.name}</title>
    <style>
        ${page.css}
    </style>
</head>
<body>
    ${page.html}
</body>
</html>`;
  
  try {
    fs.writeFileSync(exportFile, htmlContent);
    console.log(`✅ 頁面 "${id}" 已匯出到: ${exportFile}`);
  } catch (error) {
    console.error('❌ 匯出失敗:', error.message);
  }
}

// 顯示頁面詳情
function showPage(id) {
  if (!id) {
    console.error('❌ 請提供頁面 ID');
    console.log('使用方式: npm run show-page <id>');
    return;
  }
  
  const pages = loadPages();
  const page = pages[id];
  
  if (!page) {
    console.error(`❌ 找不到頁面 "${id}"`);
    return;
  }
  
  console.log(`📄 頁面詳情: ${page.id}\n`);
  console.log(`名稱: ${page.name}`);
  console.log(`建立時間: ${new Date(page.createdAt).toLocaleString('zh-TW')}`);
  console.log(`更新時間: ${new Date(page.updatedAt).toLocaleString('zh-TW')}`);
  console.log(`訪問網址: http://localhost:8000/tw/${page.id}`);
  console.log(`HTML 長度: ${page.html.length} 字符`);
  console.log(`CSS 長度: ${page.css.length} 字符`);
}

// 主程式
function main() {
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'list':
      listPages();
      break;
    case 'create':
      createPage(args[0], args.slice(1).join(' '));
      break;
    case 'delete':
      deletePage(args[0]);
      break;
    case 'export':
      exportPage(args[0]);
      break;
    case 'show':
      showPage(args[0]);
      break;
    default:
      console.log(`
🎨 GrapesJS 頁面管理工具

使用方式:
  npm run list-pages              - 列出所有頁面
  npm run create-page <id> <name> - 建立新頁面
  npm run delete-page <id>        - 刪除頁面
  npm run export-page <id>        - 匯出頁面為 HTML
  npm run show-page <id>          - 顯示頁面詳情

範例:
  npm run create-page about "關於我們"
  npm run list-pages
  npm run export-page about
      `);
  }
}

main();

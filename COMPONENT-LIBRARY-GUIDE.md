# 🎨 GrapesJS 元件庫控制指南

恭喜！您現在擁有了一個完整的 GrapesJS 元件庫管理系統。以下是如何控制和自定義元件庫的完整指南。

## 📋 目錄結構

```
src/components/grapesjs/
├── ReactStudioEditor.tsx        # 主要編輯器元件
├── components-config.ts         # 基本元件配置
├── advanced-components.ts       # 進階元件配置
└── component-tools.ts           # 元件工具和驗證

scripts/
├── component-cli-v2.js          # 元件管理 CLI 工具
├── page-cli.js                  # 頁面管理 CLI 工具
└── test-config.js               # 配置測試工具

public/
└── component-showcase.html      # 自動生成的元件展示頁面
```

## 🚀 可用的 CLI 命令

### 基本操作
```bash
# 列出所有元件 (18 個)
npm run list-components

# 查看元件分類
npm run component-categories

# 查看統計資訊
npm run component-stats

# 生成可視化展示頁面
npm run component-showcase
```

### 頁面管理
```bash
# 列出所有頁面
npm run list-pages

# 創建新頁面
npm run create-page

# 刪除頁面
npm run delete-page
```

## 🎯 元件分類 (7 類)

1. **📄 基本元件** (3個) - 文字、標題、區塊
2. **🖼️ 媒體** (2個) - 圖片、影片
3. **🔗 互動元件** (2個) - 按鈕、連結
4. **📐 版面配置** (3個) - 主視覺、卡片、欄位
5. **📝 表單元件** (2個) - 基本表單、進階表單
6. **🛒 電商元件** (4個) - 商品卡片、特色商品、商品網格、購物車
7. **📰 內容元件** (2個) - 部落格卡片、部落格網格

## ✨ 如何添加自定義元件

### 方法 1: 編輯基本配置
在 `src/components/grapesjs/components-config.ts` 的 `customBlocks` 陣列中添加：

```typescript
export const customBlocks: BlockConfig[] = [
  {
    id: 'my-custom-component',
    label: '<i class="fa fa-magic"></i><div>我的元件</div>',
    category: componentCategories.BASIC,
    content: `<div style="padding: 20px; background: #f0f8ff; border: 2px solid #007bff; border-radius: 8px;">
      <h3 style="color: #007bff; margin-top: 0;">我的自定義元件</h3>
      <p>這是一個自定義的元件內容</p>
    </div>`,
    attributes: { class: 'my-custom-component' }
  }
];
```

### 方法 2: 創建專業進階元件
在 `src/components/grapesjs/advanced-components.ts` 中創建新的陣列：

```typescript
export const myCustomBlocks: BlockConfig[] = [
  {
    id: 'newsletter-signup',
    label: '<i class="fa fa-envelope"></i><div>電子報訂閱</div>',
    category: componentCategories.FORMS,
    content: `<section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 20px; text-align: center; color: white; border-radius: 12px; margin: 20px 0;">
      <h2 style="font-size: 2.5em; margin-bottom: 15px; color: white;">訂閱電子報</h2>
      <p style="font-size: 1.2em; margin-bottom: 30px; opacity: 0.9;">獲取最新消息和優惠資訊</p>
      <form style="max-width: 400px; margin: 0 auto; display: flex; gap: 10px;">
        <input type="email" placeholder="您的電子郵件" style="flex: 1; padding: 15px; border: none; border-radius: 6px; font-size: 16px;">
        <button type="submit" style="padding: 15px 30px; background: #28a745; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">訂閱</button>
      </form>
    </section>`
  }
];
```

然後在 `advancedBlocks` 中包含：
```typescript
export const advancedBlocks = [
  ...medusaEcommerceBlocks,
  ...blogBlocks,
  ...contactBlocks,
  ...myCustomBlocks  // 添加這行
];
```

## 🛠️ 元件屬性說明

### 必填屬性
- `id`: 唯一識別符（字母開頭，只包含字母、數字、連字符、下劃線）
- `label`: 顯示標籤（建議包含 Font Awesome 圖標）
- `category`: 分類（使用 componentCategories 常數）
- `content`: HTML 內容（建議包含內聯樣式）

### 可選屬性
- `attributes`: 額外的 HTML 屬性
- `media`: 媒體查詢設定
- `script`: 自定義 JavaScript 功能

## 🎨 樣式建議

### 顏色系統
```css
/* 主要色彩 */
primary: #007bff, #667eea
secondary: #6c757d, #764ba2  
success: #28a745
danger: #dc3545
warning: #ffc107

/* 中性色 */
white: #ffffff
light: #f8f9fa, #f5f7fa
dark: #212529, #2d3748
```

### 響應式設計
```css
/* 斷點建議 */
mobile: 480px
tablet: 768px  
desktop: 1024px
```

## 📊 元件驗證

系統會自動驗證：
- ✅ 必填字段完整性
- ✅ ID 格式正確性
- ✅ 重複 ID 檢測
- ✅ 內容長度檢查
- ⚠️ 樣式包含檢查
- ⚠️ 圖標使用建議

## 🔧 進階功能

### 元件互動
```javascript
// 在 ReactStudioEditor.tsx 的 onReady 回調中添加自定義命令
editor.Commands.add('my-custom-command', {
  run(editor, sender) {
    // 自定義功能邏輯
  }
});
```

### 自定義面板
```javascript
// 添加自定義工具面板
panels: {
  defaults: [{
    id: 'my-panel',
    buttons: [{
      id: 'my-button',
      className: 'my-button-class',
      command: 'my-custom-command',
      attributes: { title: '我的工具' }
    }]
  }]
}
```

## 📝 最佳實踐

1. **命名規範**: 使用描述性的 ID 名稱
2. **分類歸檔**: 將相似元件歸入同一分類  
3. **樣式一致**: 保持視覺風格統一
4. **響應式**: 確保在各種設備上正常顯示
5. **可存取**: 添加適當的 alt 屬性和語義標籤
6. **效能優化**: 避免過於複雜的 HTML 結構

## 🚀 快速開始範例

```bash
# 1. 查看現有元件
npm run list-components

# 2. 生成展示頁面
npm run component-showcase

# 3. 在瀏覽器中查看
open public/component-showcase.html

# 4. 編輯配置文件添加新元件
code src/components/grapesjs/components-config.ts

# 5. 重新查看更新
npm run list-components
```

## 🎯 下一步

現在您已經完全掌握了 GrapesJS 元件庫的控制方法！您可以：

- ✅ 通過 CLI 管理元件
- ✅ 添加自定義元件
- ✅ 生成可視化展示
- ✅ 分類管理元件
- ✅ 統計分析使用情況

開始創建您專屬的元件庫吧！🎨✨

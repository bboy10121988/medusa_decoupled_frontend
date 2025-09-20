# GrapesJS 組件插件管理

這個目錄包含所有自定義 GrapesJS 組件插件，採用模組化管理方式。

## 📁 目錄結構

```
src/components/grapesjs/plugins/
├── index.ts                  # 插件管理器，統一載入所有插件
├── html-code-plugin.ts       # HTML 代碼組件（支援 CSS+JS）
└── README.md                 # 此文件
```

## 🔧 如何添加新插件

1. **創建新的插件文件**：
   ```typescript
   // my-custom-plugin.ts
   export default function myCustomPlugin(editor: any) {
     // 添加組件類型
     editor.DomComponents.addType('my-component', {
       // 組件配置...
     })
     
     // 添加到組件庫
     editor.BlockManager.add('my-component', {
       // 組件庫配置...
     })
   }
   ```

2. **在 index.ts 中註冊插件**：
   ```typescript
   import myCustomPlugin from './my-custom-plugin'
   
   export const customPlugins = [
     htmlCodePlugin,
     myCustomPlugin,  // 添加新插件
     // ...
   ]
   ```

3. **插件會自動載入**到主編輯器中！

## ✨ 現有插件

### 輪播組件 (`carousel-plugin.ts`)
- **功能**：可配置的圖片輪播組件
- **分類**：媒體
- **圖標**：`fa fa-images`
- **特色**：
  - ✅ 自動播放設置
  - ✅ 指示點和箭頭控制
  - ✅ 可調整輪播數量
  - ✅ 響應式設計

### 卡片組件 (`card-plugin.ts`)
- **功能**：多種樣式的卡片組件
- **分類**：佈局
- **圖標**：`fa fa-id-card`
- **特色**：
  - ✅ 基本卡片、陰影卡片、產品卡片
  - ✅ 可自定義背景色
  - ✅ 多種佈局樣式
  - ✅ 現成的產品展示模板

### 按鈕組件 (`button-plugin.ts`)
- **功能**：增強的按鈕組件
- **分類**：基本
- **圖標**：`fa fa-hand-pointer`
- **特色**：
  - ✅ 主要、次要、成功、警告、危險樣式
  - ✅ 外框按鈕和 CTA 按鈕
  - ✅ 多種尺寸選擇
  - ✅ 全寬度選項

## 🚀 使用方式

插件會通過 `grapes_editor.tsx` 中的 `loadCustomPlugins` 函數自動載入：

```typescript
import loadCustomPlugins from './plugins'

// 在編輯器初始化時
plugins: [
  // ... 其他插件
  loadCustomPlugins  // 載入所有自定義插件
]
```

## 🐛 調試

所有插件載入狀態都會在控制台顯示：
- `🔌 開始載入自定義插件...`
- `✅ 自定義插件 X 載入成功` 
- `❌ 自定義插件 X 載入失敗`
- `🎉 所有自定義插件載入完成`
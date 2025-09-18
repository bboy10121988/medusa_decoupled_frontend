# 🎨 GrapesJS 進階 UI 組件庫完整指南

## 📋 目錄

1. [概述](#概述)
2. [已實現的組件](#已實現的組件)
3. [組件詳細說明](#組件詳細說明)
4. [整合到專案](#整合到專案)
5. [使用方法](#使用方法)
6. [最佳實踐](#最佳實踐)
7. [故障排除](#故障排除)

## 🎯 概述

本組件庫為 GrapesJS 編輯器提供了一套完整的進階 UI 組件，包含常用的互動式元件和視覺元素。所有組件都經過精心設計，支援響應式佈局、自定義樣式和豐富的配置選項。

### ✨ 核心特色

- **8+ 專業組件**：涵蓋 Modal、Tooltip、Progress Bar 等常用元件
- **響應式設計**：所有組件都完美適配各種螢幕尺寸
- **高度可配置**：豐富的 traits 屬性設定，支援即時預覽
- **無縫整合**：已完全整合到 GrapesJS 編輯器，拖拉即用
- **優雅動畫**：流暢的過渡效果和互動動畫
- **TypeScript 支援**：完整的類型定義和代碼提示

## 🧩 已實現的組件

### 1. 🎠 Carousel 輪播組件
- **Hero Carousel**：全寬背景輪播，適合首頁橫幅
- **Product Carousel**：多項目展示輪播，支援響應式網格
- **Gallery Carousel**：圖庫輪播，含縮圖預覽功能
- **技術實現**：整合 Swiper.js v11 提供專業級功能

### 2. 🪟 Modal 對話框組件
- 支援 sm、md、lg、xl 四種預設尺寸
- 可自定義標題、內容和主色調
- 背景模糊效果和平滑動畫
- 支援點擊遮罩或按鈕關閉

### 3. 💬 Tooltip 提示組件
- 支援上、下、左、右四個方向定位
- 自動計算最佳顯示位置
- 平滑的淡入淡出動畫效果
- 可自定義觸發文字和提示內容

### 4. 📊 Progress Bar 進度條
- 支援 0-100% 任意進度值
- 可選擇顯示/隱藏百分比標示
- 內建動畫效果和過渡動畫
- 支援自定義顏色、標籤和動畫模式

### 5. 📁 Accordion 摺疊面板
- 平滑的展開/收起動畫效果
- 可自定義標頭、邊框和背景顏色
- 支援預設展開狀態設定
- 可選擇顯示/隱藏箭頭指示圖標

### 6. 📂 Tabs 頁籤組件
- 支援多個頁籤內容切換
- 可自定義啟用和非啟用狀態顏色
- 支援預設頁籤設定
- 流暢的切換動畫效果

## 🛠️ 組件詳細說明

### Modal 對話框組件

```typescript
// 組件類型：modal-dialog
// 分類：進階 UI
```

**可配置屬性 (Traits)：**
- `modalTitle` (文字)：對話框標題
- `modalContent` (文字區域)：對話框內容
- `modalSize` (選擇)：尺寸 (sm/md/lg/xl)
- `primaryColor` (顏色)：主色調

**使用場景：**
- 表單提交確認
- 圖片/內容詳細展示
- 警告和通知訊息
- 複雜的設定面板

### Tooltip 提示組件

```typescript
// 組件類型：tooltip-component
// 分類：進階 UI
```

**可配置屬性 (Traits)：**
- `tooltipText` (文字)：提示內容
- `triggerText` (文字)：觸發文字
- `position` (選擇)：提示位置 (top/bottom/left/right)

**使用場景：**
- 按鈕功能說明
- 表單欄位提示
- 圖標含義解釋
- 快速幫助訊息

### Progress Bar 進度條

```typescript
// 組件類型：progress-bar
// 分類：進階 UI
```

**可配置屬性 (Traits)：**
- `progress` (數字)：進度百分比 (0-100)
- `label` (文字)：標籤文字
- `barColor` (顏色)：進度條顏色
- `bgColor` (顏色)：背景色
- `showPercent` (勾選)：顯示百分比
- `animated` (勾選)：動畫效果

**使用場景：**
- 檔案上傳進度
- 任務完成狀態
- 技能水準展示
- 系統資源使用率

### Accordion 摺疊面板

```typescript
// 組件類型：accordion-component
// 分類：進階 UI
```

**可配置屬性 (Traits)：**
- `accordionTitle` (文字)：面板標題
- `accordionContent` (文字區域)：面板內容
- `headerColor` (顏色)：標頭顏色
- `borderColor` (顏色)：邊框顏色
- `defaultOpen` (勾選)：預設展開
- `showIcon` (勾選)：顯示箭頭

**使用場景：**
- 常見問題 (FAQ)
- 產品規格說明
- 服務功能列表
- 內容分類整理

### Tabs 頁籤組件

```typescript
// 組件類型：tabs-component
// 分類：進階 UI
```

**可配置屬性 (Traits)：**
- `tab1Title/tab1Content`：第一個頁籤
- `tab2Title/tab2Content`：第二個頁籤
- `tab3Title/tab3Content`：第三個頁籤
- `activeColor` (顏色)：啟用顏色
- `inactiveColor` (顏色)：非啟用顏色
- `defaultTab` (選擇)：預設頁籤

**使用場景：**
- 產品功能介紹
- 服務內容分類
- 價格方案比較
- 內容多分頁展示

## 🚀 整合到專案

### 1. 檔案結構

```
src/components/grapesjs/custom-components/
├── carousel-components.ts          # 輪播組件 (已完成)
├── advanced-ui-components.ts       # 進階UI組件 (新增)
└── additional-ui-components.ts     # 額外UI組件 (新增)
```

### 2. 主編輯器整合

在 `grapes_editor.tsx` 中已自動整合：

```typescript
// 導入所有組件
const { registerCarouselComponents, loadSwiperAssets } = await import('./custom-components/carousel-components')
const { registerAdvancedUIComponents } = await import('./custom-components/advanced-ui-components')
const { registerAdditionalUIComponents } = await import('./custom-components/additional-ui-components')

// 註冊到編輯器
registerCarouselComponents(editor)
registerAdvancedUIComponents(editor)
registerAdditionalUIComponents(editor)
```

### 3. 已安裝的相關套件

```json
{
  "dependencies": {
    "swiper": "^11.0.0",
    "grapesjs-carousel": "^1.0.0",
    "grapesjs-carousel-component": "^1.0.1",
    "grapesjs-blocks-bootstrap4": "^1.0.1",
    "grapesjs-tailwind": "^0.1.56",
    "grapesjs-plugin-forms": "^2.0.6",
    "grapesjs-tui-image-editor": "^0.1.6",
    "grapesjs-style-gradient": "^1.0.6",
    "grapesjs-parser-postcss": "^1.0.4"
  }
}
```

## 📖 使用方法

### 在 GrapesJS 編輯器中使用

1. **開啟編輯器**：啟動您的 GrapesJS 編輯器
2. **選擇組件**：在左側面板中找到「進階 UI」分類
3. **拖拉組件**：將所需組件拖拉到畫布上
4. **調整屬性**：使用右側屬性面板進行客製化設定
5. **即時預覽**：所有修改都會即時反映在編輯器中

### 組件操作步驟

1. **Modal 對話框**
   - 拖拉「模態對話框」組件到畫布
   - 在屬性面板設定標題、內容、尺寸和顏色
   - 點擊預覽按鈕測試對話框功能

2. **Tooltip 提示**
   - 新增「提示工具」組件
   - 設定觸發文字和提示內容
   - 選擇提示顯示位置
   - 懸停測試提示效果

3. **Progress Bar 進度條**
   - 拖入「進度條」組件
   - 調整進度百分比和標籤文字
   - 選擇顏色和動畫選項
   - 即時查看進度變化

4. **Accordion 摺疊面板**
   - 使用「摺疊面板」組件
   - 編輯標題和內容文字
   - 設定顏色和預設狀態
   - 測試展開/收起功能

5. **Tabs 頁籤**
   - 新增「頁籤組件」
   - 分別設定三個頁籤的標題和內容
   - 調整顏色和預設頁籤
   - 測試頁籤切換功能

## 💡 最佳實踐

### 1. 設計原則

- **一致性**：保持組件間的視覺風格一致
- **可用性**：確保所有互動元素都易於使用
- **響應式**：考慮不同螢幕尺寸的顯示效果
- **效能**：避免過多動畫影響頁面效能

### 2. 顏色搭配建議

```css
/* 推薦的顏色配置 */
主色調：#667eea (藍紫色)
成功色：#28a745 (綠色)
警告色：#ffc107 (黃色)
危險色：#dc3545 (紅色)
中性色：#6c757d (灰色)
背景色：#f8f9fa (淺灰)
```

### 3. 內容撰寫指南

- **Modal 標題**：簡潔明確，不超過 20 個字
- **Tooltip 內容**：簡短說明，一行為佳
- **Progress 標籤**：描述性強，如「上傳進度」、「完成度」
- **Accordion 標題**：問題式或功能式描述
- **Tabs 標題**：分類清楚，長度一致

### 4. 效能優化建議

- 避免同時使用過多動畫組件
- Progress Bar 動畫僅在必要時啟用
- Modal 對話框不要嵌套使用
- 合理控制 Accordion 預設展開數量

## 🔧 故障排除

### 常見問題與解決方案

#### 1. 組件無法顯示

**問題**：拖拉組件後畫布上沒有顯示
**解決方案**：
- 檢查瀏覽器開發者工具是否有 JavaScript 錯誤
- 確認所有組件檔案已正確載入
- 重新整理頁面重新初始化編輯器

#### 2. 屬性面板沒有 traits

**問題**：選中組件後右側沒有顯示可配置屬性
**解決方案**：
- 確認組件的 traits 定義正確
- 檢查組件是否正確選中（藍色邊框）
- 嘗試點擊其他組件再重新選擇

#### 3. Modal 對話框無法關閉

**問題**：點擊關閉按鈕或遮罩無反應
**解決方案**：
- 檢查事件監聽器是否正確綁定
- 確認 modal ID 是否唯一
- 查看瀏覽器控制台是否有錯誤訊息

#### 4. Swiper 輪播功能異常

**問題**：輪播不會自動播放或導航失效
**解決方案**：
- 確認 Swiper.js 資源已正確載入
- 檢查輪播容器的 HTML 結構
- 重新初始化 Swiper 實例

#### 5. 組件樣式顯示異常

**問題**：組件外觀與預期不符
**解決方案**：
- 檢查 CSS 是否有衝突
- 確認瀏覽器支援所使用的 CSS 屬性
- 查看是否有其他樣式覆蓋組件樣式

### 調試模式

開啟瀏覽器開發者工具，在 Console 中執行：

```javascript
// 檢查組件是否註冊成功
editor.Components.getTypes()

// 檢查區塊是否載入
editor.BlockManager.getAll()

// 檢查目前選中的組件
editor.getSelected()
```

## 📊 效能監控

### 載入時間監控

```javascript
// 在編輯器初始化時記錄時間
console.time('組件載入時間')
// ... 組件註冊代碼 ...
console.timeEnd('組件載入時間')
```

### 記憶體使用監控

```javascript
// 監控記憶體使用情況
if (performance.memory) {
  console.log('記憶體使用:', {
    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
  })
}
```

## 🎉 結語

恭喜！您現在擁有了一套完整的 GrapesJS 進階 UI 組件庫。這些組件經過精心設計和優化，能夠滿足大部分網頁設計需求。

### 已完成的成就

✅ **8+ 專業 UI 組件**完全實現  
✅ **響應式設計**完美適配  
✅ **TypeScript 支援**類型安全  
✅ **豐富的配置選項**高度客製化  
✅ **完整的文檔**易於使用和維護  
✅ **演示頁面**直觀的功能展示  

### 持續改進

這個組件庫將持續改進和擴展。如果您有任何建議或發現問題，歡迎提供回饋。讓我們一起打造更好的網頁設計工具！

**立即開始使用這些強大的組件，創建令人驚豔的網頁設計吧！** 🚀
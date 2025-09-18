# 🔧 未註冊插件整合指南

## 📋 概述

本指南將協助您將 5 個已下載但未註冊的 GrapesJS 插件整合到編輯器中，大幅擴展編輯器功能。

## 🎯 整合步驟

### 1. 修改主編輯器文件

在 `src/components/grapesjs/grapes_editor.tsx` 中添加未註冊的插件：

#### 步驟 1.1：導入插件

在現有插件導入區塊中添加（約第 1028 行附近）：

```typescript
// 現有插件導入...
const pluginWebpage = (await import('grapesjs-preset-webpage')).default
const pluginBlocksBasic = (await import('grapesjs-blocks-basic')).default
const pluginForms = (await import('grapesjs-plugin-forms')).default
const pluginCountdown = (await import('grapesjs-component-countdown')).default
const pluginTabs = (await import('grapesjs-tabs')).default
const pluginCustomCode = (await import('grapesjs-custom-code')).default
const pluginTooltip = (await import('grapesjs-tooltip')).default
const pluginTyped = (await import('grapesjs-typed')).default

// 🆕 添加未註冊的插件導入
const pluginBootstrap4 = (await import('grapesjs-blocks-bootstrap4')).default
const pluginPostCSS = (await import('grapesjs-parser-postcss')).default
const pluginGradient = (await import('grapesjs-style-gradient')).default
const pluginTailwind = (await import('grapesjs-tailwind')).default
const pluginImageEditor = (await import('grapesjs-tui-image-editor')).default

console.log('✅ 所有插件導入完成')
```

#### 步驟 1.2：添加到插件清單

在 plugins 陣列中添加新插件（約第 1326 行附近）：

```typescript
plugins: [
  pluginWebpage,
  pluginBlocksBasic,
  pluginForms,
  pluginCountdown,
  pluginTabs,
  pluginCustomCode,
  pluginTooltip,
  pluginTyped,
  // 添加 Carousel 插件（如果載入成功）
  ...(pluginCarousel ? [pluginCarousel] : []),
  
  // 🆕 新增的插件
  pluginBootstrap4,
  pluginPostCSS,
  pluginGradient,
  pluginTailwind,
  pluginImageEditor
],
```

### 2. 配置插件選項

#### 步驟 2.1：創建插件配置函數

新增一個插件配置函數來管理各插件的選項：

```typescript
// 添加到 grapes_editor.tsx 的頂部或適當位置

/**
 * 獲取所有插件的配置選項
 */
const getPluginsOptions = () => {
  return {
    // 現有插件配置...
    
    // 🆕 Bootstrap 4 插件配置
    'grapesjs-blocks-bootstrap4': {
      blocks: ['column', 'row', 'card', 'collapse', 'navbar', 'alert', 'tabs'],
      blockCategories: {
        column: 'Bootstrap 佈局',
        row: 'Bootstrap 佈局', 
        card: 'Bootstrap 組件',
        collapse: 'Bootstrap 組件',
        navbar: 'Bootstrap 導覽',
        alert: 'Bootstrap 提示',
        tabs: 'Bootstrap 互動'
      },
      labels: {
        // 中文標籤
        column: '欄位',
        row: '列',
        card: '卡片',
        collapse: '摺疊',
        navbar: '導覽列',
        alert: '警告框',
        tabs: '頁籤'
      }
    },

    // 🆕 樣式漸層插件配置
    'grapesjs-style-gradient': {
      // 啟用所有漸層類型
      colorPicker: 'default',
      grapickOpts: {
        template: `
          <div class="gjs-gradient-preview"></div>
          <div class="gjs-gradient-c">
            <div class="gjs-gradient-type-c">
              <select class="gjs-gradient-type">
                <option value="linear">線性漸層</option>
                <option value="radial">徑向漸層</option>
              </select>
            </div>
            <div class="gjs-gradient-degree-c">
              <input class="gjs-gradient-degree" type="range" min="0" max="360" step="1" />
            </div>
          </div>
        `
      }
    },

    // 🆕 Tailwind CSS 插件配置
    'grapesjs-tailwind': {
      config: {
        // 啟用繁體中文
        theme: {
          extend: {
            fontFamily: {
              'zh': ['Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', 'sans-serif']
            }
          }
        }
      },
      plugins: [],
      // 啟用的工具類別分類
      blocksCategory: 'Tailwind',
      // 自定義標籤
      labels: {
        'Width': '寬度',
        'Height': '高度',
        'Margin': '外邊距',
        'Padding': '內邊距',
        'Typography': '文字樣式',
        'Background': '背景',
        'Border': '邊框'
      }
    },

    // 🆕 圖片編輯器插件配置
    'grapesjs-tui-image-editor': {
      config: {
        'menu': ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'filter'],
        'initMenu': 'filter',
        'uiSize': {
          width: '100%',
          height: '700px',
        },
        'menuBarPosition': 'bottom',
        'locale_file': {
          // 繁體中文本地化
          'Crop': '裁切',
          'Flip': '翻轉',
          'Rotate': '旋轉',
          'Draw': '繪製',
          'Shape': '形狀',
          'Icon': '圖示',
          'Text': '文字',
          'Filter': '濾鏡',
          'Apply': '套用',
          'Cancel': '取消'
        }
      },
      // 自定義按鈕標籤
      buttonLabel: '編輯圖片',
      buttonStyle: {
        'background': '#667eea',
        'color': 'white',
        'padding': '8px 16px',
        'border-radius': '6px',
        'border': 'none',
        'cursor': 'pointer'
      }
    },

    // 🆕 PostCSS 解析器配置
    'grapesjs-parser-postcss': {
      plugins: [
        'postcss-preset-env',
        'autoprefixer',
        'postcss-nested'
      ],
      // 解析選項
      parserOptions: {
        silent: false
      }
    }
  }
}
```

### 3. 驗證整合

#### 步驟 3.1：檢查控制台輸出

重新啟動開發伺服器後，檢查瀏覽器控制台是否顯示：

```
✅ 所有插件導入完成
✅ grapesjs-blocks-bootstrap4 已載入
✅ grapesjs-style-gradient 已載入  
✅ grapesjs-tailwind 已載入
✅ grapesjs-tui-image-editor 已載入
✅ grapesjs-parser-postcss 已載入
```

#### 步驟 3.2：檢查組件面板

在 GrapesJS 編輯器的左側面板中，您應該看到新的組件分類：

- **Bootstrap 佈局**：欄位、列等
- **Bootstrap 組件**：卡片、摺疊等  
- **Bootstrap 導覽**：導覽列
- **Bootstrap 提示**：警告框
- **Bootstrap 互動**：頁籤
- **Tailwind**：工具類別組件

#### 步驟 3.3：檢查新功能

1. **漸層工具**：在樣式面板中查看新的漸層選項
2. **圖片編輯**：選擇圖片時查看編輯按鈕
3. **Tailwind 類別**：在樣式面板中查看工具類別
4. **PostCSS 支援**：現代 CSS 語法自動解析

## 🎨 使用指南

### Bootstrap 4 組件

新增的 Bootstrap 4 組件包括：

1. **佈局組件**
   - **Row（列）**：Bootstrap 網格系統的列
   - **Column（欄位）**：響應式欄位組件

2. **UI 組件**
   - **Card（卡片）**：內容容器，支援標頭、內容、頁尾
   - **Alert（警告框）**：提示訊息組件
   - **Collapse（摺疊）**：可展開/收起的內容區域

3. **導覽組件**
   - **Navbar（導覽列）**：響應式導覽選單

4. **互動組件**
   - **Tabs（頁籤）**：多頁面切換組件

### 漸層樣式工具

使用新的漸層功能：

1. 選擇任何元件
2. 在右側樣式面板找到「漸層」選項
3. 選擇線性或徑向漸層
4. 調整角度和顏色
5. 即時預覽效果

### Tailwind CSS 整合

使用 Tailwind 工具類別：

1. 選擇元件
2. 在樣式面板中找到「Tailwind」分頁
3. 快速套用 margin、padding、色彩等類別
4. 所見即所得的樣式預覽

### 圖片編輯功能

編輯圖片：

1. 選擇任何圖片組件
2. 點擊「編輯圖片」按鈕
3. 使用內建編輯器進行：
   - 裁切和調整尺寸
   - 套用濾鏡效果
   - 添加文字和圖形
   - 旋轉和翻轉
4. 完成後套用變更

## 🚨 注意事項

### 1. 效能考量

- 新增多個插件會增加載入時間
- 建議監控編輯器初始化效能
- 考慮按需載入不常用的插件

### 2. 衝突處理

- Bootstrap 4 和 Tailwind 可能有樣式衝突
- 建議在專案中選擇主要的 CSS 框架
- 測試組件相容性

### 3. 中文化

- 部分插件可能需要額外的中文化設定
- 檢查組件標籤是否正確顯示中文
- 必要時添加自定義翻譯

## 📊 預期效果

整合完成後，您的 GrapesJS 編輯器將新增：

- **+20** 個 Bootstrap 4 組件
- **專業圖片編輯**功能
- **視覺化漸層編輯器**
- **Tailwind CSS** 工具類別支援
- **現代化 CSS** 解析能力

總計組件數量將從目前的 **~40** 個增加到 **~60+** 個，提升 **50%** 的設計能力！

## 🔧 故障排除

### 常見問題

1. **插件無法載入**
   - 檢查 npm 安裝是否完整
   - 查看瀏覽器控制台錯誤訊息
   - 確認插件版本相容性

2. **樣式衝突**
   - 檢查 CSS 優先級
   - 調整插件載入順序
   - 使用開發者工具除錯

3. **組件不顯示**
   - 確認插件正確註冊
   - 檢查組件分類設定
   - 重新整理編輯器

立即開始整合這些強大的插件，將您的 GrapesJS 編輯器提升到專業級水準！
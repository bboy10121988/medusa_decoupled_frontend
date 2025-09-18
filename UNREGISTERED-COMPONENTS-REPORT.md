# 已下載但未註冊的組件庫清單

## 📊 總覽
- **已安裝的 GrapesJS 相關套件**: 17 個
- **已註冊並在編輯器中使用**: 8 個
- **已下載但未註冊**: 9 個
- **自定義組件狀態**: 部分註冊

---

## ✅ 已註冊並使用的插件 (8 個)

| 套件名稱 | 功能描述 | 狀態 |
|---------|---------|------|
| `grapesjs-preset-webpage` | 網頁預設模板 | ✅ 已註冊 |
| `grapesjs-blocks-basic` | 基本佈局區塊 | ✅ 已註冊 |
| `grapesjs-plugin-forms` | 表單組件 | ✅ 已註冊 |
| `grapesjs-component-countdown` | 倒數計時器 | ✅ 已註冊 |
| `grapesjs-tabs` | 分頁組件 | ✅ 已註冊 |
| `grapesjs-custom-code` | 自定義代碼 | ✅ 已註冊 |
| `grapesjs-tooltip` | 工具提示 | ✅ 已註冊 |
| `grapesjs-typed` | 打字機效果 | ✅ 已註冊 |

---

## ❌ 已下載但未註冊的插件 (9 個)

### 1. 輪播相關 (2 個)
| 套件名稱 | 功能描述 | 未註冊原因 | 建議行動 |
|---------|---------|-----------|---------|
| `grapesjs-carousel` | 原生輪播組件 | 相容性問題 | 🔧 需修復相容性 |
| `grapesjs-carousel-component` | 輪播組件增強版 | 代碼中有但未在插件列表 | 🚀 可立即註冊 |

### 2. 樣式與佈局 (3 個)
| 套件名稱 | 功能描述 | 未註冊原因 | 建議行動 |
|---------|---------|-----------|---------|
| `grapesjs-blocks-bootstrap4` | Bootstrap 4 組件 | 新增但未測試 | 🚀 可立即註冊 |
| `grapesjs-style-gradient` | 漸層樣式 | 新增但未測試 | 🚀 可立即註冊 |
| `grapesjs-tailwind` | Tailwind CSS 支援 | 類型問題 | 🔧 需修復類型定義 |

### 3. 解析與處理 (1 個)
| 套件名稱 | 功能描述 | 未註冊原因 | 建議行動 |
|---------|---------|-----------|---------|
| `grapesjs-parser-postcss` | PostCSS 解析器 | 新增但未測試 | 🚀 可立即註冊 |

### 4. 圖片編輯 (1 個)
| 套件名稱 | 功能描述 | 未註冊原因 | 建議行動 |
|---------|---------|-----------|---------|
| `grapesjs-tui-image-editor` | 圖片編輯器 | 新增但未測試 | 🚀 可立即註冊 |

### 5. React 集成 (1 個)
| 套件名稱 | 功能描述 | 未註冊原因 | 建議行動 |
|---------|---------|-----------|---------|
| `@grapesjs/react` | React 封裝 | 未在當前編輯器中使用 | 🤔 考慮重構使用 |

---

## 🎨 自定義組件狀態

### ✅ 已註冊的自定義組件
1. **page-components** - 頁面組件群組 (Hero Section、Service Cards 等)
2. **material-ui** - Material UI 組件

### 📝 已實作但未完全註冊的組件
| 檔案名稱 | 包含組件 | 註冊狀態 | 建議行動 |
|---------|---------|---------|---------|
| `advanced-ui-components.ts` | Modal、Tooltip、Progress Bar 等 | 🔄 動態載入但未在 registry | 🔧 需加入 registry |
| `additional-ui-components.ts` | Accordion、Tabs 進階版 | 🔄 動態載入但未在 registry | 🔧 需加入 registry |

### 🗂️ 備份和移除的組件
- `carousel-components-old.ts` - 舊版輪播組件
- `enhanced-carousel-components-removed.ts` - 已移除的增強輪播
- `carousel-styles-removed.css` - 已移除的輪播樣式

---

## 📋 立即可執行的註冊任務

### 🚀 優先級：高 (可立即註冊)
1. `grapesjs-carousel-component` - 輪播組件
2. `grapesjs-blocks-bootstrap4` - Bootstrap 4 組件
3. `grapesjs-style-gradient` - 漸層樣式
4. `grapesjs-parser-postcss` - PostCSS 解析器
5. `grapesjs-tui-image-editor` - 圖片編輯器

### 🔧 優先級：中 (需修復後註冊)
1. `grapesjs-tailwind` - 修復類型定義問題
2. `grapesjs-carousel` - 修復相容性問題

### 🤔 優先級：低 (需評估)
1. `@grapesjs/react` - 考慮是否重構使用 React 版本

---

## 🔧 具體執行建議

### 1. 立即註冊未使用插件
```typescript
// 在 grapes_editor.tsx 的 plugins 陣列中加入：
pluginCarouselComponent,    // grapesjs-carousel-component
// pluginBootstrap4,        // 已存在但可能需調整
// pluginGradient,          // 已存在但可能需調整
// pluginPostCSS,           // 已存在但可能需調整
// pluginImageEditor        // 已存在但可能需調整
```

### 2. 整合自定義組件到註冊系統
```typescript
// 在 components-registry.ts 中加入：
{
  name: 'advanced-ui',
  register: registerAdvancedUIComponents,
  description: '進階 UI 組件 - Modal、Tooltip、Progress Bar 等',
  category: 'Advanced UI'
},
{
  name: 'additional-ui',
  register: registerAdditionalUIComponents,
  description: '額外 UI 組件 - Accordion、Tabs 進階版',
  category: 'Additional UI'
}
```

### 3. 修復問題插件
- **grapesjs-tailwind**: 檢查類型定義，可能需要更新 TypeScript 配置
- **grapesjs-carousel**: 查看相容性問題的具體錯誤信息

---

## 📈 效益評估

### 立即註冊所有可用插件的好處：
1. **擴展功能** - 提供更多組件選項給用戶
2. **增強體驗** - 豐富的 UI 組件庫
3. **提升效率** - 減少自定義組件開發時間

### 注意事項：
1. **效能影響** - 過多插件可能影響載入速度
2. **維護成本** - 更多插件意味著更多潛在問題
3. **UI 複雜度** - 組件過多可能造成界面混亂

建議採用**逐步註冊**的策略，優先註冊高需求的組件。
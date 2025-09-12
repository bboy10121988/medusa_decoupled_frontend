# GrapesJS 與 Sanity 整合

這個整合將 GrapesJS 視覺化編輯器與 Sanity CMS 結合，提供完整的頁面管理和內容儲存解決方案。

## 功能特色

### 📝 完整的頁面管理
- 創建、編輯、刪除頁面
- 頁面狀態管理（草稿、預覽、已發布）
- 頁面版本控制和編輯歷史
- 自動儲存功能

### 🎨 視覺化編輯
- 拖拽式頁面建構
- 即時預覽
- 響應式設計支援
- 豐富的元件庫

### 🏠 首頁模組整合
- 主橫幅 (Main Banner)
- 服務卡片區塊 (Service Cards)
- 特色產品 (Featured Products)
- 部落格區塊 (Blog Section)
- YouTube 區塊 (YouTube Section)
- 圖文區塊 (Image Text Block)
- 內容區塊 (Content Section)

### 🗄️ Sanity CMS 整合
- 完整的 CRUD 操作
- 結構化內容儲存
- SEO 支援
- 多媒體資產管理

## 檔案結構

```
src/
├── components/grapesjs/
│   ├── grapes_editor_with_sanity.tsx    # 主編輯器組件
│   ├── grapes-editor.css                # 編輯器樣式
│   └── plugins/
│       └── enhanced-home-modules.ts     # 首頁模組插件
├── lib/services/
│   └── grapesjs-page-service.ts         # Sanity 服務層
├── schemas/
│   └── grapesJSPageV2.ts               # Sanity 頁面結構
└── app/test-grapesjs-sanity/
    └── page.tsx                        # 測試頁面
```

## 使用方式

### 基本用法

```tsx
import GrapesEditorWithSanity from '@/components/grapesjs/grapes_editor_with_sanity'

export default function MyEditor() {
  const handleSave = (pageData) => {
    console.log('頁面已儲存:', pageData)
  }

  const handlePageChange = (pageId) => {
    console.log('切換到頁面:', pageId)
  }

  return (
    <GrapesEditorWithSanity 
      onSave={handleSave}
      onPageChange={handlePageChange}
    />
  )
}
```

### 編輯特定頁面

```tsx
<GrapesEditorWithSanity 
  pageId="specific-page-id"
  onSave={handleSave}
  onPageChange={handlePageChange}
/>
```

## API 接口

### grapesJSPageService

```typescript
// 取得所有頁面
const pages = await grapesJSPageService.getAllPages()

// 取得特定頁面
const page = await grapesJSPageService.getPageById(pageId)

// 創建新頁面
const newPage = await grapesJSPageService.createPage({
  title: '頁面標題',
  slug: 'page-slug',
  description: '頁面描述',
  status: 'draft'
})

// 更新頁面
const updatedPage = await grapesJSPageService.updatePage({
  _id: pageId,
  grapesHtml: htmlContent,
  grapesCss: cssStyles,
  grapesComponents: componentData,
  grapesStyles: styleData
})

// 刪除頁面
await grapesJSPageService.deletePage(pageId)

// 複製頁面
const duplicatedPage = await grapesJSPageService.duplicatePage(pageId, newTitle)

// 檢查 slug 可用性
const isAvailable = await grapesJSPageService.isSlugAvailable('new-slug')

// 搜索頁面
const results = await grapesJSPageService.searchPages('搜索關鍵字')
```

## 資料結構

### GrapesJSPageData 介面

```typescript
interface GrapesJSPageData {
  _id?: string
  title: string
  slug: string
  description?: string
  status: 'draft' | 'preview' | 'published'
  
  // GrapesJS 編輯器資料
  grapesHtml?: string
  grapesCss?: string
  grapesComponents?: any
  grapesStyles?: any
  
  // 首頁模組（如果適用）
  homeModules?: any[]
  
  // SEO 設定
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  
  // 系統欄位
  createdAt?: string
  updatedAt?: string
  version?: number
  editHistory?: any[]
}
```

## 編輯器功能

### 工具列按鈕
- **📱 響應式預覽**: 桌面、平板、手機檢視
- **💾 儲存到 Sanity**: 將變更保存到 Sanity CMS
- **📤 從 Sanity 載入**: 載入現有頁面
- **➕ 新頁面**: 創建新的頁面

### 側邊欄面板
- **左側**: 區塊庫和組件
- **右側**: 屬性設定、樣式管理、圖層管理

### 自動功能
- **自動儲存**: 30秒後自動儲存變更
- **離開提醒**: 未儲存變更時的離開提醒
- **即時狀態**: 顯示儲存狀態和最後儲存時間

## 首頁模組配置

每個首頁模組都有豐富的設定選項：

### 主橫幅 (Main Banner)
- 標題、副標題、描述文字
- 背景圖片、視頻
- 按鈕設定（文字、連結、樣式）
- 動畫效果

### 服務卡片區塊
- 卡片數量和排列
- 每張卡片的圖示、標題、描述
- 連結設定

### 特色產品
- 產品選擇
- 顯示方式
- 購買按鈕設定

## 部署注意事項

1. 確保 Sanity 項目已正確設定
2. 環境變數配置正確
3. 必要的依賴已安裝：
   ```bash
   npm install grapesjs @sanity/client
   ```

## 開發計畫

### 已完成
- ✅ 基本 GrapesJS 編輯器整合
- ✅ Sanity CMS 資料存取層
- ✅ 完整的 CRUD 操作
- ✅ 首頁模組插件
- ✅ 響應式設計支援

### 進行中
- 🔄 頁面預覽系統
- 🔄 發布流程
- 🔄 版本控制界面

### 計畫中
- 📋 模板系統
- 📋 多語言支援
- 📋 SEO 優化工具
- 📋 效能分析

## 故障排除

### 常見問題

1. **編輯器載入失敗**
   - 檢查 GrapesJS 依賴是否正確安裝
   - 確認網路連接

2. **儲存失敗**
   - 檢查 Sanity 連接設定
   - 確認權限配置

3. **樣式問題**
   - 清除瀏覽器快取
   - 檢查 CSS 檔案載入

### 除錯模式

開啟瀏覽器開發者工具的控制台，查看詳細的錯誤訊息和日誌。

## 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個整合！

## 授權

MIT License
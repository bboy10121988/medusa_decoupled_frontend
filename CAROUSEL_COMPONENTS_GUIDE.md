# 🎠 高級 Carousel 組件使用指南

## 概述

我們已經為你的 GrapesJS 編輯器新增了三種專業級的 Carousel 組件，每種都具有獨特的功能和用途：

### 📁 文件結構

```
src/components/grapesjs/custom-components/
├── carousel-components.ts      # 主要組件邏輯
├── carousel-styles.css         # 專用樣式文件
```

```
public/
└── carousel-demo.html          # 演示頁面
```

## 🎯 組件類型

### 1. Hero Carousel - 全寬大圖輪播 🏞️

**適用場景**: 網站首頁橫幅、產品展示頁面的主要視覺區域

**特色功能**:
- ✅ **真正的全寬顯示** - 使用 `100vw` 突破容器限制
- ✅ **多種切換效果** - 滑動、淡入淡出、3D 立方體、流動效果
- ✅ **自動播放** - 可自定義間隔時間
- ✅ **響應式高度** - 可調整 200px-800px
- ✅ **鍵盤導航** 和 **滑鼠滾輪** 支援

**可配置選項**:
- 自動播放開關與間隔
- 無限循環
- 導航箭頭顯示/隱藏
- 分頁指示器顯示/隱藏
- 切換效果選擇
- 自定義高度

### 2. Product Carousel - 產品展示輪播 🛍️

**適用場景**: 電商產品列表、相關商品推薦、商品展示頁面

**特色功能**:
- ✅ **多項目顯示** - 支援 1-6 項同時顯示
- ✅ **智慧響應式** - 根據螢幕大小自動調整顯示數量
- ✅ **自由滾動模式** - 支援平滑滾動體驗
- ✅ **居中顯示模式** - 突出展示中央項目
- ✅ **產品卡片動效** - 懸停時的精美動畫效果

**可配置選項**:
- 每頁顯示數量 (1-6)
- 項目間距 (0-50px)
- 自動播放開關
- 自由滾動模式
- 居中顯示模式

### 3. Gallery Carousel - 圖片畫廊 🖼️

**適用場景**: 產品詳情頁、作品集展示、新聞圖片集

**特色功能**:
- ✅ **縮圖預覽** - 支援底部或右側縮圖導航
- ✅ **圖片縮放** - 內建縮放功能 (1x-3x)
- ✅ **雙向同步** - 主圖與縮圖完美聯動
- ✅ **觸控友善** - 支援觸控設備操作
- ✅ **無障礙設計** - 鍵盤導航與焦點管理

**可配置選項**:
- 縮圖顯示開關
- 縮圖位置 (底部/右側)
- 圖片縮放支援

## 🔧 技術整合

### 1. Swiper.js 整合
- **版本**: Swiper 11 (最新版本)
- **CDN 自動載入**: 無需手動添加 CSS/JS
- **模組化載入**: 只載入需要的功能

### 2. 自動化資源管理
```typescript
import { registerCarouselComponents, loadSwiperAssets } from './custom-components/carousel-components'

// 載入 Swiper 資源
loadSwiperAssets()

// 註冊組件到編輯器
registerCarouselComponents(editor)
```

### 3. 樣式系統
- **全域樣式**: 自動注入的基礎樣式
- **組件樣式**: 每個組件的專屬樣式
- **響應式設計**: 完整的移動設備支援
- **編輯器相容**: 在 GrapesJS 編輯器中完美顯示

## 📱 響應式支援

### 斷點設計
```css
@media (max-width: 768px) {
  /* 手機版適配 */
  - Hero Carousel: 高度調整至 400px
  - Product Carousel: 顯示 1-2 項
  - Gallery: 優化觸控操作
}

@media (min-width: 1024px) {
  /* 桌面版優化 */
  - 完整功能顯示
  - 懸停效果啟用
  - 鍵盤導航
}
```

## 🎨 自定義樣式

### CSS 類名規範
```css
/* Hero Carousel */
.hero-carousel-container    /* 容器 */
.hero-swiper               /* Swiper 實例 */
.slide-content             /* 幻燈片內容 */

/* Product Carousel */
.product-carousel-container /* 容器 */
.product-swiper            /* Swiper 實例 */
.product-card              /* 產品卡片 */

/* Gallery Carousel */
.gallery-carousel-container /* 容器 */
.gallery-main-swiper       /* 主圖 Swiper */
.gallery-thumbs-swiper     /* 縮圖 Swiper */
```

## 🚀 使用方式

### 在 GrapesJS 編輯器中使用

1. **打開編輯器**
2. **查找"高級組件"分類**
3. **選擇所需的 Carousel 類型**:
   - 🏞️ Hero 輪播
   - 🛍️ 產品輪播  
   - 🖼️ 圖片畫廊
4. **拖拽到頁面中**
5. **在右側面板調整設定**

### 手動編碼使用

查看 `public/carousel-demo.html` 文件，裡面包含了完整的使用範例。

## 🔍 效能優化

### 自動化優化
- **懶載入**: 圖片按需載入
- **硬體加速**: 使用 GPU 加速動畫
- **記憶體管理**: 自動清理未使用的實例
- **CDN 快取**: 利用 CDN 加速資源載入

### 載入策略
```typescript
// 資源去重載入
if (!document.querySelector('#swiper-css')) {
  // 載入 CSS
}

if (!window.Swiper) {
  // 載入 JS
}
```

## 🎯 最佳實踐

### 1. Hero Carousel
- 建議使用高品質圖片 (至少 1920x600)
- 保持文字內容簡潔有力
- 設定合適的自動播放間隔 (3-8秒)

### 2. Product Carousel
- 確保產品圖片尺寸一致
- 保持產品描述長度相近
- 適當設定項目間距

### 3. Gallery Carousel
- 使用相同比例的圖片
- 啟用圖片壓縮以提升載入速度
- 考慮使用 WebP 格式

## 🐛 疑難排解

### 常見問題

**Q: 組件不顯示？**
A: 確保 Swiper.js 已正確載入，檢查瀏覽器控制台是否有錯誤

**Q: 全寬效果無效？**
A: 確認父容器沒有 `overflow: hidden` 或固定寬度限制

**Q: 在編輯器中顯示異常？**
A: 這是正常現象，請在預覽模式或發布後查看實際效果

**Q: 移動設備上操作不順暢？**
A: 確保沒有其他 JavaScript 庫衝突，檢查觸控事件綁定

### 調試技巧
```javascript
// 檢查 Swiper 是否載入
console.log('Swiper loaded:', typeof Swiper !== 'undefined')

// 檢查組件是否註冊
console.log('Components:', window.grapesEditor.Components.getTypes())
```

## 📄 更新日誌

### v1.0.0 (當前版本)
- ✅ 三種基礎 Carousel 組件
- ✅ Swiper 11 整合
- ✅ 完整響應式支援
- ✅ GrapesJS 編輯器整合
- ✅ 自動資源管理

---

## 🤝 技術支援

如有任何問題，請查看：
1. `public/carousel-demo.html` - 完整演示
2. `src/components/grapesjs/grapes_editor.tsx` - 編輯器整合
3. 瀏覽器開發者工具的控制台輸出

**享受你的新 Carousel 組件！** 🎉
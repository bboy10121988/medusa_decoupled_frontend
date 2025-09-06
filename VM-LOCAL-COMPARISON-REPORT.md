# VM vs Local 代碼比較分析報告

## 📋 結構對比分析

### ✅ **相同且已同步的部分**
1. **產品相關組件** - `/src/modules/products/components/` 目錄結構一致
2. **配置文件** - `src/lib/config.ts` 基本一致
3. **購物車邏輯** - `src/lib/data/cart.ts` 已使用 HttpTypes
4. **產品數據** - `src/lib/data/products.ts` 已同步 VM 的 getProduct 函數

### ⚠️ **VM 有但本地缺失的重要文件**

#### 1. 促銷系統文件 (高優先級)
- `src/promotion-utils.ts` (907 行) - **完整的促銷標籤和折扣計算系統**
- `src/simple-promotion-utils.ts` - 簡化版促銷工具

#### 2. API 工具文件
- `src/medusa-api.ts` - 優化的 Medusa API 客戶端
- `src/request-deduplicator.ts` - 請求去重工具

#### 3. 組件和上下文文件
- `src/components/ThemeSwitcher.tsx` - 主題切換器
- `src/context/` 目錄下多個上下文文件
  - `cart-context.tsx`
  - `region-context.tsx`
  - `ThemeContext.tsx`
  - `modal-context.tsx`
  - `product-context.tsx`

#### 4. 工具文件
- `src/cache.ts` - 快取管理
- `src/seo.ts` - SEO 工具
- `src/store-name.ts` - 商店名稱管理

### 🔄 **類型系統差異 (需修復)**

#### 本地仍使用 LocalHttpTypes 的文件：
1. `src/lib/data/regions.ts` ❌
2. `src/lib/data/collections.ts` ❌
3. `src/lib/data/categories.ts` ❌

#### VM 統一使用 HttpTypes：
- 所有數據層文件都使用 `@medusajs/types` 的 `HttpTypes`

### 📦 **依賴版本差異**

#### VM 版本：
- `next`: "^15.3.1" 
- 簡潔的依賴配置

#### 本地版本：
- `next`: "^15.5.2"
- 更多額外依賴 (FontAwesome, Mux, ioredis 等)

## 🎯 **重組建議**

### Phase 1: 類型統一 (立即執行)
1. 將 `regions.ts`, `collections.ts`, `categories.ts` 改為使用 `HttpTypes`
2. 確保所有數據層文件類型一致

### Phase 2: 核心功能同步 (高優先級)
1. 同步 `promotion-utils.ts` - 完整的促銷系統
2. 同步 `medusa-api.ts` - 優化的 API 客戶端
3. 添加 `cache.ts` - 快取管理功能

### Phase 3: 組件和上下文 (中優先級)  
1. 同步缺失的上下文文件
2. 添加 `ThemeSwitcher.tsx`
3. 更新相關組件使用新的上下文

### Phase 4: 工具和優化 (低優先級)
1. 同步 SEO 和其他工具文件
2. 評估並整合有用的優化功能

## 🚀 **推薦的最佳代碼組合**

### 保持本地優勢：
- 更新的 Next.js 版本 (15.5.2)
- Sanity CMS 集成
- 聯盟行銷系統
- ECPay 支付集成

### 從 VM 獲取：
- 促銷系統 (`promotion-utils.ts`)
- 統一的類型系統 (HttpTypes)
- 優化的 API 客戶端
- 快取管理系統

### 混合策略：
- 保持本地的功能擴展
- 採用 VM 的核心穩定性
- 統一類型系統保證兼容性

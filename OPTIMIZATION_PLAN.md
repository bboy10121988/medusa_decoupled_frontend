# 全面專案優化計畫 (Project Optimization Plan)

本文件基於對 `medusa_decoupled/frontend` 專案的代碼審查，列出了針對性能、代碼品質、架構與 SEO 的優化建議。

## 1. 執行摘要 (Executive Summary)

專案目前的基礎架構良好，使用了 Next.js App Router、Sanity CMS 與 Medusa V2。然而，在圖片優化、中間件效能、以及代碼規範上存在顯著的改進空間。特別是 `next/image` 的未充分利用與中間件中的同步阻塞操作，可能是效能瓶頸。

## 2. 關鍵問題 (Critical Issues - Priority 1)

這些問題可能影響生產環境的穩定性或安全性，建議優先處理。

### 2.1 建置配置風險
- **問題**: `next.config.js` 中啟用了 `eslint.ignoreDuringBuilds: true` 與 `typescript.ignoreBuildErrors: true`。
- **風險**: 這允許包含錯誤的代碼被部署到生產環境，可能導致運行時崩潰。
- **建議**: 修復現有的 Lint 與 Type 錯誤，並移除這些標誌。

### 2.2 中間件效能瓶頸
- **問題**: `src/middleware.ts` 在每次請求時都可能觸發對 Medusa 後端的 `fetch` 請求，且設定了長達 5 秒的超時。
- **風險**: 這會顯著增加 TTFB (Time to First Byte)，如果後端回應緩慢，整個網站都會變慢。
- **建議**: 
    - 使用 Edge Config 或 Redis (如 Vercel KV) 來緩存區域設定，而非依賴全域變數 (在 Serverless 環境不穩定)。
    - 考慮將區域檢測邏輯移至客戶端或非阻塞的 Server Component。

### 2.3 依賴管理
- **問題**: `package.json` 中包含 `grapesjs` 等大型庫，且似乎直接打包在主 Bundle 中。
- **風險**: 增加首屏載入時間 (FCP/LCP)。
- **建議**: 檢查是否可以使用動態導入 (`next/dynamic`) 來延遲加載編輯器相關組件。

## 3. 性能優化 (Performance - Priority 2)

### 3.1 圖片優化 (Image Optimization)
- **問題**: `Hero` 組件 (`src/modules/home/components/hero/index.tsx`) 使用了標準的 `<img>` 標籤而非 `next/image`。
- **影響**: 圖片未經壓縮、格式轉換 (WebP/AVIF) 與尺寸調整，導致 LCP (Largest Contentful Paint) 分數低落。
- **建議**: 全面替換為 `next/image` 組件，並配置 `sanity-image-loader` 以利用 Sanity 的 CDN 圖像處理功能。

### 3.2 數據獲取策略
- **問題**: `src/lib/sanity.ts` 中的 `safeFetch` 為每個請求創建新的 `AbortController`，且 `getHomepage_old` 獲取了過多未過濾的數據。
- **建議**: 
    - 優化 GROQ 查詢，只獲取需要的欄位 (Projection)。
    - 移除不必要的 `AbortController` 開銷，Next.js 已有內建的 fetch 超時處理機制。

### 3.3 字體優化
- **檢查**: 確認是否使用了 `next/font` 來加載 Google Fonts，避免 Layout Shift (CLS)。

## 4. 代碼品質與架構 (Code Quality - Priority 3)

### 4.1 代碼重構
- **問題**: `src/lib/sanity.ts` 文件過大 (1000+ 行)，職責混雜 (Client 設定、查詢定義、數據獲取)。
- **建議**: 拆分為 `src/lib/sanity/client.ts`, `src/lib/sanity/queries.ts`, `src/lib/sanity/fetch.ts`。

### 4.2 類型安全
- **問題**: 專案中存在許多 `any` 類型定義 (如 `safeFetch` 的回傳值)。
- **建議**: 定義完整的 Sanity Schema TypeScript 接口，並使用 Zod 進行運行時驗證。

### 4.3 React 最佳實踐
- **問題**: `next.config.js` 中關閉了 `reactStrictMode`。
- **建議**: 重新啟用 `reactStrictMode` 以便在開發階段發現潛在的副作用與過時 API 使用。

## 5. SEO 與可訪問性 (SEO & Accessibility - Priority 4)

### 5.1 結構化數據 (JSON-LD)
- **問題**: `generateJsonLd` 函數散落在頁面組件中。
- **建議**: 建立統一的 `src/lib/seo/json-ld.ts` 工具庫，統一管理 `Organization`, `Product`, `Breadcrumb` 等 Schema。

### 5.2 語意化 HTML
- **檢查**: 確保按鈕使用 `<button>` 而非 `<div>`，圖片包含 `alt` 屬性 (目前 Hero 組件已有處理，需確保全站一致)。

## 6. 具體行動清單 (Action Plan)

1.  **[立即]** 啟用 `next/image` 替換首頁 Hero 圖片。
2.  **[立即]** 修復 TypeScript 錯誤並在 `next.config.js` 中啟用嚴格檢查。
3.  **[短期]** 重構 `src/lib/sanity.ts`，拆分檔案。
4.  **[短期]** 優化 `middleware.ts`，減少阻塞式 Fetch。
5.  **[長期]** 引入 Bundle Analyzer 分析 `grapesjs` 的影響並進行拆分。

---
*報告生成時間: 2025-11-23*

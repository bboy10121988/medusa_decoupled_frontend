# GrapesJS 子系統架構導覽（前端）

本文件協助快速理解 GrapesJS 相關程式的結構、責任劃分與資料流。建議先快速掃過，再依需求深入對應檔案。

## 入口與主要模組

- 入口元件：`src/components/grapesjs/grapes_editor.tsx`
  - 職責：初始化 GrapesJS、掛載插件、設定面板與事件、載入/儲存頁面、整合資產管理器（Sanity）。
  - 常見你會找的東西：
    - 插件載入與設定
    - 面板按鈕與命令（save、workspace、挑圖器）
    - 內容載入（Sanity）與儲存流程
    - i18n（繁中化）初始化

### 子模組（依關注點劃分）

- i18n：`src/components/grapesjs/i18n/zh-TW.ts`
  - 將 GrapesJS UI、Style Manager 分組/屬性/常見選項翻成繁中，並在 `editor.load` 時再套一次，避免外掛覆蓋。

- 自訂元件：`src/components/grapesjs/custom-components/*`
  - 定義可拖放的自訂元件（Hero Section 等）。

- 首頁模組插件：`src/components/grapesjs/plugins/enhanced-home-modules.ts`
  - 為首頁打造的模組化區塊（Hero、Service Cards、Image+Text 等），含 traits 設定與預覽樣式。

- 第三方插件微調：
  - 程式：`src/components/grapesjs/plugins/third-party-customization.ts`
  - 設定：`src/components/grapesjs/config/plugins-config.ts`
  - 樣式覆寫：`src/components/grapesjs/third-party-plugins-custom.css`

- 資產挑圖器（Sanity）：`src/components/grapesjs/sanity-image-picker.ts`
  - 以 API 提供搜尋/排序/分頁、上傳（走 `/api/sanity/upload`）、並回填 Sanity CDN URL。

- Sanity 服務：
  - 讀取/URL Builder：`src/lib/services/sanity-media-service.ts`
  - 列表 API：`src/app/api/sanity/assets/route.ts`
  - 上傳 API：`src/app/api/sanity/upload/route.ts`

## 事件與資料流（重點）

1) 初始化與插件
   - `grapes_editor.tsx` 內 `grapesjs.init({ plugins, pluginsOpts })` → 載入 GrapesJS 與第三方插件。
   - 初始化後立即呼叫 `applyZhTW(editor)`，並在 `editor.on('load')` 再套用一次。

2) 資產流程
   - 使用自訂命令 `open-sanity-image-picker` 打開挑圖器（或 `asset:select` 事件處理直接回填）。
   - 上傳走 `/api/sanity/upload`（伺服器端使用 `@sanity/client`）→ 回傳 CDN URL。
   - 內容儲存時不再將 `<img>` 轉成 `data:`，只存外部 URL（Sanity CDN）。

3) 頁面載入/儲存（Sanity）
   - 載入：以服務查到目前頁面，將 `grapesHtml/Css` 或結構化資料載入編輯器。
   - 儲存：以 `/api/pages/save`（既有流程）送出；儲存前有 data URI 檢查（阻擋 base64 內嵌圖）。

## 常見修改入口（對照表）

- 想新增/調整 GrapesJS UI 文案（繁中）：`i18n/zh-TW.ts`
- 想新增自訂元件：`custom-components/*`，並在 `grapes_editor.tsx` 的 `registerCustomComponents(editor)` 中掛載。
- 想改首頁用的模組（可拖拉的區塊）：`plugins/enhanced-home-modules.ts`
- 想改第三方插件區塊的外觀/標籤：`plugins/third-party-customization.ts` + `config/plugins-config.ts`
- 想改挑圖器功能：`sanity-image-picker.ts`（UI/流程）與 `/api/sanity/*` 路由（資料）。

## 複雜度來源與建議閱讀順序

複雜度來源：
- `grapes_editor.tsx` 職責過多（初始化、面板、命令、資產、儲存、工作區 UI 等），且混用 DOM 操作與 GrapesJS API。
- 第三方外掛各自注入樣式與分組，需在 `load` 後再次覆蓋設定（如 i18n）。

建議閱讀順序：
1. `grapes_editor.tsx`：先看 `init` 設定、插件載入、面板/命令註冊。
2. `i18n/zh-TW.ts`：了解如何覆蓋 UI/Style Manager 的字串。
3. `sanity-image-picker.ts` 與 `/api/sanity/*`：理解資產挑圖器資料流。
4. `plugins/enhanced-home-modules.ts`：首頁專用模組定義與 traits。
5. `plugins/third-party-customization.ts` + `config/plugins-config.ts`：第三方插件標籤/外觀調整。

## 後續重構建議（分批）

Phase A：職責拆分（不改行為）
- 拆 `grapes_editor.tsx` →
  - `editor/init.ts`（初始化 + pluginsOpts）
  - `editor/panels.ts`（面板與按鈕）
  - `editor/commands.ts`（命令註冊）
  - `editor/assets.ts`（AssetManager 鉤子/選圖器整合）
  - `editor/save.ts`（儲存與驗證）
  - `editor/workspace.ts`（工作區 UI）

Phase B：型別化與 API 封裝
- 移除 `any`，對 GrapesJS 常用介面補型別別名。
- 封裝 Editor 事件訂閱/解除的 helper，避免記憶體洩漏。

Phase C：UI/行為一致性
- 移除直接存取 `document` 的邏輯，改用 `editor.Canvas.getDocument()` 或 GrapesJS 事件。
- 整齊化 log：dev 顯示、prod 降噪。

本文件只做導覽，不更動任何行為，便於後續重構時對照。


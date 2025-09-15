# GrapesJS 重構計畫（提案）

本計畫以「先切職責、後做最佳化」為原則，降低進入門檻與維護成本。

## 目標
- 讓新同仁 30 分鐘能定位到修改入口。
- 移除重複與不一致（i18n、樣式注入、事件註冊）。
- 避免 data URI、Token 外洩、CORS 過鬆等安全風險（已修復維持）。

## 分批內容

### Phase A：檔案職責拆分（不改行為）
- grapes_editor.tsx → 拆為模組：
  - `editor/init.ts`：初始化 + 插件載入 + pluginsOpts
  - `editor/panels.ts`：面板與按鈕註冊
  - `editor/commands.ts`：命令（save、workspace、sanity-picker）
  - `editor/assets.ts`：AssetManager 事件、挑圖器整合
  - `editor/save.ts`：儲存與驗證（禁止 data URI）
  - `editor/workspace.ts`：工作區 UI 與同步

### Phase B：型別與工具
- 提供 `src/components/grapesjs/types.ts`：常用 Editor/Block/Asset/Property 型別 alias。
- 事件註冊 helper：`on(editor, event, handler)` 回傳 off 函式，避免漏解除。

### Phase C：一致性與最佳化
- i18n 覆蓋重構：標準化 sector/prop 對應表，集中於 `i18n/zh-TW.ts`。
- Console 日誌：封裝 logger，prod 降噪。
- 資產挑圖器：保留 UI，抽離資料層至 `lib/services/sanity-assets.ts`（呼叫 /api）。

### Phase D：文件與驗收
- 在 `docs/grapesjs` 維持「導覽 + 改動說明 + 常見任務對照表」。
- 每次重構後以手動 Scenario 驗證：
  - 開啟/關閉面板、切換裝置、拖放、上傳、選圖、儲存。

## 風險控管
- 單 PR 僅做單一 Phase 或單一檔案群組的搬移，避免 diff 過大。
- 搬移過程不混入樣式/功能變更，先確保可編譯、可用。

---
本提案不直接修改行為；若同意，我們可由 Phase A 開始逐檔搬移。

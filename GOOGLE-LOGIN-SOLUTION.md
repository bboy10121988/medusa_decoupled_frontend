# Google 登入解決方案

## 問題說明

我們之前遇到的 Google OAuth 問題：
- **錯誤訊息**: 「無法創建用戶記錄，請檢查 Google OAuth 配置」
- **根本原因**: Medusa SDK 的 `auth.callback()` 返回 JWT token，但沒有正確創建對應的 customer 記錄
- **複雜性**: 前端 callback 邏輯過於複雜，承擔了過多後端責任

## 解決方案對比

### 方案 1: 修復現有 Medusa OAuth (已實現)
**位置**: `src/app/api/auth/google/callback/route.ts`

**優點**:
- 保持與 Medusa 架構一致
- 使用標準 OAuth 2.0 flow

**缺點**:
- 代碼複雜，需要手動解析 JWT 和創建 customer
- 依賴 Medusa SDK 的行為，可能隨版本變更
- 錯誤處理複雜

### 方案 2: Google Identity Services (推薦新方案)
**位置**: 
- 組件: `src/modules/account/components/google-gis-login/index.tsx`
- API: `src/app/api/auth/google/gis-login/route.ts`
- 測試頁面: `src/app/(main)/[countryCode]/test/google-gis/page.tsx`

**優點**:
- ✅ 使用 Google 最新推薦的 Identity Services API
- ✅ 更簡潔的流程，前端直接接收 JWT token
- ✅ 更好的安全性和用戶體驗
- ✅ 減少對 Medusa SDK 的依賴
- ✅ 代碼簡潔，易於維護

**缺點**:
- 需要稍微調整現有的認證流程

## 實現細節

### Google Identity Services 流程

1. **前端**: 載入 Google Identity Services JavaScript 庫
2. **用戶操作**: 點擊 Google 登入按鈕
3. **Google**: 直接返回 JWT credential
4. **前端**: 解析 JWT，提取用戶資訊
5. **後端**: 接收 JWT 和用戶資訊，創建或登入用戶
6. **完成**: 設置認證狀態，重定向到用戶頁面

### 配置要求

1. **環境變數**:
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```

2. **Google Cloud Console 設定**:
   - 啟用 Google Identity Services
   - 設定授權的 JavaScript 來源
   - 設定授權的重定向 URI (如果需要)

### 測試方式

1. **設定環境變數**:
   ```bash
   cp .env.example .env.local
   # 編輯 .env.local，填入你的 GOOGLE_CLIENT_ID
   ```

2. **啟動開發服務器**:
   ```bash
   npm run dev
   ```

3. **測試頁面**:
   訪問: `http://localhost:8000/tw/test/google-gis`

4. **正常登入頁面**:
   可以在 `src/modules/account/templates/login-template.tsx` 中替換現有的 Google 登入按鈕

## 遷移建議

### 立即可用 (推薦)
使用新的 Google Identity Services 方案，因為：
- 解決了現有的所有問題
- 使用 Google 推薦的最新 API
- 代碼更簡潔穩定

### 保留現有方案
如果希望保持與 Medusa 的緊密整合，現有的 callback route 已經修復了主要問題，包含了手動 customer 創建的 fallback 邏輯。

## 技術參考

- [Google Identity Services 總覽](https://developers.google.com/identity/gsi/web/guides/overview?hl=zh-tw)
- [Google One Tap 實現](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap?hl=zh-tw)
- [JWT Token 驗證](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token?hl=zh-tw)

## 目前狀態

### 傳統 Google OAuth (建議使用)
- ✅ **已修復並正常運作**
- ✅ 用戶創建和登入流程完整
- ✅ 包含 fallback 機制
- ✅ 錯誤處理完善

### Google Identity Services (開發中)
- ✅ 前端實作完成
- ✅ JWT 解析正常
- ⚠️ **後端整合待完成** - 需要正確的 Medusa v2 API 配置
- ⚠️ 客戶創建 API 認證問題 (需要正確的 publishable API key 配置)

## 測試

1. **測試 Google Identity Services**: 訪問 `/tw/test/google-gis`
2. **使用穩定的傳統 Google 登入**: 訪問 `/tw/account`

## 技術分析

### 核心問題：認證流程差異

**傳統 Google OAuth 流程**:
1. 用戶點擊「使用 Google 登入」→ Google OAuth 頁面
2. 用戶授權 → Google 返回 authorization code
3. 前端將 code 發送到 `/api/auth/google/callback`
4. 後端調用 `medusa.auth.callback("customer", "google", { code })`
5. Medusa 返回有效的認證 token
6. 使用 token 創建/獲取客戶資料

**Google Identity Services 流程**:
1. 用戶點擊 GIS 按鈕 → 直接顯示 Google 身份選擇器
2. 用戶選擇帳號 → Google 直接返回 JWT token
3. 前端解析 JWT 獲得用戶資料
4. ❌ **問題：沒有 Medusa 認證 token**
5. ❌ 無法調用 Medusa 客戶創建 API

### 解決方案探索

1. **JWT 到 Token 轉換機制**:
   - 需要實作 Google JWT 驗證
   - 創建對應的 Medusa 認證 session
   - 複雜度較高，需要深度整合

2. **保持現有方案**:
   - 傳統 Google OAuth 已完全修復
   - 包含完整的錯誤處理和 fallback
   - 穩定可靠，用戶體驗良好

## 後續步驟（如需完成 GIS 整合）

1. **研究 Medusa v2 認證機制**:
   - 了解如何從 Google JWT 創建有效的 Medusa session
   - 探索是否有管理員 API 可以直接創建客戶
   - 研究自定義認證提供者的實作

2. **實作 JWT 驗證和轉換**:
   - 驗證 Google JWT token 的真實性
   - 創建對應的 Medusa 認證 session
   - 處理用戶創建和登入邏輯

3. **完整測試**:
   - 確保兩種方案都能正常工作
   - 驗證錯誤處理和邊緣情況
   - 優化用戶體驗

## 總結

**目前建議使用傳統 Google OAuth 方案**，因為它：
1. 已完全修復並穩定運作
2. 包含完整的錯誤處理和 fallback 機制
3. 與 Medusa v2 整合良好
4. 提供一致的用戶體驗

**Google Identity Services 方案**具有優勢但需要完成 Medusa API 整合：
1. 使用業界最佳實踐
2. 代碼簡潔易維護
3. 更現代的認證流程
4. 待解決後端 API 認證配置
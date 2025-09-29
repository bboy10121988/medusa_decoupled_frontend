# Google OAuth 問題排查指南

## 🔍 問題分析
錯誤訊息：「授權資料缺少 email，無法建立會員」

## ✅ 已完成的修復

### 1. 後端設定更新
- ✅ 在 `medusa-config.ts` 中加入 `scope: "openid email profile"`
- ✅ 重啟後端服務載入新設定
- ✅ 確認環境變數正確設定

### 2. 前端程式碼改善
- ✅ 改善 email 提取邏輯，支援多種格式
- ✅ 加入詳細的除錯資訊
- ✅ 創建 JWT token 除錯工具

## 🛠️ Google Cloud Console 檢查清單

請確認 Google Cloud Console 設定：

### OAuth 2.0 客戶端設定
1. **授權重新導向 URI**：
   ```
   https://timsfantasyworld.com/tw/auth/google/callback
   ```

2. **OAuth 同意畫面**：
   - 使用者類型：外部
   - 應用程式名稱：已設定
   - 支援電子郵件：已設定
   - 授權網域：`timsfantasyworld.com`

3. **範圍 (Scopes)**：
   - `openid` ✅
   - `profile` ✅ 
   - `email` ✅ (最重要)

### 如何檢查 Google Cloud Console：
1. 前往 https://console.cloud.google.com
2. 選擇專案
3. 前往「API 和服務」→「憑證」
4. 點擊 OAuth 2.0 客戶端 ID
5. 檢查「授權重新導向 URI」
6. 前往「OAuth 同意畫面」檢查範圍設定

## 🧪 測試步驟

1. **清除瀏覽器資料**：
   - 清除 cookies
   - 清除 localStorage
   - 重新載入頁面

2. **測試登入流程**：
   - 點擊 Google 登入按鈕
   - 在開發者工具 Console 中查看除錯資訊
   - 檢查是否有 JWT payload 除錯輸出

3. **查看除錯資訊**：
   ```
   === Google OAuth JWT Debug ===
   Raw Payload: { ... }
   Available fields: [...]
   Email field check: ...
   ```

## 🔧 如果問題持續

### 檢查 Google OAuth 回應
如果除錯工具顯示 JWT payload 中確實沒有 email，可能原因：

1. **Google 帳戶設定**：
   - 使用者的 Google 帳戶可能沒有公開 email
   - 需要用戶在 Google 隱私設定中允許分享 email

2. **OAuth 同意畫面**：
   - 確認在 Google Cloud Console 中已正確設定 email scope
   - 可能需要重新提交 OAuth 同意畫面審核

3. **測試用不同 Google 帳戶**：
   - 嘗試用不同的 Google 帳戶測試
   - 確認是特定帳戶問題還是系統問題

## 📞 需要進一步協助
如果問題仍然存在，請提供：
1. 瀏覽器開發者工具的 Console 除錯輸出
2. Google Cloud Console 的 OAuth 設定截圖
3. 測試用的 Google 帳戶類型（個人/企業）
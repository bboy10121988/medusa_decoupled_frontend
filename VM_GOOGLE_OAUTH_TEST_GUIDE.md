# VM Google OAuth 測試指南

## 📦 快速部署

### 在 VM 上執行以下命令：

```bash
# 1. 進入前端目錄
cd ~/tim-web/medusa_decoupled/frontend

# 2. 拉取最新代碼
git pull origin main

# 3. 查看最新 commit（確認是 Google OAuth 整合）
git log -1

# 4. 重啟前端服務（選擇其中一種）
pm2 restart frontend
# 或
sudo systemctl restart frontend
# 或
npm run dev

# 5. 執行檢查腳本
chmod +x check-google-oauth.sh
./check-google-oauth.sh
```

## 🧪 測試流程

### 1. 訪問登入頁面
```
https://your-vm-domain.com/tw/account
```

### 2. 點擊 "使用 Google 登入" 按鈕
- 應該會重定向到 Google OAuth 頁面
- URL 應該類似: `https://accounts.google.com/o/oauth2/v2/auth?...`

### 3. 選擇 Google 帳號
- 選擇要登入的 Google 帳號
- 授權應用存取基本資料

### 4. 回調處理
- 應該自動重定向回 `https://your-vm-domain.com/tw/auth/google/callback`
- 顯示 "正在驗證您的 Google 身份，請稍候..."

### 5. 登入成功
- 自動重定向到 `https://your-vm-domain.com/tw/account`
- 顯示用戶帳戶資訊

## ✅ 成功標誌

- [ ] 成功重定向到 Google OAuth 頁面
- [ ] 成功選擇 Google 帳號
- [ ] 成功回調到前端
- [ ] 自動重定向到帳戶頁面
- [ ] 顯示用戶名稱和 email
- [ ] Cookie `_medusa_jwt` 已設定
- [ ] 可以正常登出

## ❌ 常見錯誤

### 1. "redirect_uri_mismatch"
**原因**: Google Cloud Console 的 redirect URI 設定不正確

**解決方案**:
在 Google Cloud Console 添加以下 URI:
```
https://your-vm-domain.com/tw/auth/google/callback
https://your-backend-domain.com/auth/google/callback
```

### 2. "No state provided, or session expired"
**原因**: State 驗證失敗或 session 過期

**解決方案**:
- 確保用戶在 5 分鐘內完成流程
- 檢查後端 session 配置

### 3. "Invalid token" 或無法獲取用戶資料
**原因**: JWT token 未正確設定或傳遞

**解決方案**:
- 檢查 CORS 設定
- 確保 `credentials: 'include'` 在所有 fetch 請求中
- 檢查 cookie 的 `sameSite` 和 `secure` 設定

### 4. 登入按鈕無反應
**原因**: JavaScript 錯誤或 SDK 未正確初始化

**解決方案**:
- 打開瀏覽器 Console 查看錯誤
- 檢查 Network tab 是否有 API 請求失敗
- 確認後端 Google OAuth 策略已配置

## 🔍 除錯工具

### 查看瀏覽器 Console
```javascript
// 檢查 SDK 狀態
console.log(window.__MEDUSA_SDK__)

// 檢查 Cookie
document.cookie.split(';').forEach(c => console.log(c.trim()))
```

### 查看後端日誌
```bash
# PM2 日誌
pm2 logs backend

# 或 systemctl 日誌
sudo journalctl -u backend -f
```

### 測試 API Endpoints
```bash
# 測試 customer API
curl -v http://localhost:3000/api/auth/customer \
  -H "Cookie: _medusa_jwt=YOUR_TOKEN"

# 測試後端 auth endpoint
curl -v https://your-backend-domain.com/auth/customer \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 回退到前一版本

如果遇到嚴重問題：

```bash
cd ~/tim-web/medusa_decoupled/frontend

# 查看 commit 歷史
git log --oneline -5

# 回退到前一個 commit
git checkout HEAD~1

# 重啟服務
pm2 restart frontend
```

## 📝 Google Cloud Console 設定檢查清單

### Authorized JavaScript origins
```
https://your-vm-domain.com
http://localhost:3000  (開發環境)
```

### Authorized redirect URIs
```
https://your-backend-domain.com/auth/google/callback
https://your-vm-domain.com/tw/auth/google/callback
http://localhost:3000/tw/auth/google/callback  (開發環境)
http://localhost:9000/auth/google/callback  (後端開發)
```

### 確認配置
- [x] Google+ API 已啟用
- [x] OAuth 2.0 Client 已創建
- [x] Client ID 已配置到後端 `.env`
- [x] Client Secret 已配置到後端 `.env`
- [x] Authorized origins 已配置
- [x] Redirect URIs 已配置

## 🆘 需要協助？

如果測試過程中遇到問題：

1. **查看文檔**: `GOOGLE_OAUTH_INTEGRATION_STATUS.md`
2. **執行檢查腳本**: `./check-google-oauth.sh`
3. **查看 commit 訊息**: `git log -1`
4. **檢查所有文件是否正確**: `git status`

## 📞 聯繫方式

如需技術支援，請提供以下資訊：
- 錯誤訊息（瀏覽器 Console 和後端日誌）
- 執行的步驟
- 當前的 commit hash: `git rev-parse HEAD`
- 環境資訊（VM、瀏覽器版本等）

# Google OAuth 環境變數遷移報告

## 🎯 遷移完成

### ✅ 已處理的檔案

1. **`.env.local`** - 主要本機環境設定
   - 已將所有 Google OAuth 設定註解掉
   - 加上詳細的遷移說明

2. **`.env.local.vm`** - VM 環境設定  
   - 已將 Google OAuth 設定註解掉
   - 保留 VM 相關的 callback URL 資訊

3. **`.env.example`** - 範本檔案
   - 更新說明，指導使用者將 Google 設定移到後端

4. **`backend-env-template.txt`** - 新建
   - 提供完整的後端環境變數設定範本

### 📋 需要移到後端的憑證資訊

```env
# 主要憑證
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Callback URLs
GOOGLE_CALLBACK_URL_LOCAL=http://localhost:3000/auth/google/callback
GOOGLE_CALLBACK_URL=https://timsfantasyworld.com/tw/auth/google/callback
```

### 🔧 後續動作

1. **將憑證移到後端**：
   - 複製 `backend-env-template.txt` 的內容
   - 貼到後端 Medusa 的 `.env` 檔案
   - 根據環境調整對應的 CALLBACK_URL

2. **更新後端 medusa-config.ts**：
   ```typescript
   {
     resolve: "@medusajs/medusa/auth-google",
     id: "google",
     options: {
       clientId: process.env.GOOGLE_CLIENT_ID,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       callbackUrl: process.env.GOOGLE_CALLBACK_URL,
     },
   }
   ```

3. **確認前端設定**：
   - 前端只需要保留 Medusa 後端連線設定
   - 移除所有對 Google 憑證的直接引用

### ✨ 優點確認

- **安全性提升**：Google 憑證不會暴露在前端
- **架構清晰**：認證流程統一由 Medusa 後端處理  
- **維護簡化**：憑證只需在後端管理

## ⚠️ 注意事項

1. **Callback URL 設定**：
   - 本機：`http://localhost:3000/auth/google/callback`
   - 正式：`https://timsfantasyworld.com/tw/auth/google/callback`
   - 確保 Google Cloud Console 也有對應設定

2. **環境切換**：
   - 根據部署環境使用對應的 CALLBACK_URL
   - 可以用環境變數來區分本機和正式環境

遷移完成！前端不再需要直接處理 Google OAuth 憑證。🎉
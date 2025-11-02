# Google OAuth 測試清單 (Quick Checklist)

**測試日期**: _______________  
**測試人員**: _______________  
**測試環境**: Production (https://timsfantasyworld.com)

---

## 準備工作

- [ ] 清除所有 `timsfantasyworld.com` 和 `admin.timsfantasyworld.com` 的 Cookies
- [ ] 開啟 Chrome DevTools (F12)
- [ ] 切換到 Network 標籤
- [ ] 切換到 Console 標籤
- [ ] 準備測試用的 Google 帳號: _______________

---

## 測試步驟

### 1. 開始登入
- [ ] 訪問 https://timsfantasyworld.com/tw/account
- [ ] 點擊「使用 Google 登入」按鈕
- [ ] **Network**: 看到請求到 `admin.timsfantasyworld.com/auth/customer/google`
- [ ] **預期**: 跳轉到 Google 授權頁面

### 2. Google 授權
- [ ] 選擇 Google 帳號
- [ ] 點擊「繼續」或「允許」
- [ ] **預期**: 返回到 `timsfantasyworld.com/tw/auth/google/callback`

### 3. 前端 Callback
- [ ] **頁面**: 顯示「正在完成 Google 登入，請稍候...」
- [ ] **Console**: 看到以下日誌
  ```
  === Frontend Google OAuth Callback ===
  Code: ...
  State: ...
  Country Code: tw
  ✅ 後端已成功處理回調: ...
  Cookies: [..., _medusa_jwt, ...]
  ```
- [ ] **預期**: 自動跳轉到 `/tw/account`

### 4. 會員中心
- [ ] **頁面**: 顯示用戶資料（姓名、Email）
- [ ] **Network**: 看到請求 `admin.timsfantasyworld.com/store/customers/me` (Status 200)
- [ ] **預期**: 已成功登入

---

## Network 檢查重點

### Request 1: Google 授權 (初始)
```
URL: https://admin.timsfantasyworld.com/auth/customer/google
Method: GET
Status: 302
Location: https://accounts.google.com/...
```

### Request 2: Google Callback (後端)
```
URL: https://admin.timsfantasyworld.com/auth/customer/google/callback?code=...&state=...
Method: GET
Status: 302
Location: https://timsfantasyworld.com/tw/auth/google/callback?code=...&state=...

⚠️ 重點檢查 Response Headers:
Set-Cookie: _medusa_jwt=...; Domain=.timsfantasyworld.com; HttpOnly; Secure; SameSite=Lax
```

### Request 3: SDK Callback (前端 → 後端)
```
URL: https://admin.timsfantasyworld.com/auth/customer/google/callback (或 SDK endpoint)
Method: POST/GET
Status: 200

Request Headers:
Cookie: _medusa_jwt=... (如果有)

Response:
{ success: true, ... }
```

### Request 4: 獲取用戶資料
```
URL: https://admin.timsfantasyworld.com/store/customers/me
Method: GET
Status: 200

Request Headers:
Cookie: _medusa_jwt=...

Response:
{ customer: { id, email, first_name, last_name, ... } }
```

---

## Cookie 檢查

**位置**: Chrome DevTools → Application → Cookies → `timsfantasyworld.com`

- [ ] 看到 Cookie: `_medusa_jwt`
- [ ] Domain: `.timsfantasyworld.com` (⚠️ 注意前面有點)
- [ ] Path: `/`
- [ ] HttpOnly: ✅
- [ ] Secure: ✅
- [ ] SameSite: `Lax`
- [ ] Expires: 約 7 天後

**如果沒看到 Cookie**: 檢查 Request 2 的 Response Headers 是否有 `Set-Cookie`

---

## 如果測試失敗

### 收集以下資訊給後端：

1. **測試資訊**
   - 測試時間: _______________
   - 測試 Email: _______________
   - 失敗步驟: _______________

2. **Network 截圖**
   - 貼上 Request 2 (Google Callback) 的完整 Request/Response Headers

3. **Console 日誌**
   ```
   [貼上完整的 Console 輸出，包含錯誤]
   ```

4. **Cookie 狀態**
   - 有/無 `_medusa_jwt` Cookie
   - 如果有，Domain 和 Attributes 是什麼

5. **錯誤訊息**
   ```
   [貼上頁面上顯示的錯誤訊息]
   ```

---

## 常見問題快速診斷

| 症狀 | 可能原因 | 檢查項目 |
|------|---------|---------|
| 無法跳轉到 Google | 前端配置錯誤 | SDK baseUrl 是否正確 |
| Google 授權後白屏 | Callback 頁面錯誤 | Console 是否有錯誤 |
| 沒有 Cookie | 後端未設定或 domain 錯誤 | Request 2 的 Response Headers |
| 有 Cookie 但未登入 | Cookie domain 不匹配 | Cookie 的 Domain 是否為 `.timsfantasyworld.com` |
| 401 錯誤 | Token 無效或過期 | 清除 Cookie 重新登入 |

---

## 測試結果

- [ ] ✅ 測試通過
- [ ] ❌ 測試失敗

**備註**:
_______________________________________________
_______________________________________________
_______________________________________________

---

**文檔版本**: 1.0  
**相關文檔**: `/FRONTEND_GOOGLE_OAUTH_INTEGRATION.md`

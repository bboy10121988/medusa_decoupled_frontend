# 前端整合說明 — Google OAuth（Frontend Integration Guide）

**文檔版本**: 1.0  
**最後更新**: 2025-11-02  
**狀態**: 🔄 待測試驗證

---

## 📋 重要前提

### Domain 配置
- **前端 URL**: `https://timsfantasyworld.com`
- **後端 URL**: `https://admin.timsfantasyworld.com`
- **Google OAuth Callback (後端)**: `https://admin.timsfantasyworld.com/auth/customer/google/callback`
- **前端 Callback 頁面**: `https://timsfantasyworld.com/tw/auth/google/callback`

### 後端狀態確認
- ✅ 後端已部署修正版本 (commit: `e3f48a2`)
- ✅ 使用 Medusa v2 API (`query.graph()` + `createCustomersWorkflow`)
- ✅ Google Strategy 已配置完成
- ⏳ Cookie domain 設定為 `.timsfantasyworld.com`（需驗證）

---

## 🚀 快速流程（High-Level Flow）

```
1. 用戶點擊 "使用 Google 登入"
   ↓
2. 前端導向後端 `/auth/customer/google`
   ↓
3. 後端重定向到 Google 授權頁面
   ↓
4. 用戶在 Google 完成授權
   ↓
5. Google 回調到後端 `/auth/customer/google/callback`
   ↓
6. 後端驗證 token、創建/查詢 customer、設定 JWT cookie
   ↓
7. 後端重定向到前端 callback 頁面（帶 code 和 state）
   ↓
8. 前端 callback 頁面調用 `sdk.auth.callback()` 完成驗證
   ↓
9. 前端重定向到會員中心 `/tw/account`
```

---

## ✅ 當前實作檢查（Current Implementation Review）

### 1. SDK 配置 (`src/lib/config.ts`)

**當前狀態**: ✅ 已正確配置

```typescript
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL, // 應該指向 https://admin.timsfantasyworld.com
  debug: process.env.NODE_ENV === "development",
  publishableKey: publishableKey,
  auth: {
    type: "session"  // ✅ 正確使用 session 模式
  },
})
```

**需要驗證**:
- [ ] 生產環境的 `NEXT_PUBLIC_MEDUSA_BACKEND_URL` 是否設為 `https://admin.timsfantasyworld.com`
- [ ] SDK 會自動在請求中帶上 `credentials: 'include'`（session 模式預設行為）

### 2. Google 登入按鈕 (`src/modules/account/components/google-login-button.tsx`)

**當前實作**:
```typescript
const loginWithGoogle = async () => {
  setIsLoading(true)
  try {
    const result = await sdk.auth.login("customer", "google", {
      redirect_uri: `${window.location.origin}/${countryCode}/auth/google/callback`,
      state: btoa(JSON.stringify({ countryCode })),
    })
    
    if (typeof result === "object" && result.location) {
      window.location.href = result.location
      return
    }
    
    alert("無法啟動 Google 登入，請聯繫管理員。")
    setIsLoading(false)
  } catch (error) {
    alert("登入時發生錯誤，請稍後重試")
    setIsLoading(false)
  }
}
```

**狀態**: ⚠️ 需要調整

**後端建議的實作**（最簡單方式）:
```typescript
const loginWithGoogle = () => {
  // 直接導向後端，讓後端處理 Google redirect
  window.location.href = 'https://admin.timsfantasyworld.com/auth/customer/google'
}
```

**或保留當前 SDK 方式**（需確保 redirect_uri 正確）:
```typescript
const loginWithGoogle = async () => {
  setIsLoading(true)
  try {
    // SDK 會向後端請求 Google 授權 URL
    const result = await sdk.auth.login("customer", "google", {
      // ⚠️ 注意：這個 redirect_uri 應該是前端的 callback 頁面
      redirect_uri: `${window.location.origin}/${countryCode}/auth/google/callback`,
      state: btoa(JSON.stringify({ countryCode })),
    })
    
    if (typeof result === "object" && result.location) {
      // result.location 應該是 Google 的授權 URL
      window.location.href = result.location
      return
    }
    
    alert("無法啟動 Google 登入，請聯繫管理員。")
    setIsLoading(false)
  } catch (error) {
    console.error("Google 登入錯誤:", error)
    alert("登入時發生錯誤，請稍後重試")
    setIsLoading(false)
  }
}
```

### 3. Callback 頁面 (`src/app/(main)/[countryCode]/auth/google/callback/page.tsx`)

**當前實作**:
```typescript
const validateCallback = async () => {
  try {
    if (!queryParams.code) {
      setError("缺少 Google 授權參數，無法完成登入。")
      return
    }
    
    await sdk.auth.callback("customer", "google", {
      ...queryParams,
      redirect_uri: `${window.location.origin}/${countryCode}/auth/google/callback`,
    })
    
    // 登入成功，重導向到帳戶頁面
    window.location.href = `/${countryCode}/account`
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "發生未知錯誤"
    setError(`登入失敗: ${errorMessage}`)
  } finally {
    setLoading(false)
  }
}
```

**狀態**: ⚠️ 需要調整 SDK 調用方式

**後端建議的實作**:
```typescript
const validateCallback = async () => {
  try {
    const code = queryParams.code
    const state = queryParams.state
    
    if (!code || !state) {
      setError("缺少 Google 授權參數，無法完成登入。")
      return
    }
    
    console.log('正在完成 Google OAuth 驗證...')
    
    // ⚠️ 修正：SDK callback 應該傳遞 query 物件
    const res = await sdk.auth.callback('customer', 'google', { 
      query: { code, state }  // 注意這裡的結構
    })
    
    console.log('Google OAuth callback 完成:', res)
    
    // 後端會透過 httpOnly cookie 設定 JWT
    // 直接跳轉到 account 頁面
    window.location.href = `/${countryCode}/account`
  } catch (error) {
    console.error('Google callback 錯誤:', error)
    const errorMessage = error instanceof Error ? error.message : "發生未知錯誤"
    setError(`登入失敗: ${errorMessage}`)
  } finally {
    setLoading(false)
  }
}
```

### 4. Credentials 配置

**需要檢查的檔案**:
- ✅ `src/lib/config.ts` - SDK 使用 session 模式（自動帶 credentials）
- ✅ 其他 API 請求都已配置 `credentials: 'include'`（根據之前的檢查）

**已驗證的檔案** (17 個):
- `src/lib/client-auth.ts` (3 處)
- `src/lib/authenticated-sdk.ts` (2 處)
- `src/lib/medusa-api.ts` (1 處)
- `src/lib/hooks/use-logout.ts` (1 處)
- `src/lib/hooks/use-auth.tsx` (2 處)
- `src/lib/context/account-context.tsx` (1 處)
- `src/components/auth/auth-guard.tsx` (1 處)
- `src/components/auth/auth-diagnostic.tsx` (1 處)
- `src/app/(main)/[countryCode]/account/` 系列 (4 處)
- `src/app/auth-test/page.tsx` (1 處)

---

## 🔧 需要修正的項目

### Priority 1: 必須修正

#### 1.1 修正 Callback 頁面的 SDK 調用

**檔案**: `src/app/(main)/[countryCode]/auth/google/callback/page.tsx`

**修改內容**:
```typescript
// 原本:
await sdk.auth.callback("customer", "google", {
  ...queryParams,
  redirect_uri: `${window.location.origin}/${countryCode}/auth/google/callback`,
})

// 改為:
await sdk.auth.callback('customer', 'google', { 
  query: { 
    code: queryParams.code, 
    state: queryParams.state 
  }
})
```

#### 1.2 確認環境變數

**檔案**: `.env.production` 或 VM 上的環境變數

確認以下變數正確設定:
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://admin.timsfantasyworld.com
NEXT_PUBLIC_SITE_URL=https://timsfantasyworld.com
```

### Priority 2: 建議優化

#### 2.1 簡化 Google 登入按鈕（可選）

如果遇到問題，可以改用最簡單的直接導向方式:

**檔案**: `src/modules/account/components/google-login-button.tsx`

```typescript
const loginWithGoogle = () => {
  // 最簡單且最可靠的方式
  window.location.href = 'https://admin.timsfantasyworld.com/auth/customer/google'
}
```

#### 2.2 增強錯誤日誌

在 callback 頁面增加更詳細的日誌:

```typescript
try {
  console.log('=== Frontend Google OAuth Callback ===')
  console.log('Code:', queryParams.code?.substring(0, 10) + '...')
  console.log('State:', queryParams.state)
  console.log('Country Code:', countryCode)
  
  const res = await sdk.auth.callback('customer', 'google', { 
    query: { code: queryParams.code, state: queryParams.state }
  })
  
  console.log('✅ Callback 成功:', res)
  
  // 檢查 cookie 是否存在（僅供 debug）
  console.log('Cookies:', document.cookie.split(';').map(c => c.trim().split('=')[0]))
  
  window.location.href = `/${countryCode}/account`
} catch (error) {
  console.error('❌ Callback 失敗:', error)
  console.error('Error details:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  })
  setError(`登入失敗: ${error.message}`)
}
```

---

## 🧪 測試清單（Testing Checklist）

### 測試前準備

1. **清除瀏覽器資料**
   - 清除 `timsfantasyworld.com` 的所有 Cookies
   - 清除 `admin.timsfantasyworld.com` 的所有 Cookies
   - 清除 Cache

2. **準備測試帳號**
   - 使用尚未註冊的 Google 帳號（測試註冊流程）
   - 使用已註冊的 Google 帳號（測試登入流程）

3. **開啟開發者工具**
   - Network 標籤（記錄所有請求）
   - Console 標籤（查看日誌）
   - Application → Cookies（檢查 cookie 設定）

### 測試步驟

#### Test Case 1: 新用戶註冊

1. [ ] 訪問 `https://timsfantasyworld.com/tw/account`
2. [ ] 點擊「使用 Google 登入」按鈕
3. [ ] 確認跳轉到 Google 授權頁面
4. [ ] 選擇 Google 帳號並授權
5. [ ] 確認返回到前端 callback 頁面
6. [ ] 確認顯示「正在完成 Google 登入，請稍候...」
7. [ ] 確認自動跳轉到 `/tw/account`
8. [ ] 確認顯示用戶資料（名稱、email）

**預期結果**:
- ✅ 可以看到用戶資料
- ✅ 數據庫有新的 customer 記錄
- ✅ `metadata.auth_provider = 'google'`
- ✅ `has_account = true`

#### Test Case 2: 現有用戶登入

1. [ ] 清除 Cookies
2. [ ] 訪問 `https://timsfantasyworld.com/tw/account`
3. [ ] 點擊「使用 Google 登入」按鈕
4. [ ] 選擇之前註冊過的 Google 帳號
5. [ ] 確認自動跳轉並顯示用戶資料

**預期結果**:
- ✅ 可以看到用戶資料
- ✅ 數據庫沒有新增記錄
- ✅ 使用現有的 customer 記錄

### Network 檢查清單

在測試過程中，檢查以下請求:

1. **初始授權請求**
   - [ ] 請求: `GET https://admin.timsfantasyworld.com/auth/customer/google`
   - [ ] 狀態碼: 302 (redirect)
   - [ ] Location header: 包含 `accounts.google.com`

2. **Google 授權**
   - [ ] 請求: `GET https://accounts.google.com/...`
   - [ ] 用戶完成授權

3. **後端 Callback**
   - [ ] 請求: `GET https://admin.timsfantasyworld.com/auth/customer/google/callback?code=...&state=...`
   - [ ] 狀態碼: 302 (redirect)
   - [ ] Location header: `https://timsfantasyworld.com/tw/auth/google/callback?code=...&state=...`
   - [ ] **重要**: Response Headers 應包含 `Set-Cookie: _medusa_jwt=...`

4. **前端 Callback**
   - [ ] 頁面: `https://timsfantasyworld.com/tw/auth/google/callback?code=...&state=...`
   - [ ] SDK 請求: 向後端發送 callback 驗證（如果有）
   - [ ] 自動跳轉: `https://timsfantasyworld.com/tw/account`

5. **會員中心頁面**
   - [ ] 請求: `GET https://admin.timsfantasyworld.com/store/customers/me`
   - [ ] Request Headers: 包含 `Cookie: _medusa_jwt=...`
   - [ ] 狀態碼: 200
   - [ ] Response: 用戶資料

### Cookie 檢查清單

開啟 Chrome DevTools → Application → Cookies → `timsfantasyworld.com`

**應該看到**:
- [ ] Cookie 名稱: `_medusa_jwt`
- [ ] Domain: `.timsfantasyworld.com` (注意前面有點)
- [ ] Path: `/`
- [ ] HttpOnly: ✅ (checked)
- [ ] Secure: ✅ (checked)
- [ ] SameSite: `Lax`
- [ ] Expires: 約 7 天後

**如果沒有看到 Cookie**:
- 檢查後端 callback 的 Response Headers
- 檢查 CORS 設定
- 檢查後端是否正確設定 Cookie domain

### Console 日誌檢查

**前端 Console 應該顯示**:
```
=== Frontend Google OAuth Callback ===
Code: abc123...
State: eyJ...
Country Code: tw
✅ Callback 成功: {...}
Cookies: [..., _medusa_jwt, ...]
```

**如果有錯誤**:
```
❌ Callback 失敗: Error: ...
Error details: {
  message: "...",
  response: {...},
  status: 401
}
```

---

## 🐛 常見問題與解決方案

### 問題 1: Cookie 沒有被設定

**症狀**: 
- Network 看到後端 callback 成功 (200/302)
- 但 Application → Cookies 中沒有 `_medusa_jwt`

**可能原因**:
1. Cookie domain 設定錯誤
2. SameSite 設定不當
3. CORS 問題

**解決方案**:
1. 確認後端設定 Cookie 時使用:
```typescript
res.cookie('_medusa_jwt', token, {
  httpOnly: true,
  secure: true,  // production 必須
  sameSite: 'lax',
  domain: '.timsfantasyworld.com',  // 注意前面有點
  maxAge: 7 * 24 * 60 * 60 * 1000
})
```

2. 確認 CORS 配置允許 credentials:
```typescript
// medusa-config.ts
{
  store_cors: "https://timsfantasyworld.com",
  // ...
  http: {
    cors: {
      credentials: true,
      origin: ["https://timsfantasyworld.com"]
    }
  }
}
```

### 問題 2: SDK callback 失敗

**症狀**: 
- Console 顯示 `❌ Callback 失敗`
- Network 顯示 401 或 403

**可能原因**:
1. SDK 調用參數格式錯誤
2. code 或 state 無效
3. 後端 callback 處理失敗

**解決方案**:
1. 確認 SDK 調用使用正確格式:
```typescript
await sdk.auth.callback('customer', 'google', { 
  query: { code, state }  // 注意是 query 物件
})
```

2. 檢查 code 是否完整（沒有被截斷）

3. 查看後端日誌確認錯誤原因

### 問題 3: 跳轉後仍未登入

**症狀**:
- Cookie 已設定
- 但會員中心仍顯示未登入

**可能原因**:
1. 會員中心頁面沒有帶 credentials
2. Cookie domain 不匹配
3. Cookie 過期

**解決方案**:
1. 確認會員中心的 API 請求帶 `credentials: 'include'`
2. 檢查 Cookie domain 是否為 `.timsfantasyworld.com`
3. 嘗試清除 Cookie 重新登入

### 問題 4: 本地開發無法測試

**症狀**:
- 本地 localhost 無法設定跨域 Cookie

**解決方案**:
1. 使用 staging 環境測試
2. 或修改 hosts 文件模擬 production domain:
```
127.0.0.1 local.timsfantasyworld.com
127.0.0.1 admin.local.timsfantasyworld.com
```

---

## 📝 提供給後端的 Debug 資訊

當測試失敗時，請提供以下資訊給後端工程師:

### 1. 測試基本資訊
- **測試時間**: ________________
- **測試 Email**: ________________
- **瀏覽器**: Chrome / Firefox / Safari
- **是否清除過 Cookies**: 是 / 否

### 2. Network 截圖/資訊
請截圖或複製以下請求的詳細資訊:

**Google Callback 到後端**:
```
Request URL: https://admin.timsfantasyworld.com/auth/customer/google/callback?code=...
Request Method: GET
Status Code: ___

Response Headers:
Set-Cookie: ___________________
Location: _____________________
Access-Control-Allow-Credentials: ___
```

**SDK Callback 請求** (如果有):
```
Request URL: ___________________
Request Method: ___
Status Code: ___

Request Headers:
Cookie: ___________________

Response:
___________________
```

### 3. Console 日誌
請複製完整的 Console 輸出（包含錯誤堆疊）:
```
[請貼上 Console 日誌]
```

### 4. Cookie 資訊
請截圖 Application → Cookies 的內容，或列出:
```
Cookie Name: ___________________
Domain: ___________________
Path: ___________________
HttpOnly: ___
Secure: ___
SameSite: ___
Expires: ___________________
```

---

## 🎯 成功標準

測試通過的標準:

### 新用戶註冊
1. ✅ 可以完成 Google 授權
2. ✅ 自動創建 customer 記錄
3. ✅ 自動登入並跳轉到會員中心
4. ✅ 會員中心顯示正確的用戶資料
5. ✅ 數據庫記錄包含 `auth_provider: 'google'`

### 現有用戶登入
1. ✅ 可以完成 Google 授權
2. ✅ 使用現有 customer 記錄
3. ✅ 自動登入並跳轉到會員中心
4. ✅ 會員中心顯示正確的用戶資料

### Cookie 管理
1. ✅ Cookie 被正確設定
2. ✅ Cookie 可以在前端域名下使用
3. ✅ 後續 API 請求自動帶上 Cookie

### 錯誤處理
1. ✅ 授權失敗時顯示友善的錯誤訊息
2. ✅ 網路錯誤時可以重試
3. ✅ 不會出現白屏或無限載入

---

## 📞 聯絡資訊

**前端負責人**: ___________________  
**後端負責人**: ___________________  
**測試進度**: 🔄 待測試  
**下次更新**: ___________________

---

**文檔位置**: `/FRONTEND_GOOGLE_OAUTH_INTEGRATION.md`  
**相關文檔**: 
- `/GOOGLE_OAUTH_DEBUG.md` - 原始問題診斷報告
- `/GOOGLE_OAUTH_TEST_FAILURE_REPORT.md` - 測試失敗報告

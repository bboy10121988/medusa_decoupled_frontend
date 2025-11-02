# Google OAuth 後端問題報告

**日期:** 2025年11月2日  
**問題狀態:** 🔴 CRITICAL - OAuth 認證失敗  
**影響範圍:** 所有使用 Google 登入的使用者

---

## 問題摘要

前端成功接收 Google OAuth callback 並將 `code` 和 `state` 發送到後端,但後端回傳 **401 Unauthorized** 錯誤。

錯誤發生在 SDK 嘗試建立 session 時:
```
POST https://admin.timsfantasyworld.com/auth/session 401 (Unauthorized)
```

---

## 前端實作狀態 ✅

### 1. Callback 接收正常
```
=== Frontend Google OAuth Callback ===
Code: 4/0Ab32j90...
State: cc760347ede339adce882b0f7b0bba4e4a791ef1b4e00f63fae11b6b6f69eeb3
Country Code: tw
```

### 2. SDK 呼叫格式正確
```typescript
const res = await sdk.auth.callback("customer", "google", {
  code,
  state
})
```

### 3. 前端路由設定正確
- ✅ `/auth/google/callback` → redirect handler (處理無國家代碼)
- ✅ `/tw/auth/google/callback` → 實際處理邏輯
- ✅ 所有查詢參數正確傳遞

---

## 錯誤詳情

### Network 請求序列

1. **前端 → 後端 (SDK.auth.callback)**
   ```
   Request: sdk.auth.callback("customer", "google", { code, state })
   ```

2. **SDK 內部處理**
   ```
   POST https://admin.timsfantasyworld.com/auth/session
   Status: 401 Unauthorized
   ```

### 錯誤訊息
```javascript
Error: Unauthorized
- response: undefined
- status: undefined
```

---

## 需要後端檢查的項目

### 🔍 1. Google OAuth Callback 端點

**路徑:** `POST /auth/customer/google/callback`

#### 檢查事項:
- [ ] 端點是否正確註冊?
- [ ] 是否接收 `code` 和 `state` 參數?
- [ ] 是否正確呼叫 Google API 交換 access token?
- [ ] 是否成功建立或查找客戶記錄?

#### 預期邏輯:
```javascript
// 偽代碼示意
async function handleGoogleCallback(code, state) {
  // 1. 驗證 state (CSRF protection)
  const isValidState = await verifyState(state)
  if (!isValidState) throw new Error('Invalid state')
  
  // 2. 用 code 向 Google 交換 tokens
  const tokens = await exchangeCodeForTokens(code)
  
  // 3. 取得 Google 使用者資訊
  const googleUser = await getGoogleUserInfo(tokens.access_token)
  
  // 4. 在資料庫建立或更新客戶
  const customer = await createOrUpdateCustomer({
    email: googleUser.email,
    first_name: googleUser.given_name,
    last_name: googleUser.family_name,
    metadata: {
      auth_provider: 'google',
      google_user_id: googleUser.sub
    }
  })
  
  // 5. 建立 session token
  const token = await createAuthToken(customer.id)
  
  // 6. **重要** 設定 cookie 並回傳
  response.cookie('_medusa_jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    domain: '.timsfantasyworld.com', // 跨子網域
    maxAge: 30 * 24 * 60 * 60 * 1000  // 30天
  })
  
  return { customer, token }
}
```

---

### 🔍 2. Session 建立端點

**路徑:** `POST /auth/session`  
**問題:** 此端點回傳 401,可能原因:

#### 檢查事項:
- [ ] 是否在 callback 成功後正確設定 cookie?
- [ ] Cookie 的 domain 是否設為 `.timsfantasyworld.com`?
- [ ] Cookie 的 HttpOnly, Secure, SameSite 屬性是否正確?
- [ ] Token 格式是否正確?
- [ ] Token 簽發邏輯是否有問題?

#### 預期 Cookie 格式:
```
Set-Cookie: _medusa_jwt=<JWT_TOKEN>; 
  Domain=.timsfantasyworld.com; 
  Path=/; 
  HttpOnly; 
  Secure; 
  SameSite=Lax; 
  Max-Age=2592000
```

---

### 🔍 3. Medusa v2 API 遷移檢查

根據之前的修正 (commit e3f48a2),後端已從 Medusa v1 遷移到 v2。

#### 需要確認:
- [ ] `query.graph()` 是否正確查詢客戶?
- [ ] `createCustomersWorkflow()` 是否成功執行?
- [ ] Workflow 執行後是否正確回傳客戶 ID?
- [ ] 回傳的客戶物件結構是否符合預期?

#### 參考之前的修正:
```javascript
// v1 (舊)
const customer = await customerService.retrieveByEmail(email)

// v2 (新)
const { data } = await query.graph({
  entity: "customer",
  fields: ["id", "email", "first_name", "last_name"],
  filters: { email }
})

// 建立客戶
const { result } = await createCustomersWorkflow(container).run({
  input: {
    customersData: [customerData]
  }
})
```

---

### 🔍 4. Google OAuth 設定檢查

#### 檢查 Google Cloud Console 設定:
- [ ] Client ID 和 Client Secret 是否正確?
- [ ] Authorized redirect URIs 是否包含:
  ```
  https://admin.timsfantasyworld.com/auth/customer/google/callback
  ```
- [ ] OAuth consent screen 是否已發布?
- [ ] API 範圍是否包含:
  - `openid`
  - `email`
  - `profile`

#### 檢查後端環境變數:
```bash
# 後端 .env 應該包含:
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=https://admin.timsfantasyworld.com/auth/customer/google/callback
```

---

## 除錯步驟

### Step 1: 檢查後端日誌

**SSH 連接到 VM:**
```bash
gcloud compute ssh tims-web --zone=asia-east1-c
```

**查看 backend logs:**
```bash
# 查看即時日誌
pm2 logs medusa-backend

# 或查看最近的錯誤
pm2 logs medusa-backend --err --lines 100
```

**尋找關鍵字:**
- `google callback`
- `401`
- `Unauthorized`
- `token`
- `session`

---

### Step 2: 驗證 Google API 呼叫

**在後端加入詳細日誌:**

```javascript
// 在 Google callback handler 中
console.log('=== Google OAuth Callback Received ===')
console.log('Code:', code?.substring(0, 10) + '...')
console.log('State:', state)

try {
  // 交換 token
  const tokens = await exchangeCodeForTokens(code)
  console.log('✅ Token exchange successful')
  console.log('Access token:', tokens.access_token?.substring(0, 20) + '...')
  
  // 取得使用者資訊
  const googleUser = await getGoogleUserInfo(tokens.access_token)
  console.log('✅ Google user info retrieved:', {
    email: googleUser.email,
    name: googleUser.name,
    sub: googleUser.sub
  })
  
  // 建立/更新客戶
  const customer = await createOrUpdateCustomer(googleUser)
  console.log('✅ Customer created/updated:', customer.id)
  
  // 建立 session
  const token = await createAuthToken(customer.id)
  console.log('✅ Auth token created')
  
  // 設定 cookie
  res.cookie('_medusa_jwt', token, cookieOptions)
  console.log('✅ Cookie set')
  
  return { customer, token }
  
} catch (error) {
  console.error('❌ Google OAuth Error:', error.message)
  console.error('Stack:', error.stack)
  throw error
}
```

---

### Step 3: 測試 Google API 直接呼叫

**建立測試腳本 (在後端專案):**

```javascript
// test-google-oauth.js
const axios = require('axios')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL

async function testTokenExchange(code) {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    })
    
    console.log('✅ Token exchange successful')
    console.log('Access token:', response.data.access_token?.substring(0, 20) + '...')
    
    // 測試取得使用者資訊
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`
      }
    })
    
    console.log('✅ User info retrieved:', userInfo.data)
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
  }
}

// 使用從前端 log 複製的 code 測試
const testCode = '4/0Ab32j90...' // 完整的 code
testTokenExchange(testCode)
```

**執行測試:**
```bash
cd ~/projects/backend
node test-google-oauth.js
```

---

### Step 4: 檢查資料庫

**連接到 PostgreSQL:**
```bash
# 在 VM 上
psql $DATABASE_URL

# 或使用環境變數
psql -h localhost -U medusa -d medusa
```

**檢查客戶表:**
```sql
-- 查看是否有 Google 登入的客戶
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  metadata,
  created_at 
FROM customer 
WHERE metadata->>'auth_provider' = 'google'
ORDER BY created_at DESC 
LIMIT 10;

-- 檢查特定郵箱
SELECT * FROM customer WHERE email = 'your-test-email@gmail.com';
```

---

## 可能的問題與解決方案

### 問題 1: Google Code 已過期

**症狀:** `invalid_grant` 錯誤

**原因:** OAuth authorization code 只能使用一次,且有時效性(約10分鐘)

**解決方案:**
- 不要重複使用同一個 code
- 確保 callback 處理迅速
- 每次測試都要重新進行 Google 授權流程

---

### 問題 2: Redirect URI 不匹配

**症狀:** `redirect_uri_mismatch` 錯誤

**解決方案:**
```javascript
// 確保後端使用的 redirect_uri 與 Google Console 設定完全一致
const REDIRECT_URI = 'https://admin.timsfantasyworld.com/auth/customer/google/callback'

// 在交換 token 時必須使用相同的 URI
const tokens = await oauth2Client.getToken({
  code,
  redirect_uri: REDIRECT_URI  // 必須與初始授權時使用的完全一致
})
```

---

### 問題 3: Cookie Domain 設定錯誤

**症狀:** 前端收不到 cookie

**解決方案:**
```javascript
// 後端設定 cookie 時
res.cookie('_medusa_jwt', token, {
  httpOnly: true,
  secure: true,  // 生產環境必須 true
  sameSite: 'lax',  // 允許從 Google 跳轉回來
  domain: '.timsfantasyworld.com',  // 注意前面的點,允許跨子網域
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000  // 30天
})
```

**驗證 cookie 是否正確設定:**
```bash
# 在瀏覽器 Console 測試
document.cookie  // 無法看到 httpOnly cookie (正常)

# 在 Network tab 查看 Response Headers
Set-Cookie: _medusa_jwt=...; Domain=.timsfantasyworld.com; ...
```

---

### 問題 4: CORS 設定問題

**症狀:** Preflight request 失敗

**解決方案:**
```javascript
// 後端 CORS 設定
app.use(cors({
  origin: [
    'https://timsfantasyworld.com',
    'https://admin.timsfantasyworld.com'
  ],
  credentials: true,  // 允許發送 cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

---

### 問題 5: Session 建立邏輯錯誤

**症狀:** Callback 成功但 session 端點 401

**可能原因:**
1. Token 未正確簽發
2. Token 格式不符合 Medusa 預期
3. Customer ID 不存在或格式錯誤
4. JWT secret 不一致

**解決方案:**
```javascript
// 確保使用正確的 JWT secret
const token = jwt.sign(
  {
    customer_id: customer.id,
    domain: 'store',
    type: 'customer'
  },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
)

// 或使用 Medusa 內建的 token service
const token = await tokenService.signToken({
  customer_id: customer.id
})
```

---

## 前端測試用的完整 Flow

為了方便後端除錯,這是完整的前端流程:

### 1. 使用者點擊「使用 Google 登入」
```
URL: https://timsfantasyworld.com/tw/account
SDK 呼叫: sdk.auth.register("customer", "google")
```

### 2. SDK 重定向到 Google
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID
  &redirect_uri=https://admin.timsfantasyworld.com/auth/customer/google/callback
  &response_type=code
  &scope=openid email profile
  &state=RANDOM_STATE_STRING
```

### 3. 使用者授權後 Google 重定向
```
https://admin.timsfantasyworld.com/auth/customer/google/callback?
  code=4/0Ab32j90...
  &state=cc760347...
```

### 4. **後端應該在這裡處理** ⚠️
```
1. 驗證 state
2. 用 code 交換 access_token
3. 用 access_token 取得使用者資訊
4. 建立/更新客戶記錄
5. 簽發 JWT token
6. 設定 httpOnly cookie
7. 重定向回前端 (可選)
```

### 5. 後端重定向回前端
```
Location: https://timsfantasyworld.com/auth/google/callback?
  code=SAME_CODE
  &state=SAME_STATE
```

### 6. 前端接收並驗證
```javascript
// /tw/auth/google/callback/page.tsx
const res = await sdk.auth.callback("customer", "google", { code, state })
// SDK 內部會呼叫 POST /auth/session 來驗證 cookie
// ❌ 這裡失敗了! 401 Unauthorized
```

---

## 建議的後端修正順序

### Priority 1: 確保 Callback 端點正常運作
1. 檢查路由是否註冊: `/auth/customer/google/callback`
2. 確認接收參數正確: `code`, `state`
3. 加入詳細 logging
4. 測試 Google API 呼叫

### Priority 2: 修正 Session 建立
1. 確保 token 正確簽發
2. 正確設定 cookie (domain, httpOnly, secure, sameSite)
3. 驗證 token 格式符合 Medusa 預期

### Priority 3: 整合測試
1. 完整跑一次 OAuth flow
2. 驗證 cookie 在前端可用
3. 確認使用者資料正確顯示

---

## 測試用的 Gmail 帳號

為了方便測試,請使用以下測試帳號:

```
Email: (提供你的測試 Gmail)
預期結果: 
- 成功建立客戶記錄
- Email 儲存為上述地址
- metadata 包含 auth_provider: 'google'
- Cookie 正確設定
- 前端可以取得使用者資訊
```

---

## 聯絡資訊

**前端工程師:** Ray  
**問題嚴重性:** 🔴 Critical  
**需要協助:** 請後端工程師檢查上述項目並提供詳細的錯誤 log

**下一步:**
1. 後端加入詳細 logging
2. 提供完整的錯誤訊息和 stack trace
3. 確認 Google OAuth 設定正確
4. 測試 token 交換是否成功

---

## Appendix: 參考文件

- [Medusa v2 Authentication](https://docs.medusajs.com/v2/resources/storefront-development/customers/third-party-login)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Medusa JS SDK Auth Module](https://docs.medusajs.com/js-sdk/auth)

---

**建立日期:** 2025-11-02  
**最後更新:** 2025-11-02  
**狀態:** 等待後端修正

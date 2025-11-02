# 🔧 Google OAuth 後端修正需求說明

**日期:** 2025年11月2日  
**優先級:** 🔴 CRITICAL  
**問題類型:** OAuth 流程錯誤 - 回傳 JSON 而非重定向

---

## 📋 問題描述

### 目前狀況
當前端呼叫 Google OAuth 登入時:
```
GET /auth/customer/google
```

後端回傳了一個 **JSON 物件**:
```json
{
  "location": "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=https%3A%2F%2Fadmin.timsfantasyworld.com%2Fauth%2Fcustomer%2Fgoogle%2Fcallback&client_id=273789094137-fhpmj9kft3u0jn2ig0icebo1jme40lvf.apps.googleusercontent.com&response_type=code&scope=email+profile+openid&state=866a7b75936cf34666b23b6d5d80c944f3bd3628d8103594f4edc59708355bd0"
}
```

### 預期行為
後端應該執行 **HTTP 302/307 重定向**,讓瀏覽器自動跳轉到 Google OAuth 頁面。

---

## ⚠️ 為什麼這是個問題?

### 1. **使用者體驗問題**
- ❌ 使用者點擊「使用 Google 登入」後,頁面**沒有任何反應**
- ❌ 沒有看到 Google 帳號選擇畫面
- ❌ 無法完成登入流程

### 2. **OAuth 標準流程被破壞**
標準的 OAuth 2.0 Authorization Code Flow:
```
1. 前端: 使用者點擊「使用 Google 登入」
2. 前端: 導航到 GET /auth/customer/google
3. 後端: 產生 state 並重定向到 Google OAuth ⭐️ 問題在這裡
4. Google: 顯示帳號選擇/授權畫面
5. Google: 重定向回 callback URL + code + state
6. 後端: 驗證並建立 session
7. 後端: 重定向到前端成功頁面
```

### 3. **前端無法處理 JSON 回應**
前端實作是使用瀏覽器原生導航:
```typescript
window.location.href = 'https://admin.timsfantasyworld.com/auth/customer/google'
```
這會期待一個 HTTP 重定向,而不是 JSON 資料。

---

## ✅ 修正方案

### 需要修改的端點
**路徑:** `GET /auth/customer/google`

### 目前的實作 (錯誤) ❌
```javascript
// 錯誤: 回傳 JSON
app.get("/auth/customer/google", (req, res) => {
  const authUrl = generateGoogleAuthUrl(state)
  
  // ❌ 不應該這樣做
  res.json({ location: authUrl })
})
```

### 正確的實作 ✅
```javascript
// 正確: 使用 HTTP 重定向
app.get("/auth/customer/google", (req, res) => {
  // 1. 產生隨機 state (CSRF 保護)
  const state = generateRandomState()
  
  // 2. 儲存 state 到 session 或 Redis (用於稍後驗證)
  await saveState(state, req.session.id)
  
  // 3. 建構 Google OAuth URL
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID)
  authUrl.searchParams.set("redirect_uri", process.env.GOOGLE_CALLBACK_URL)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", "email profile openid")
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("access_type", "offline")
  authUrl.searchParams.set("prompt", "select_account") // ⭐️ 強制顯示帳號選擇
  
  // 4. ✅ 使用 HTTP 重定向 (NOT JSON)
  res.redirect(307, authUrl.toString())
  // 或者
  // res.status(307).location(authUrl.toString()).end()
})
```

---

## 📝 詳細修改說明

### 1. 回傳類型必須是 HTTP 重定向
```javascript
// 使用 Express.js
res.redirect(307, googleAuthUrl)

// 使用其他框架
res.status(307)
   .header('Location', googleAuthUrl)
   .end()
```

### 2. 使用 307 Temporary Redirect (推薦)
- **307:** 保持原始請求方法 (GET → GET)
- **302:** 瀏覽器可能改變請求方法,但大多數情況下正常
- **301:** 不適合,這不是永久重定向

### 3. 必須加入的參數

#### ⭐️ `prompt=select_account` (重要!)
這個參數**強制顯示 Google 帳號選擇畫面**:
```javascript
authUrl.searchParams.set("prompt", "select_account")
```
**效果:**
- ✅ 即使使用者已登入 Google,也會顯示帳號選擇
- ✅ 使用者可以選擇使用哪個 Google 帳號
- ✅ 更好的使用者體驗

#### `access_type=offline` (建議)
```javascript
authUrl.searchParams.set("access_type", "offline")
```
**效果:**
- 可以取得 refresh token
- 允許後端在使用者離線時存取 API

### 4. State 管理 (安全性)
```javascript
// 產生隨機 state
const state = crypto.randomBytes(32).toString('hex')

// 儲存到 session 或 Redis (有效期 10 分鐘)
await redis.setex(`oauth_state:${state}`, 600, req.session.id)

// 在 callback 時驗證
const isValid = await redis.get(`oauth_state:${state}`)
if (!isValid) {
  throw new Error('Invalid state - possible CSRF attack')
}
```

---

## 🔍 完整的 OAuth 流程實作

### Step 1: 初始化 OAuth 請求
```javascript
// GET /auth/customer/google
app.get("/auth/customer/google", async (req, res) => {
  try {
    // 1. 產生 state
    const state = crypto.randomBytes(32).toString('hex')
    
    // 2. 儲存 state (用於 callback 驗證)
    await redis.setex(`oauth_state:${state}`, 600, JSON.stringify({
      sessionId: req.session.id,
      timestamp: Date.now()
    }))
    
    // 3. 建構 Google OAuth URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", process.env.GOOGLE_CALLBACK_URL)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", "email profile openid")
    authUrl.searchParams.set("state", state)
    authUrl.searchParams.set("access_type", "offline")
    authUrl.searchParams.set("prompt", "select_account")
    
    // 4. ✅ 重定向到 Google
    res.redirect(307, authUrl.toString())
    
  } catch (error) {
    console.error("OAuth initialization failed:", error)
    res.redirect(`${process.env.FRONTEND_URL}/tw/account?error=oauth_init_failed`)
  }
})
```

### Step 2: 處理 Google Callback
```javascript
// GET /auth/customer/google/callback
app.get("/auth/customer/google/callback", async (req, res) => {
  const { code, state, error } = req.query
  
  try {
    // 1. 檢查 Google 回傳的錯誤
    if (error) {
      console.error("Google OAuth error:", error)
      return res.redirect(`${process.env.FRONTEND_URL}/tw/account?error=${error}`)
    }
    
    // 2. 驗證 state (CSRF 保護)
    const savedState = await redis.get(`oauth_state:${state}`)
    if (!savedState) {
      throw new Error("Invalid or expired state")
    }
    
    // 3. 刪除使用過的 state
    await redis.del(`oauth_state:${state}`)
    
    // 4. 用 code 向 Google 交換 tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code"
      })
    })
    
    const tokens = await tokenResponse.json()
    
    if (!tokens.access_token) {
      throw new Error("Failed to obtain access token")
    }
    
    // 5. 用 access token 取得使用者資訊
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })
    
    const googleUser = await userInfoResponse.json()
    
    // 6. 在資料庫建立或更新客戶
    let customer = await findCustomerByEmail(googleUser.email)
    
    if (!customer) {
      // 建立新客戶
      customer = await createCustomer({
        email: googleUser.email,
        first_name: googleUser.given_name,
        last_name: googleUser.family_name,
        has_account: true,
        metadata: {
          auth_provider: "google",
          google_user_id: googleUser.id,
          google_picture: googleUser.picture
        }
      })
    } else {
      // 更新現有客戶的 Google 資訊
      await updateCustomer(customer.id, {
        metadata: {
          ...customer.metadata,
          auth_provider: "google",
          google_user_id: googleUser.id,
          google_picture: googleUser.picture,
          last_google_login: new Date().toISOString()
        }
      })
    }
    
    // 7. 建立 JWT token
    const jwtToken = jwt.sign(
      { 
        customer_id: customer.id,
        email: customer.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    )
    
    // 8. ✅ 設定 cookie (跨子網域)
    res.cookie("_medusa_jwt", jwtToken, {
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: "lax",
      domain: ".timsfantasyworld.com", // ⭐️ 跨子網域共享
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 天
      path: "/"
    })
    
    // 9. ✅ 重定向到前端成功頁面
    res.redirect(`${process.env.FRONTEND_URL}/tw/account?login=success`)
    
  } catch (error) {
    console.error("OAuth callback failed:", error)
    res.redirect(`${process.env.FRONTEND_URL}/tw/account?error=oauth_callback_failed`)
  }
})
```

---

## 🔧 環境變數設定

請確認後端 `.env` 包含:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=273789094137-fhpmj9kft3u0jn2ig0icebo1jme40lvf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-secret>
GOOGLE_CALLBACK_URL=https://admin.timsfantasyworld.com/auth/customer/google/callback

# JWT
JWT_SECRET=<your-jwt-secret>

# Frontend URL
FRONTEND_URL=https://www.timsfantasyworld.com

# Redis (用於 state 儲存)
REDIS_URL=redis://localhost:6379
```

---

## ✅ Google Cloud Console 設定

### Authorized redirect URIs
確認包含:
```
https://admin.timsfantasyworld.com/auth/customer/google/callback
```

### Authorized JavaScript origins
確認包含:
```
https://www.timsfantasyworld.com
https://admin.timsfantasyworld.com
```

---

## 🧪 測試檢查清單

修改完成後,請測試以下流程:

### 1. 初始化測試
- [ ] 訪問 `GET /auth/customer/google`
- [ ] 瀏覽器應該**自動重定向**到 Google
- [ ] Google 應該顯示**帳號選擇畫面**
- [ ] URL 應該包含正確的 `client_id`, `redirect_uri`, `state`

### 2. Callback 測試
- [ ] 選擇 Google 帳號後,應該重定向回 callback URL
- [ ] 後端應該成功驗證 `state`
- [ ] 後端應該成功交換 `code` 取得 tokens
- [ ] 後端應該建立或更新客戶記錄
- [ ] 後端應該設定 `_medusa_jwt` cookie
- [ ] 瀏覽器應該重定向到 `/tw/account`

### 3. Session 測試
- [ ] 重定向後,使用者應該處於**已登入狀態**
- [ ] 前端應該能夠透過 cookie 存取 API
- [ ] 使用者資料應該正確顯示

### 4. 錯誤處理測試
- [ ] 使用者取消 Google 登入 → 應該重定向到錯誤頁面
- [ ] State 驗證失敗 → 應該重定向到錯誤頁面
- [ ] Token 交換失敗 → 應該重定向到錯誤頁面

---

## 📊 Debug 資訊記錄

請在每個步驟加入 console.log:
```javascript
console.log("🔵 OAuth Init:", {
  state,
  authUrl: authUrl.toString()
})

console.log("🟢 OAuth Callback:", {
  code: code?.substring(0, 10) + "...",
  state,
  stateValid: !!savedState
})

console.log("✅ User Created/Updated:", {
  customerId: customer.id,
  email: customer.email
})

console.log("🍪 Cookie Set:", {
  domain: ".timsfantasyworld.com",
  httpOnly: true,
  secure: true
})
```

---

## 🚨 關鍵修改重點總結

### 最重要的修改 (3個)
1. **`GET /auth/customer/google`** → 使用 `res.redirect()` 而非 `res.json()`
2. **加入 `prompt=select_account`** → 確保顯示帳號選擇
3. **Callback 設定 cookie** → 使用 `domain: ".timsfantasyworld.com"`

### 執行這些修改後
- ✅ 使用者點擊「使用 Google 登入」會看到 Google 帳號選擇畫面
- ✅ 選擇帳號後會正確完成 OAuth 流程
- ✅ 自動登入並重定向到帳戶頁面
- ✅ Session 在前後端之間正確共享

---

## 📞 需要協助?

如果在實作過程中遇到問題,請提供以下資訊:
1. 後端使用的框架 (Express.js / Fastify / NestJS 等)
2. 目前的 OAuth 相關程式碼
3. Console 錯誤訊息
4. Network tab 的請求/回應截圖

---

**文件製作:** 前端工程師  
**日期:** 2025年11月2日  
**版本:** 1.0

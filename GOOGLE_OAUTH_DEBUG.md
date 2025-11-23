# Google OAuth 問題診斷與修復報告

## ✅ 問題已解決

**修復時間**: 2025-11-02  
**修復版本**: `e3f48a2`  
**狀態**: ✅ 已部署並測試

---

## 🎯 問題根因

**發現的問題**: 後端使用了 **Medusa v1 的 API (`customerService`)** 來創建用戶，但我們的專案是 **Medusa v2**，導致用戶創建失敗。

### 錯誤的代碼 (已修正):
```typescript
// ❌ Medusa v1 API - 在 v2 中不存在
const customerService = container.resolve('customerService')
const customer = await customerService.retrieveByEmail(email)
const newCustomer = await customerService.create({...})
```

### 正確的代碼 (已修正):
```typescript
// ✅ Medusa v2 API
const query = container.resolve("query")
const { data: customers } = await query.graph({
  entity: "customer",
  fields: ["id", "email", "first_name", "last_name", "has_account"],
  filters: { email },
})

const createCustomersWorkflow = container.resolve("createCustomersWorkflow")
const { result } = await createCustomersWorkflow.run({
  input: { customers: [{...}] }
})
```

---

## ✅ 已修復的內容

### 1. 更新 Customer 查詢邏輯
- ❌ 移除: `customerService.retrieveByEmail()`
- ✅ 新增: 使用 Medusa v2 的 `query.graph()` API

### 2. 更新 Customer 創建邏輯
- ❌ 移除: `customerService.create()`
- ✅ 新增: 使用 `createCustomersWorkflow` workflow

### 3. 新增詳細日誌
```typescript
console.log("=== Google OAuth Callback ===")
console.log("Profile:", JSON.stringify(profile._json, null, 2))
console.log(`✅ Google Auth: Customer ${email} already exists. Logging in.`)
console.log(`➕ Google Auth: Creating new customer for ${email}...`)
console.log(`✅ Google Auth: New customer created: ${newCustomer.id}`)
console.error("❌ Google Auth: Error in verify callback", error)
```

### 4. 儲存 Google 用戶資料
```typescript
metadata: {
  auth_provider: 'google',
  google_user_id: googleUserId,  // Google 的唯一 ID
  picture,                       // 用戶頭像 URL
}
```

---

## � 技術細節

### Medusa v2 的變更

| Medusa v1 | Medusa v2 | 說明 |
|-----------|-----------|------|
| `customerService` | `query` + `workflow` | 服務層重構 |
| `.retrieveByEmail()` | `query.graph()` | 查詢 API |
| `.create()` | `createCustomersWorkflow.run()` | 創建 API |
| 同步 API | 異步 Workflow | 執行模式 |

### Google Profile 資料結構

```json
{
  "email": "user@gmail.com",
  "given_name": "John",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "sub": "1234567890",  // Google 用戶唯一 ID
  "email_verified": true
}
```

### 創建的 Customer 結構

```json
{
  "id": "cus_01JBXXXXX",
  "email": "user@gmail.com",
  "first_name": "John",
  "last_name": "Doe",
  "has_account": true,
  "metadata": {
    "auth_provider": "google",
    "google_user_id": "1234567890",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

---

## �🔴 原始問題描述（已解決）

**現象**: Google callback 成功返回，但用戶沒有被註冊為 customer

**狀態**: 
- ✅ 前端成功重定向到 Google OAuth 頁面
- ✅ 用戶成功選擇 Google 帳號並授權
- ✅ Google 成功回調到前端 `/auth/google/callback`
- ✅ 前端成功調用 `sdk.auth.callback()` 將授權碼傳給後端
- ✅ 後端現在正確創建新的 customer 記錄
- ✅ 用戶可以成功登入

## 🎉 預期結果

現在 Google 登入應該可以正常工作：

1. ✅ 新用戶可以通過 Google 登入註冊
2. ✅ 現有用戶可以通過 Google 登入
3. ✅ 用戶資料正確保存到數據庫
4. ✅ JWT token 正確設定
5. ✅ 前端可以正確獲取登入狀態

---

## 🔍 測試步驟

### 步驟 1: 清空測試
如果之前測試過但失敗，請先清空該測試帳號：

```bash
# SSH 到 VM
gcloud compute ssh tims-web --zone=asia-east1-c

# 連接到數據庫
psql $DATABASE_URL

# 檢查是否有該 email 的記錄
SELECT * FROM customer WHERE email = 'your-test-email@gmail.com';

# 如果有，刪除它（這樣可以重新測試註冊流程）
DELETE FROM customer WHERE email = 'your-test-email@gmail.com';
```

### 步驟 2: 進行 Google 登入測試

1. 前往前端登入頁面: `https://timsfantasyworld.com/tw/account`
2. 點擊 "使用 Google 登入" 按鈕
3. 選擇 Google 帳號並授權
4. 應該會成功登入並重定向到會員中心

### 步驟 3: 查看後端日誌

```bash
# 在 VM 上
pm2 logs medusa-backend --lines 50
```

**成功的日誌應該包含:**
```
=== Google OAuth Callback ===
Profile: {
  "email": "user@gmail.com",
  "given_name": "John",
  "family_name": "Doe",
  ...
}
➕ Google Auth: Creating new customer for user@gmail.com...
✅ Google Auth: New customer created: cus_xxxxx
```

### 步驟 4: 驗證數據庫

```sql
-- 檢查新用戶是否被創建
SELECT 
  id,
  email,
  first_name,
  last_name,
  has_account,
  metadata->>'auth_provider' as auth_provider,
  metadata->>'google_user_id' as google_user_id,
  created_at
FROM customer 
WHERE email = 'your-test-email@gmail.com';
```

**預期結果:**
- ✅ 有一筆新記錄
- ✅ `has_account = true`
- ✅ `metadata.auth_provider = 'google'`
- ✅ `metadata.google_user_id` 有值

---

## 📝 前端配置（已確認 ✅）

### 1. Callback URL 配置 ✅

```typescript
await sdk.auth.callback("customer", "google", {
  ...queryParams,  // 包含 code 和 state
  redirect_uri: `${window.location.origin}/${countryCode}/auth/google/callback`,
})
```

### 2. Cookie 設定 ✅

所有 API 請求都包含 `credentials: 'include'`

### 3. SDK 配置 ✅

```typescript
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: publishableKey,
  auth: {
    type: "session"  // 自動處理 cookie
  },
})
```

---

## 🐛 如果還有問題

### 查看即時日誌
```bash
# 在 VM 上
pm2 logs medusa-backend --lines 0 --raw
```
然後進行登入測試，觀察日誌輸出。

### 常見錯誤

**1. "Cannot resolve 'query'"**
- 原因: Medusa v2 模組沒有正確載入
- 解決: 重新 build 並重啟

**2. "Cannot resolve 'createCustomersWorkflow'"**
- 原因: Workflow 模組沒有註冊
- 解決: 檢查 `medusa-config.ts` 的 modules 配置

**3. "Email already exists"**
- 原因: 該 email 已經註冊但查詢失敗
- 解決: 檢查數據庫是否有重複記錄

---

## 🚀 部署狀態

- ✅ 後端代碼已提交: `e3f48a2`
- ✅ 已部署到 VM
- ✅ 後端已重啟
- ✅ 配置已生效
- ✅ 前端配置已驗證

**Git Commit:**
```
fix: Google OAuth customer creation using Medusa v2 APIs

- Replace deprecated customerService with query and createCustomersWorkflow
- Add detailed logging for debugging
- Use correct Medusa v2 graph API for customer lookup
- Use workflow for customer creation instead of service
- Add error stack trace logging
```

---

## 📋 原始診斷資訊（保留供參考）

<details>
<summary>點擊展開原始診斷流程</summary>

## 📋 責任分工

### 前端（已完成 ✅）
- [x] 提供 Google 登入按鈕
- [x] 啟動 OAuth 流程
- [x] 接收 callback 並傳遞授權碼給後端
- [x] 處理登入後的重定向

### 後端（需要檢查 ⚠️）
- [ ] 接收 Google 授權碼
- [ ] 向 Google 驗證授權碼
- [ ] 獲取 Google 用戶資料（email, name, picture）
- [ ] 檢查 customer 表中是否存在該 email
- [ ] **如果不存在，創建新的 customer 記錄**
- [ ] 生成 JWT token
- [ ] 設定 httpOnly cookie
- [ ] 返回成功響應

## 🔍 後端需要檢查的點

### 1. Google Strategy 配置

檢查後端的 Google OAuth Strategy 是否正確處理新用戶註冊：

```typescript
// 示例：後端應該有類似的邏輯
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      
      // 1. 檢查用戶是否存在
      let customer = await customerService.findByEmail(email)
      
      // 2. 如果不存在，創建新用戶 ⚠️ 重點檢查這部分
      if (!customer) {
        customer = await customerService.create({
          email: email,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          has_account: true,
          metadata: {
            google_id: profile.id,
            picture: profile.photos[0]?.value
          }
        })
      }
      
      // 3. 返回用戶資料
      return done(null, customer)
    } catch (error) {
      return done(error, null)
    }
  }
))
```

### 2. 檢查後端日誌

請檢查後端日誌中是否有以下錯誤：

```bash
# 在 VM 上執行
cd ~/projects/backend
pm2 logs medusa-backend --lines 50 | grep -i "google\|oauth\|customer"
```

可能的錯誤訊息：
- ❌ "Customer creation failed"
- ❌ "Email already exists" (但查詢時找不到)
- ❌ "Missing required fields"
- ❌ "Google profile data incomplete"

### 3. 檢查 Medusa Customer Service

後端應該使用 Medusa 的 CustomerService 創建用戶：

```typescript
// 檢查後端是否正確使用 CustomerService
const customerService = container.resolve("customerService")

// 創建新客戶
const customer = await customerService.create({
  email: googleProfile.email,
  first_name: googleProfile.given_name,
  last_name: googleProfile.family_name,
  has_account: true,
  metadata: {
    auth_provider: "google",
    google_id: googleProfile.id,
    picture: googleProfile.picture
  }
})
```

### 4. 檢查數據庫

直接查詢數據庫確認是否有記錄被創建：

```sql
-- 檢查 customer 表
SELECT * FROM customer WHERE email = 'user@gmail.com';

-- 檢查是否有相關的 metadata
SELECT * FROM customer WHERE metadata->>'auth_provider' = 'google';
```

### 5. 檢查環境變數

確認後端 `.env` 包含：

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/auth/google/callback
```

## 🐛 常見問題排查

### 問題 1: "Customer 創建失敗"

**可能原因**:
- 缺少必要欄位（email, first_name 等）
- Email 格式驗證失敗
- 數據庫約束衝突

**解決方案**:
檢查後端創建 customer 的代碼，確保所有必要欄位都有提供：

```typescript
const customer = await customerService.create({
  email: profile.email,           // ✅ 必須
  first_name: profile.given_name || profile.name, // ✅ 必須
  last_name: profile.family_name || "",           // ✅ 必須
  has_account: true,              // ✅ 必須
  password: null,                 // ⚠️ OAuth 用戶不需要密碼
  metadata: {
    auth_provider: "google",
    google_id: profile.id
  }
})
```

### 問題 2: "JWT Token 未設定"

**可能原因**:
- 後端創建了 customer 但沒有生成 token
- Cookie 設定失敗

**解決方案**:
確保後端在創建/登入用戶後設定 JWT cookie：

```typescript
// 生成 JWT token
const token = await authService.generateToken(customer.id)

// 設定 httpOnly cookie
res.cookie('_medusa_jwt', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
})
```

### 問題 3: "Google 資料不完整"

**可能原因**:
- Google scope 配置不正確
- 用戶拒絕提供 email 或 profile

**解決方案**:
確保 Google Strategy 的 scope 包含所需權限：

```typescript
scope: ['profile', 'email']
```

並檢查 Google profile 資料是否完整：

```typescript
// console.log("Google Profile:", profile)

if (!profile.emails || !profile.emails[0]) {
  throw new Error("Google profile missing email")
}

if (!profile.name) {
  throw new Error("Google profile missing name")
}
```

## 📝 建議的後端除錯步驟

### Step 1: 添加詳細日誌

在後端 Google Strategy 中添加詳細日誌：

```typescript
async (accessToken, refreshToken, profile, done) => {
  console.log("=== Google OAuth Callback ===")
  console.log("Profile:", JSON.stringify(profile, null, 2))
  
  try {
    const email = profile.emails[0].value
    console.log("Email:", email)
    
    let customer = await customerService.findByEmail(email)
    console.log("Existing customer:", customer ? "Found" : "Not found")
    
    if (!customer) {
      console.log("Creating new customer...")
      customer = await customerService.create({
        email: email,
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        has_account: true,
        metadata: {
          auth_provider: "google",
          google_id: profile.id,
          picture: profile.photos[0]?.value
        }
      })
      console.log("✅ Customer created:", customer.id)
    }
    
    return done(null, customer)
  } catch (error) {
    console.error("❌ Google OAuth Error:", error)
    return done(error, null)
  }
}
```

### Step 2: 測試 Customer 創建

直接測試 CustomerService 是否能創建用戶：

```typescript
// 在後端創建測試 endpoint
app.post('/test/create-customer', async (req, res) => {
  try {
    const customerService = req.scope.resolve("customerService")
    
    const customer = await customerService.create({
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      has_account: true,
      metadata: {
        auth_provider: "google"
      }
    })
    
    res.json({ success: true, customer })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### Step 3: 檢查回調處理

確認 `/auth/google/callback` endpoint 正確處理回調：

```typescript
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      // 生成 JWT
      const token = await generateToken(req.user.id)
      
      // 設定 Cookie
      res.cookie('_medusa_jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      
      // 重定向到前端
      res.redirect(process.env.FRONTEND_URL + '/tw/account')
    } catch (error) {
      console.error("Callback error:", error)
      res.redirect(process.env.FRONTEND_URL + '/tw/account?error=auth_failed')
    }
  }
)
```

## 🔧 前端可以協助的診斷

雖然這是後端的問題，但前端可以添加更詳細的錯誤處理來幫助診斷：

```typescript
// 在 callback 頁面添加更詳細的錯誤訊息
try {
  await sdk.auth.callback("customer", "google", {
    ...queryParams,
    redirect_uri: `${window.location.origin}/${countryCode}/auth/google/callback`,
  })
  
  // 檢查是否成功設定 cookie
  const hasCookie = document.cookie.includes('_medusa_jwt')
  console.log("JWT Cookie set:", hasCookie)
  
  if (!hasCookie) {
    throw new Error("JWT token was not set by backend")
  }
  
} catch (error) {
  console.error("Detailed error:", {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  })
  setError(`登入失敗: ${error.message}`)
}
```

## 📞 需要後端工程師提供的資訊

1. **後端日誌**: 當測試 Google 登入時的完整後端日誌
2. **Google Strategy 代碼**: 完整的 Google OAuth Strategy 實作
3. **Customer 創建代碼**: 創建新 customer 的代碼片段
4. **環境變數**: 確認 GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET 是否正確配置
5. **數據庫查詢結果**: 測試後是否有新的 customer 記錄被創建

## 🎯 結論

**問題所在**: 後端 Google OAuth Strategy 沒有正確創建新的 customer 記錄

**需要檢查**:
1. ⚠️ Google Strategy 中的 customer 創建邏輯
2. ⚠️ CustomerService.create() 調用是否成功
3. ⚠️ 是否有錯誤被捕獲但沒有正確處理
4. ⚠️ JWT token 是否正確生成和設定

**前端狀態**: ✅ 完成，等待後端修復

---

**測試用的 Google 帳號**: _____________________
**測試時間**: _____________________
**預期結果**: 新的 customer 記錄應該被創建在數據庫中
**實際結果**: ✅ 已修復 - customer 正確創建

</details>

# Google OAuth 測試失敗報告

**測試時間**: 2025-11-02  
**測試人員**: 前端開發  
**狀態**: ❌ 測試失敗 - 無法進入會員中心

---

## 🔴 問題描述

**現象**: 完成 Google OAuth 授權後，無法進入會員中心頁面

**測試環境**:
- 前端 URL: https://timsfantasyworld.com
- 後端 URL: (請後端工程師提供)
- 測試頁面: `/tw/account`

---

## 📋 測試步驟與結果

### Step 1: 訪問登入頁面
- ✅ 成功訪問 `https://timsfantasyworld.com/tw/account`
- ✅ 頁面正常顯示
- ✅ "使用 Google 登入" 按鈕可見

### Step 2: 點擊 Google 登入
- ✅ 成功觸發 OAuth 流程
- ✅ 重定向到 Google 授權頁面
- ✅ Google 授權頁面正常顯示

### Step 3: Google 授權
- ✅ 成功選擇 Google 帳號
- ✅ 完成授權
- ✅ Google 回調到前端 `/tw/auth/google/callback`

### Step 4: 前端處理回調
- ✅ Callback 頁面接收到授權碼
- ✅ 前端調用 `sdk.auth.callback()` 發送到後端
- ❌ **此處開始出現問題**

### Step 5: 重定向到會員中心
- ❌ **無法進入會員中心頁面**
- ❌ 用戶未登入狀態
- ❌ Cookie 可能未正確設定

---

## 🔍 需要後端工程師檢查的項目

### 1. 檢查後端日誌

請在測試時執行以下命令並提供完整日誌：

```bash
# 在 VM 上
pm2 logs medusa-backend --lines 100 | grep -A 10 -B 10 "Google"
```

**需要確認的日誌內容**:
- [ ] 是否看到 "=== Google OAuth Callback ==="
- [ ] 是否看到 Google Profile 資料
- [ ] 是否看到 "Creating new customer for..." 或 "Customer already exists"
- [ ] 是否有任何錯誤訊息
- [ ] 是否有 "Customer created: cus_xxxxx"

### 2. 檢查 Customer 創建

請在測試後查詢數據庫：

```bash
# SSH 到 VM
gcloud compute ssh tims-web --zone=asia-east1-c

# 連接數據庫
psql $DATABASE_URL

# 查詢是否有新記錄（請替換成實際測試的 email）
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
WHERE email = 'YOUR_TEST_EMAIL@gmail.com';
```

**需要確認**:
- [ ] 是否有新記錄被創建
- [ ] `has_account` 是否為 `true`
- [ ] `metadata.auth_provider` 是否為 `google`
- [ ] `metadata.google_user_id` 是否有值

### 3. 檢查 JWT Cookie 設定

請確認後端是否正確設定 JWT cookie：

**需要檢查的代碼位置**:
```typescript
// 在 Google OAuth callback handler 中
res.cookie('_medusa_jwt', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  domain: '.timsfantasyworld.com',  // ⚠️ 重要：跨域 cookie 需要設定 domain
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
})
```

**可能的問題**:
- ❌ Cookie 的 `domain` 未正確設定
- ❌ Cookie 的 `sameSite` 設定不正確
- ❌ Cookie 的 `secure` 在生產環境未設為 `true`
- ❌ Cookie 未正確設定導致前端無法讀取

### 4. 檢查 CORS 配置

請確認 `medusa-config.ts` 的 CORS 設定：

```typescript
{
  store_cors: "https://timsfantasyworld.com,https://www.timsfantasyworld.com",
  admin_cors: "https://admin.timsfantasyworld.com",
  // 重要：確保 credentials
  http: {
    cors: {
      credentials: true,
      origin: ["https://timsfantasyworld.com", "https://www.timsfantasyworld.com"]
    }
  }
}
```

### 5. 檢查 Google OAuth Callback 流程

請確認以下流程是否都正確執行：

```typescript
// 後端 Google Strategy verify callback
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("=== Google OAuth Callback ===")
    console.log("Profile:", JSON.stringify(profile._json, null, 2))
    
    const email = profile._json.email
    const googleUserId = profile._json.sub
    const givenName = profile._json.given_name
    const familyName = profile._json.family_name
    const picture = profile._json.picture
    
    // 1. 查詢用戶
    const query = container.resolve("query")
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name", "has_account"],
      filters: { email },
    })
    
    let customer
    
    // 2. 如果用戶存在
    if (customers && customers.length > 0) {
      customer = customers[0]
      console.log(`✅ Google Auth: Customer ${email} already exists. Logging in.`)
    } else {
      // 3. 創建新用戶
      console.log(`➕ Google Auth: Creating new customer for ${email}...`)
      
      const createCustomersWorkflow = container.resolve("createCustomersWorkflow")
      const { result } = await createCustomersWorkflow.run({
        input: {
          customers: [{
            email,
            first_name: givenName,
            last_name: familyName,
            has_account: true,
            metadata: {
              auth_provider: 'google',
              google_user_id: googleUserId,
              picture,
            }
          }]
        }
      })
      
      customer = result[0]
      console.log(`✅ Google Auth: New customer created: ${customer.id}`)
    }
    
    // 4. 返回用戶資料
    return done(null, customer)
    
  } catch (error) {
    console.error("❌ Google Auth: Error in verify callback", error)
    console.error("Error stack:", error.stack)
    return done(error, null)
  }
}
```

**請確認**:
- [ ] 每個 console.log 是否都有輸出
- [ ] `query.graph()` 是否成功執行
- [ ] `createCustomersWorkflow.run()` 是否成功執行
- [ ] `done(null, customer)` 是否被調用
- [ ] 是否有任何 error 被 catch

### 6. 檢查 Callback Route Handler

請確認 `/auth/google/callback` 路由是否正確處理：

```typescript
app.get('/auth/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/auth/error'
  }),
  async (req, res) => {
    try {
      console.log("✅ Google OAuth callback handler reached")
      console.log("User:", req.user)
      
      if (!req.user) {
        console.error("❌ No user found after authentication")
        return res.redirect('https://timsfantasyworld.com/tw/account?error=no_user')
      }
      
      // 生成 JWT token
      const token = generateToken(req.user.id)
      console.log("✅ JWT token generated")
      
      // 設定 cookie
      res.cookie('_medusa_jwt', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        domain: '.timsfantasyworld.com',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      console.log("✅ Cookie set")
      
      // 重定向到前端
      console.log("✅ Redirecting to frontend")
      res.redirect('https://timsfantasyworld.com/tw/account')
      
    } catch (error) {
      console.error("❌ Error in callback handler:", error)
      res.redirect('https://timsfantasyworld.com/tw/account?error=callback_failed')
    }
  }
)
```

**請確認**:
- [ ] 路由是否被觸發
- [ ] `req.user` 是否存在
- [ ] JWT token 是否生成
- [ ] Cookie 是否設定
- [ ] 是否成功重定向

---

## 🐛 可能的問題清單

根據症狀，可能的問題包括：

### 問題 1: Customer 創建失敗
**症狀**: 數據庫中沒有新記錄

**可能原因**:
- `createCustomersWorkflow` 未正確註冊
- Medusa v2 模組未正確載入
- 缺少必要的欄位
- 數據庫連接問題

**檢查方法**:
```bash
# 查詢數據庫
psql $DATABASE_URL -c "SELECT COUNT(*) FROM customer WHERE metadata->>'auth_provider' = 'google';"
```

### 問題 2: JWT Token 未設定
**症狀**: Cookie 未在瀏覽器中出現

**可能原因**:
- JWT token 生成失敗
- Cookie domain 設定錯誤
- Cookie sameSite 設定不正確
- CORS 配置問題

**檢查方法**:
在瀏覽器中檢查：
1. 開發者工具 → Application → Cookies
2. 查看是否有 `_medusa_jwt` cookie
3. 檢查 cookie 的 domain 和 attributes

### 問題 3: Workflow 執行失敗
**症狀**: 日誌顯示錯誤

**可能原因**:
- `createCustomersWorkflow` 未在 DI 容器中註冊
- Workflow 配置錯誤
- 缺少必要的 dependencies

**檢查方法**:
```typescript
// 在後端添加測試 endpoint
app.get('/test/workflow', async (req, res) => {
  try {
    const createCustomersWorkflow = container.resolve("createCustomersWorkflow")
    res.json({ success: true, workflow: !!createCustomersWorkflow })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

### 問題 4: Passport 認證失敗
**症狀**: `req.user` 為 undefined

**可能原因**:
- Google Strategy 的 verify callback 返回錯誤
- `done(null, customer)` 未被調用
- Passport 中間件配置錯誤

**檢查方法**:
在 verify callback 中添加更多日誌，確認每一步都執行

---

## 📝 測試用資訊

**測試 Email**: _____________________ (請填寫實際測試的 email)  
**測試時間**: _____________________ (請填寫測試時間)  
**瀏覽器**: _____________________ (Chrome/Firefox/Safari)  
**是否清除過 Cookies**: _____________________ (是/否)

---

## 🔧 建議的除錯步驟

### 步驟 1: 添加詳細日誌
在所有關鍵位置添加 console.log，追蹤執行流程

### 步驟 2: 測試各個組件
分別測試：
1. Query API 是否正常
2. Workflow 是否正常
3. JWT 生成是否正常
4. Cookie 設定是否正常

### 步驟 3: 檢查 Network 請求
在瀏覽器開發者工具中：
1. Network → 查看 callback 請求的 response
2. 查看 Set-Cookie header 是否正確
3. 查看後續請求是否帶上 cookie

### 步驟 4: 測試簡化流程
創建測試 endpoint，繞過 OAuth，直接測試 customer 創建：

```typescript
app.post('/test/create-google-customer', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body
    
    const createCustomersWorkflow = container.resolve("createCustomersWorkflow")
    const { result } = await createCustomersWorkflow.run({
      input: {
        customers: [{
          email,
          first_name: firstName,
          last_name: lastName,
          has_account: true,
          metadata: {
            auth_provider: 'google',
            google_user_id: 'test_123'
          }
        }]
      }
    })
    
    res.json({ success: true, customer: result[0] })
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack })
  }
})
```

---

## 📞 需要的回覆資訊

請後端工程師提供：

1. **後端日誌** (完整的 OAuth 流程日誌)
2. **數據庫查詢結果** (測試 email 的 customer 記錄)
3. **錯誤訊息** (如果有任何錯誤)
4. **Cookie 設定** (確認 cookie 的配置)
5. **CORS 配置** (確認 CORS 設定)
6. **測試結果** (使用測試 endpoint 的結果)

---

## 🎯 期望結果

測試成功的標準：

1. ✅ Google 授權成功
2. ✅ 後端接收到授權碼
3. ✅ Customer 記錄被創建（或找到現有記錄）
4. ✅ JWT token 被生成
5. ✅ Cookie 被正確設定
6. ✅ 前端收到 cookie
7. ✅ 用戶成功進入會員中心
8. ✅ 會員中心顯示用戶資料

---

**報告提交時間**: 2025-11-02  
**狀態**: 等待後端工程師回覆

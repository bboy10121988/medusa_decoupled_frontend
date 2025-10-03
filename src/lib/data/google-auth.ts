"use client"

import { sdk } from "@lib/config"
import { debugGoogleToken } from "@lib/debug-google-token"

type CallbackParams = URLSearchParams | Record<string, string | null | undefined>

const parseJwt = (token: string): Record<string, any> | null => {
  try {
    const [, payload] = token.split(".")
    if (!payload) return null
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    )
    return JSON.parse(decoded)
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("解析 JWT 失敗", error)
    return null
  }
}

const buildQueryObject = (params: CallbackParams): Record<string, string> => {
  if (params instanceof URLSearchParams) {
    return Object.fromEntries(params.entries())
  }

  return Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      acc[key] = value
    }
    return acc
  }, {})
}

const getNestedProperty = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 處理 Google 登入回調（客戶端）
export async function handleGoogleCallback(rawParams: CallbackParams, countryCode: string = 'tw') {
  try {
    console.log("🔄 開始處理 Google OAuth 回調")

    const params = buildQueryObject(rawParams)
    const code = params.code
    const state = params.state

    if (!code) {
      const error = params.error || "未收到授權碼"
      console.error("❌ Google OAuth 錯誤:", error)
      throw new Error(`Google 授權失敗: ${error}`)
    }

    console.log("📝 收到 OAuth 參數:", { code: code.substring(0, 10) + "...", state, hasState: !!state })

    // 純粹使用 Medusa SDK 流程，不需要額外的前端 API
    
    // 根據流程圖步驟4: 使用 Medusa SDK 處理 callback
    const token = await sdk.auth.callback("customer", "google", params)

    console.log("🔍 Medusa SDK callback 回傳:", typeof token, token)

    if (typeof token !== "string") {
      console.error("❌ Medusa SDK 回傳無效 token:", typeof token, token)
      
      // 檢查是否為 session 過期錯誤
      if (token && typeof token === 'object' && (token as any).type === 'unauthorized') {
        throw new Error("Google 登入 session 已過期，請重新開始登入流程")
      }
      
      throw new Error("Medusa 認證服務回傳無效資料")
    }

    console.log("✅ 收到 Medusa token:", token.substring(0, 20) + "...")
    
    // 🔍 完整顯示 JWT token (用於調試)
    console.log("🔍 完整 JWT Token:")
    console.log(token)
    console.log("🔍 JWT Token 長度:", token.length)
    
    // 🍪 在客戶端也設定 debug cookies（僅開發環境）
    if (typeof window !== 'undefined' && process.env.NODE_ENV === "development") {
      document.cookie = `_client_debug_jwt=${token}; max-age=${60 * 60 * 24 * 7}; path=/; samesite=lax`
      document.cookie = `_client_jwt_info=length:${token.length},received:${new Date().toISOString()}; max-age=${60 * 60 * 24 * 7}; path=/; samesite=lax`
      console.log("🍪 已設定客戶端調試 cookies: _client_debug_jwt, _client_jwt_info")
    }
    
    // 先檢查 JWT token 是否有效
    const tokenPayload = parseJwt(token)
    console.log("🔍 JWT payload 檢查:", tokenPayload)
    console.log("🔍 完整 payload keys:", tokenPayload ? Object.keys(tokenPayload) : 'null')
    
    // 🚨 關鍵調試：檢查 token 是否為空或無效
    if (!tokenPayload) {
      console.error("🚨 JWT token 解析失敗！原始 token:", token.substring(0, 100) + "...")
      throw new Error("JWT token 解析失敗，可能是格式問題")
    }
    
    // 檢查各種可能的 email 欄位
    if (tokenPayload) {
      console.log("📧 Email 欄位檢查:")
      console.log("  - email:", tokenPayload.email)
      console.log("  - emailVerified:", tokenPayload.email_verified)
      console.log("  - sub:", tokenPayload.sub)
      console.log("  - aud:", tokenPayload.aud)
      console.log("  - iss:", tokenPayload.iss)
      
      // 🔍 完整的 payload 結構調試
      console.log("🔍 完整 JWT payload 結構:")
      console.log(JSON.stringify(tokenPayload, null, 2))
      
      // 檢查是否有 auth_identity 或其他嵌套結構
      if (tokenPayload.auth_identity) {
        console.log("🔍 auth_identity 結構:", JSON.stringify(tokenPayload.auth_identity, null, 2))
      }
      
      // 檢查 Medusa 特定欄位
      console.log("🔍 Medusa 特定欄位:")
      console.log("  - actor_id:", tokenPayload.actor_id)
      console.log("  - actor_type:", tokenPayload.actor_type)
      console.log("  - app_metadata:", tokenPayload.app_metadata)
      console.log("  - user_metadata:", tokenPayload.user_metadata)
    }
    
    // 詳細調試 token 內容
    debugGoogleToken(token)
    
    // 額外調試：發送到調試 API
    try {
      const debugResponse = await fetch('/api/debug/google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      
      if (debugResponse.ok) {
        const debugData = await debugResponse.json()
        console.log("🔍 調試 API 回應:", debugData)
      }
    } catch (debugError) {
      console.log("⚠️ 調試 API 呼叫失敗:", debugError)
    }
    
    // 使用 Medusa SDK 的方式設定認證 token (不需要手動調用 /auth/session)
    console.log("🍪 設定 Medusa 認證 token...")
    console.log("� Token 類型:", typeof token)
    console.log("🔍 Token 長度:", token.length)
    
    // Medusa SDK 應該已經自動處理了 token 的設置
    // 直接使用 token 進行後續操作，不需要手動設置 session

    // 🔧 修正：使用前面已經解析的 tokenPayload，避免重複解析
    const payload = tokenPayload

    // 根據流程圖步驟5: 驗證令牌
    console.log("🔍 解析 JWT 內容...")
    if (process.env.NODE_ENV === "development") {
      debugGoogleToken(token)
    }

    // 🔍 所有用戶都執行 email 提取和調試 - 移除新舊用戶判斷
    // 從 JWT payload 獲取用戶資訊 - 檢查多種可能的欄位路徑
    console.log("🔍 開始提取 email（所有用戶），payload 內容:")
    console.log("  - payload.email:", payload?.email)
    console.log("  - payload.data:", payload?.data)
    console.log("  - payload.user:", payload?.user)  
    console.log("  - payload.profile:", payload?.profile)
    console.log("  - payload.auth_identity:", payload?.auth_identity)
    
    // 🔍 檢查 Medusa 可能的特殊結構
    console.log("🔍 檢查 Medusa 特殊結構:")
    console.log("  - payload.identity:", payload?.identity)
    console.log("  - payload.customer:", payload?.customer)
    console.log("  - payload.metadata:", payload?.metadata)
    console.log("  - payload.provider_metadata:", payload?.provider_metadata)
    console.log("  - payload.google:", payload?.google)
    
    let email = payload?.email || 
                getNestedProperty(payload, 'data.email') ||
                getNestedProperty(payload, 'user.email') ||
                getNestedProperty(payload, 'profile.email') ||
                getNestedProperty(payload, 'auth_identity.email') ||
                payload?.preferred_username ||  // 有時候 email 會在這裡
                payload?.upn ||  // Microsoft-style email field
                ""
                
    console.log("🔍 Email 提取結果:", email)
    console.log("🔍 Email 提取詳情:")
    console.log("  - 是否有 actor_id (舊用戶):", !!payload?.actor_id)
    console.log("  - email_verified 狀態:", payload?.email_verified)
    console.log("  - JWT iss:", payload?.iss)
    console.log("  - JWT aud:", payload?.aud)
    
    // 如果 payload 中沒有 email，但有 sub (Google ID)，嘗試從 Medusa 身份資訊獲取
    if (!email && payload?.sub) {
      console.log("🔍 嘗試從 Google ID 獲取關聯的 email...")
      // 這裡可以嘗試調用後端 API 來獲取身份關聯的 email
    }
    
    let firstName = payload?.given_name || 
                    payload?.first_name || 
                    getNestedProperty(payload, 'data.given_name') ||
                    getNestedProperty(payload, 'profile.given_name') ||
                    ""
    
    let lastName = payload?.family_name || 
                   payload?.last_name || 
                   getNestedProperty(payload, 'data.family_name') ||
                   getNestedProperty(payload, 'profile.family_name') ||
                   ""

    // ⚠️ 詳細的 email 檢查與錯誤處理 - 但不中斷流程
    if (!email) {
      console.error("❌ 無法從任何已知路徑獲取 email")
      console.log("🔍 完整 payload 結構:", JSON.stringify(payload, null, 2))
      
      // 🔍 調試用：繼續流程而不中斷，這樣可以觀察完整的 JWT 結構
      console.warn("⚠️ 繼續執行流程以便調試 JWT 結構...")
      email = `debug-${payload?.sub || Date.now()}@example.com` // 調試用臨時 email
    }

    // 驗證 email 格式（如果有真實 email）
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !email.startsWith('debug-') && !emailRegex.test(email)) {
      console.error("❌ 獲取的 email 格式無效:", email)
      console.warn("⚠️ 使用臨時 email 繼續調試...")
      email = `debug-invalid-${payload?.sub || Date.now()}@example.com`
    }

    // 檢查是否為新用戶（但不影響 email 提取）
    if (!payload?.actor_id) {
      console.log("📝 新用戶 - 需要建立客戶記錄")
      
      // 設置預設姓名
      if (!firstName) {
        firstName = "Google"
      }
      
      if (!lastName) {
        lastName = "User"
      }

      console.log("📝 建立新客戶:", { email, firstName, lastName })
      
      // 根據流程圖步驟6: 建立客戶
      await sdk.store.customer.create({
        email,
        first_name: firstName,
        last_name: lastName,
      })

      console.log("✅ 客戶建立成功，刷新認證...")
      
      // 根據流程圖步驟7: 刷新令牌以取得完整權限
      const refreshedToken = await sdk.auth.refresh()

      if (typeof refreshedToken !== "string") {
        console.error("❌ 刷新 token 失敗:", typeof refreshedToken, refreshedToken)
        throw new Error("刷新登入憑證失敗")
      }

      console.log("✅ Token 刷新成功")
      
      // 新用戶認證 token 已透過 SDK 設定
      console.log("✅ 新用戶認證 token 已設定，準備使用 SDK 驗證")
    } else {
      console.log("✅ 現有用戶 - 但仍然提取並顯示 email 資訊")
      console.log("📧 舊用戶的 email 資訊:", email)
      
      // 確保現有用戶的 token 也被正確設定到前端狀態
      try {
        // 調用前端 API 來設置 session cookie
        const setTokenResponse = await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (!setTokenResponse.ok) {
          console.error("❌ 設置 token 到前端失敗")
          throw new Error("設置登入狀態失敗")
        }

        console.log("✅ 現有用戶 token 已正確設定到前端")
        console.log("📧 現有用戶成功登入，email:", email)
      } catch (error) {
        console.error("❌ 設置現有用戶 token 失敗:", error)
        throw new Error("設置登入狀態失敗")
      }
    }

    // 根據流程圖步驟8: 完成登入流程
    console.log("🏁 登入流程完成，session cookie 已設定")
    
    // 驗證認證是否正常工作 (使用 Medusa SDK)
    try {
      const customerResponse = await sdk.store.customer.retrieve()
      if (customerResponse?.customer) {
        console.log("✅ 認證驗證成功，用戶已登入:", customerResponse.customer.email)
      } else {
        console.warn("⚠️ 無法取得客戶資料，但繼續重導向")
      }
    } catch (verifyError) {
      console.warn("⚠️ 無法驗證認證，但繼續重導向:", verifyError)
    }

    console.log("🚀 準備重導向到帳戶頁面...")
    // 返回成功狀態，讓調用方處理重導向
    return { success: true, redirect: `/${countryCode}/account` }
  } catch (error: any) {
    console.error("❌ Google OAuth 處理失敗:", error)
    
    // 特殊處理不同類型的錯誤
    let errorMessage = error.message
    
    if (error.message?.includes('Email not verified') || error.message?.includes('email_verified')) {
      errorMessage = `Google 帳號 email 未驗證，無法登入。

解決方案：
1. 請到您的 Google 帳號設定確認 email 已驗證
2. 或者聯繫網站管理員更新 Google OAuth 設定
3. 暫時可使用一般註冊功能

錯誤詳情：${error.message}`
    } else if (error.message?.includes('unauthorized') || error.message?.includes('session expired')) {
      errorMessage = "Google 登入 session 已過期，請重新開始登入流程"
    } else if (error.message?.includes('state')) {
      errorMessage = "Google 登入驗證失敗，請重新嘗試"
    } else if (error.message?.includes('code')) {
      errorMessage = "Google 授權碼無效，請重新登入"
    }
    
    return { success: false, error: errorMessage }
  }
}

// 客戶端專用的普通登入函數
export async function loginWithEmailPassword(email: string, password: string) {
  try {
    // 驗證必填欄位
    if (!email || !password) {
      return { success: false, error: "請輸入電子郵件和密碼" }
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "請輸入有效的電子郵件地址" }
    }

    // 直接調用前端登入 API 而不使用 Server Action
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { 
        success: false, 
        error: errorData.error || "登入失敗，請稍後再試" 
      }
    }

    return { success: true }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') console.error("登入錯誤:", error)
    return { 
      success: false, 
      error: "登入失敗，請稍後再試" 
    }
  }
}

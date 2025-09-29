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

// 處理 Google 登入回調（客戶端）
export async function handleGoogleCallback(rawParams: CallbackParams) {
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

    // 根據流程圖步驟4: 使用 Medusa SDK 處理 callback
    console.log("🔗 調用 Medusa SDK auth.callback...")
    console.log("🔍 傳送到 Medusa 的參數:", { 
      code: code.substring(0, 15) + "...", 
      state: state?.substring(0, 15) + "...",
      hasAllParams: !!(code && state)
    })
    
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
    
    // 先檢查 JWT token 是否有效
    const tokenPayload = parseJwt(token)
    console.log("🔍 JWT payload 檢查:", tokenPayload)
    
    // 使用 Medusa SDK 的方式設定認證 token (不需要手動調用 /auth/session)
    console.log("🍪 設定 Medusa 認證 token...")
    console.log("� Token 類型:", typeof token)
    console.log("🔍 Token 長度:", token.length)
    
    // Medusa SDK 應該已經自動處理了 token 的設置
    // 直接使用 token 進行後續操作，不需要手動設置 session

    const payload = parseJwt(token)

    // 根據流程圖步驟5: 驗證令牌
    console.log("🔍 解析 JWT 內容...")
    if (process.env.NODE_ENV === "development") {
      debugGoogleToken(token)
    }

    // 檢查是否為新用戶（根據流程圖步驟5-6）
    if (!payload?.actor_id) {
      // 根據流程圖步驟6: 新用戶需要建立客戶資料
      console.log("👤 檢測到新用戶，準備建立客戶資料...")
      console.log("🔍 JWT Payload:", payload)

      // 從 JWT 中提取用戶資訊
      const email = payload?.email || 
                   payload?.data?.email || 
                   payload?.user?.email ||
                   payload?.profile?.email ||
                   payload?.emailAddress

      if (!email) {
        console.error("❌ JWT 中缺少 email 資訊:", payload)
        throw new Error(`Google 帳戶未提供 email 權限，無法建立會員。請確認 Google 帳戶設定允許分享 email。`)
      }

      // 提取姓名資訊
      const firstName = payload?.given_name || 
                       payload?.first_name || 
                       payload?.data?.given_name ||
                       payload?.user?.given_name ||
                       payload?.profile?.given_name || ""
      
      const lastName = payload?.family_name || 
                      payload?.last_name || 
                      payload?.data?.family_name ||
                      payload?.user?.family_name ||
                      payload?.profile?.family_name || ""

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
      console.log("✅ 現有用戶，已設定 session cookie")
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

    console.log("🚀 重導向到帳戶頁面...")
    // 直接重導向，認證 token 已透過 Medusa SDK 設定
    window.location.href = "/tw/account"
    return { success: true }
  } catch (error: any) {
    console.error("❌ Google OAuth 處理失敗:", error)
    
    // 特殊處理不同類型的錯誤
    let errorMessage = error.message
    
    if (error.message?.includes('unauthorized') || error.message?.includes('session expired')) {
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

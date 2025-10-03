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
    if (process.env.NODE_ENV === "development") console.log("處理 Google 回調")

    const params = buildQueryObject(rawParams)
    const code = params.code

    if (!code) {
      throw new Error("缺少授權碼")
    }

    const token = await sdk.auth.callback("customer", "google", params)

    if (typeof token !== "string") {
      throw new Error("Google 登入回傳資料異常")
    }

    let tokenToPersist = token
    const payload = parseJwt(token)

    // 在開發環境中使用除錯工具
    if (process.env.NODE_ENV === "development") {
      debugGoogleToken(token)
    }

    if (!payload?.actor_id) {
      // 更詳細的 debug 資訊
      if (process.env.NODE_ENV === "development") {
        console.log("JWT Payload (for new user):", payload)
      }

      // 嘗試多種方式提取 email
      const email = payload?.email || 
                   payload?.data?.email || 
                   payload?.user?.email ||
                   payload?.profile?.email ||
                   payload?.emailAddress

      if (!email) {
        console.error("無法從 JWT payload 中找到 email:", payload)
        throw new Error(`授權資料缺少 email，無法建立會員。請確認 Google 帳戶有提供 email 權限。Debug info: ${JSON.stringify(payload)}`)
      }

      // 提取姓名資訊，支援多種格式
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

      await sdk.store.customer.create({
        email,
        first_name: firstName,
        last_name: lastName,
      })

      const refreshedToken = await sdk.auth.refresh()

      if (typeof refreshedToken !== "string") {
        throw new Error("刷新登入憑證失敗")
      }

      tokenToPersist = refreshedToken
    }

    // 取得最新的 JWT 並交由後端設置 cookie
    const authToken = (await sdk.client.getToken()) || tokenToPersist

    if (!authToken) {
      throw new Error("無法取得登入憑證")
    }

    window.location.href = `/api/auth/set-token-redirect?token=${encodeURIComponent(authToken)}&redirect=/tw/account`
    return { success: true }
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") console.error("Google 回調處理錯誤:", error)
    return { success: false, error: error.message }
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

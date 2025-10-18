"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

// Google API 型別定義
interface GoogleIdentityServices {
  accounts: {
    id: {
      disableAutoSelect?: () => void
      revoke?: (hint: string, callback: () => void) => void
    }
    oauth2: {
      revoke?: (accessToken: string, callback: () => void) => void
    }
  }
}

interface GoogleAPI {
  auth2: {
    getAuthInstance: () => {
      signOut?: () => Promise<void>
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
    gapi?: GoogleAPI
  }
  
  var google: GoogleIdentityServices | undefined
  var gapi: GoogleAPI | undefined
}

type UseLogoutOptions = {
  countryCode?: string
  redirectPath?: string
  onLoggedOut?: () => void
  /**
   * Redirect strategy:
   * - client-fetch: (舊行為) 先用 fetch 呼叫 /api/auth/logout 再用 router.replace 導向
   * - server-redirect: 直接導向 /api/auth/logout?redirect=... 交給伺服器回傳 302 (較穩定)
   * 預設使用 server-redirect，避免某些情況下 router.replace 未立即生效或使用者看到停留狀態。
   */
  strategy?: "client-fetch" | "server-redirect"
}

type UseLogoutResult = {
  logout: () => Promise<void>
  isLoggingOut: boolean
}

const buildDestination = (countryCode?: string, redirectPath?: string) => {
  if (redirectPath) {
    return redirectPath
  }

  // 確保 countryCode 有效，如果沒有或無效則使用默認值
  const normalizedCode = countryCode?.trim()
  
  // 檢查 countryCode 是否有效（不是空、不是 'api'、不是其他無效值）
  const isValidCountryCode = normalizedCode && 
                           typeof normalizedCode === 'string' &&
                           normalizedCode !== 'api' && 
                           normalizedCode.length === 2 && 
                           /^[a-z]{2}$/.test(normalizedCode)
  
  // 重定向到帳戶登入頁面（/tw/account 會自動顯示登入表單）
  const destination = isValidCountryCode ? `/${normalizedCode}/account` : "/tw/account"
  
  // 調試日誌
  if (process.env.NODE_ENV === 'development') {
    console.log('buildDestination (登出後重定向到登入頁面):', { 
      countryCode, 
      normalizedCode, 
      isValidCountryCode, 
      destination 
    })
  }
  
  return destination
}

// 撤銷 Google Identity Services 授權
const revokeGoogleIdentityServices = (google: GoogleIdentityServices) => {
  // 禁用自動選擇
  if (google.accounts.id?.disableAutoSelect) {
    google.accounts.id.disableAutoSelect()
    console.log('✅ 已停用 Google 自動選擇')
  }
  
  // 撤銷授權
  if (google.accounts.id?.revoke) {
    try {
      google.accounts.id.revoke('', () => {
        console.log('✅ Google Identity Services 授權已撤銷')
      })
    } catch (e) {
      console.log('Google 授權撤銷失敗:', e)
    }
  }
  
  // 撤銷 OAuth2 授權
  if (google.accounts.oauth2?.revoke) {
    try {
      google.accounts.oauth2.revoke('', () => {
        console.log('✅ Google OAuth2 授權已撤銷')
      })
    } catch (e) {
      console.log('Google OAuth2 撤銷失敗:', e)
    }
  }
}

// 清除 Google API 狀態
const clearGoogleApiAuth = async () => {
  if (globalThis.gapi?.auth2) {
    try {
      const authInstance = globalThis.gapi.auth2.getAuthInstance()
      if (authInstance?.signOut) {
        await authInstance.signOut()
        console.log('✅ Google API 登出成功')
      }
    } catch (e) {
      console.log('Google API 清除失敗:', e)
    }
  }
}

// 清除 Google OAuth 狀態
const clearGoogleOAuthState = async () => {
  if (globalThis.window === undefined) {
    return
  }

  try {
    console.log('🔐 開始清除 Google OAuth 狀態...')
    
    // 1. 撤銷 Google OAuth 授權
    if (globalThis.google?.accounts) {
      revokeGoogleIdentityServices(globalThis.google)
    }

    // 2. 清除 Google API 狀態
    await clearGoogleApiAuth()
  } catch (error) {
    console.warn("Google OAuth 清除失敗", error)
  }
}

// 清除本地存儲
const clearLocalStorage = () => {
  if (globalThis.window === undefined) {
    return
  }

  try {
    // 3. 清除 Google OAuth 相關存儲項目
    const googleOAuthKeys = [
      'g_state', 'google_oauth_state', 'oauth_state', 'gsi_callback_data',
      'google_user_data', 'google_auto_select', 'google_accounts_check',
      'google_session_state', 'gsi_state', 'gapi_state',
      'google_user_preferences', 'google_account_selection', 'google_logged_in_account'
    ]
    
    for (const key of googleOAuthKeys) {
      try {
        globalThis.localStorage.removeItem(key)
        globalThis.sessionStorage.removeItem(key)
      } catch (error) {
        console.warn(`Failed to clear ${key}:`, error)
      }
    }
    
    // 完全清除所有存儲（這會重置整個應用狀態）
    globalThis.localStorage.clear()
    globalThis.sessionStorage.clear()
    
    console.log('🧹 已清除本地存儲')
  } catch (error) {
    console.warn("清除本地儲存時發生錯誤", error)
  }
}

// 清除 cookies
const clearCookies = () => {
  if (globalThis.window === undefined) {
    return
  }

  try {
    // 清除客戶端可見的 cookies（非 httpOnly）
    const cookiesToClear = [
      "_medusa_cart_id",
      "next-auth.session-token", 
      "next-auth.callback-url",
      "next-auth.csrf-token",
      "auth-token",
      "_debug_jwt_preview",
      "_debug_jwt_full",
      // Google OAuth 相關 cookies
      "g_state",
      "g_csrf_token",
      "google_oauth_state",
      "oauth_state",
      "gsi_callback_data",
      "__gads",
      "__gpi",
      "_gcl_au",
      // Google Identity Services cookies
      "g_enabled_idps",
      "g_session_check",
      "g_accounts_check",
      "google_auto_select",
      "1P_JAR",
      "APISID",
      "SAPISID",
      "HSID",
      "SSID",
      "SID",
      // Google 帳戶選擇相關
      "ACCOUNT_CHOOSER",
      "LSOLH",
      "LSID"
    ]
    
    // 清除各種域名下的 cookies
    const domains = [globalThis.location.hostname, `.${globalThis.location.hostname}`, ""]
    
    for (const cookieName of cookiesToClear) {
      for (const domain of domains) {
        const domainPart = domain ? `; domain=${domain}` : ""
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainPart}`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/tw${domainPart}`
      }
    }
    
    console.log('🧹 已清除 cookies')
  } catch (error) {
    console.warn("清除 cookies 時發生錯誤", error)
  }
}

// 執行登出 API 調用
const performLogoutApiCall = async () => {
  console.log('📡 調用登出 API (client-fetch)')
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (response.ok) {
    console.log('✅ 登出 API 調用成功')
  } else {
    console.warn("登出 API 回傳非成功狀態", response.status)
  }
}

export const useLogout = ({
  countryCode,
  redirectPath,
  onLoggedOut,
  strategy = "server-redirect",
}: UseLogoutOptions = {}): UseLogoutResult => {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      const destination = buildDestination(countryCode, redirectPath)
      
      console.log('🔓 開始登出流程', { strategy, destination })

      // 清除所有客戶端狀態
      await clearGoogleOAuthState()
      clearLocalStorage()
      clearCookies()

      // 等待 Google OAuth 撤銷操作完成
      console.log('⏳ 等待 Google OAuth 撤銷操作完成...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 執行回調
      if (onLoggedOut) {
        try {
          onLoggedOut()
        } catch (callbackError) {
          console.error("onLoggedOut 回呼執行失敗", callbackError)
        }
      }

      if (strategy === "server-redirect") {
        // 使用服務器重定向，讓 API 路由處理 Medusa SDK 登出
        const logoutUrl = `/api/auth/logout?redirect=${encodeURIComponent(destination)}&fast=1`
        console.log('🔀 重定向到登出 API (使用 Medusa SDK):', logoutUrl)
        globalThis.location.href = logoutUrl
        return
      } else {
        // 客戶端策略：調用 API 後手動重定向
        await performLogoutApiCall()

        console.log('🔀 客戶端重定向到:', destination)
        
        // 強制重新載入頁面以確保所有狀態被清除，特別是 Google OAuth 狀態
        console.log('🔄 強制重新載入頁面以清除所有狀態')
        globalThis.location.href = destination
      }
    } catch (error) {
      console.error("❌ 登出請求失敗", error)
      // 即使登出失敗，也嘗試重定向到登入頁面
      const fallbackDestination = buildDestination(countryCode, redirectPath)
      console.log('❌ 登出失敗，重定向到:', fallbackDestination)
      globalThis.location.href = fallbackDestination
    } finally {
      setIsLoggingOut(false)
    }
  }, [countryCode, isLoggingOut, onLoggedOut, redirectPath, router, strategy])

  return { logout, isLoggingOut }
}

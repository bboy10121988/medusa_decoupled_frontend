"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

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

      // 清除客戶端儲存和 cookies
      if (typeof window !== "undefined") {
        try {
          window.localStorage.clear()
          window.sessionStorage.clear()
          
          // 清除客戶端可見的 cookies（非 httpOnly）
          const cookiesToClear = [
            "_medusa_cart_id",
            "next-auth.session-token", 
            "next-auth.callback-url",
            "next-auth.csrf-token",
            "auth-token",
            "_debug_jwt_preview",
            "_debug_jwt_full"
          ]
          
          cookiesToClear.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
          })
          
          console.log('🧹 已清除客戶端儲存和 cookies')
        } catch (storageError) {
          console.warn("清除本地儲存時發生錯誤", storageError)
        }
      }

      // 執行回調
      if (onLoggedOut) {
        try {
          onLoggedOut()
        } catch (callbackError) {
          console.error("onLoggedOut 回呼執行失敗", callbackError)
        }
      }

      if (strategy === "server-redirect") {
        // 使用服務器重定向，讓 API 路由處理 SDK 登出
        const logoutUrl = `/api/auth/logout?redirect=${encodeURIComponent(destination)}&fast=1`
        console.log('🔀 重定向到登出 API:', logoutUrl)
        window.location.href = logoutUrl
        return
      } else {
        // 客戶端策略：調用 API 後手動重定向
        console.log('📡 調用登出 API (client-fetch)')
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.warn("登出 API 回傳非成功狀態", response.status)
        } else {
          console.log('✅ 登出 API 調用成功')
        }

        console.log('🔀 客戶端重定向到:', destination)
        router.replace(destination)
        router.refresh()
      }
    } catch (error) {
      console.error("❌ 登出請求失敗", error)
      // 即使登出失敗，也嘗試重定向到主頁
      const fallbackDestination = `/${countryCode || 'tw'}`
      router.replace(fallbackDestination)
    } finally {
      setIsLoggingOut(false)
    }
  }, [countryCode, isLoggingOut, onLoggedOut, redirectPath, router, strategy])

  return { logout, isLoggingOut }
}

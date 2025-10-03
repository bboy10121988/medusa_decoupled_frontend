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

  const normalizedCode = countryCode?.trim()
  const destination = normalizedCode ? `/${normalizedCode}/account` : "/account"
  
  // 調試日誌
  if (process.env.NODE_ENV === 'development') {
    console.log('buildDestination:', { countryCode, normalizedCode, destination })
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

      if (strategy === "server-redirect") {
        // 伺服器端處理 302 重定向：最可靠，避免 CSR 轉跳延遲或失敗
        if (typeof window !== "undefined") {
          try {
            window.localStorage.clear()
            window.sessionStorage.clear()
          } catch (storageError) {
            console.warn("清除本地儲存時發生錯誤", storageError)
          }

          if (onLoggedOut) {
            try {
              onLoggedOut()
            } catch (callbackError) {
              console.error("onLoggedOut 回呼執行失敗", callbackError)
            }
          }

          const logoutUrl = `/api/auth/logout?redirect=${encodeURIComponent(destination)}&fast=1`
          // 使用 assign 以保留歷史 (或可改用 replace 不留紀錄)
          window.location.href = logoutUrl
          return
        }
      } else {
        // 原本 client-fetch 策略
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.warn("登出 API 回傳非成功狀態", response.status)
        }

        if (typeof window !== "undefined") {
          try {
            window.localStorage.clear()
            window.sessionStorage.clear()
          } catch (storageError) {
            console.warn("清除本地儲存時發生錯誤", storageError)
          }
        }

        if (onLoggedOut) {
          try {
            onLoggedOut()
          } catch (callbackError) {
            console.error("onLoggedOut 回呼執行失敗", callbackError)
          }
        }

        const dest = destination
        router.replace(dest)
        router.refresh()
      }
    } catch (error) {
      console.error("登出請求失敗", error)
    } finally {
      setIsLoggingOut(false)
    }
  }, [countryCode, isLoggingOut, onLoggedOut, redirectPath, router, strategy])

  return { logout, isLoggingOut }
}

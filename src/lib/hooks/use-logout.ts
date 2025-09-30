"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

type UseLogoutOptions = {
  countryCode?: string
  redirectPath?: string
  onLoggedOut?: () => void
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
  return normalizedCode ? `/${normalizedCode}/account` : "/account"
}

export const useLogout = ({
  countryCode,
  redirectPath,
  onLoggedOut,
}: UseLogoutOptions = {}): UseLogoutResult => {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
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
    } catch (error) {
      console.error("登出請求失敗", error)
    } finally {
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

      setIsLoggingOut(false)

      const destination = buildDestination(countryCode, redirectPath)
      router.replace(destination)
      router.refresh()
    }
  }, [countryCode, isLoggingOut, onLoggedOut, redirectPath, router])

  return { logout, isLoggingOut }
}

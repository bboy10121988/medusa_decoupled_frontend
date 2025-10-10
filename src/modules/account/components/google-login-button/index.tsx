"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { sdk } from "@lib/config"

interface GoogleLoginButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  countryCode?: string
}

const GoogleLoginButton = ({ onSuccess, onError, countryCode = 'tw' }: GoogleLoginButtonProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/${countryCode}/auth/google/callback`
          : undefined

      const result = await sdk.auth.login("customer", "google", {
        ...(callbackUrl ? { callback_url: callbackUrl } : {}),
      })

      if (typeof result !== "string" && result.location) {
        window.location.href = result.location
        return
      }

      if (typeof result === "string") {
        try {
          await fetch('/api/auth/set-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ token: result }),
          })
        } catch (tokenError) {
          console.error('設定登入憑證失敗:', tokenError)
        }

        if (onSuccess) {
          onSuccess()
          return
        }

        router.push(`/${countryCode}/account`)
        router.refresh()
        return
      }

      throw new Error("Google 登入回傳資料異常")
    } catch (err: any) {
      const message = err?.message || "Google 登入失敗，請稍後再試"
      setError(message)
      if (onError) onError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-medium">正在前往 Google 登入...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.22C12.54 13.42 17.77 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.8-.16-3.53-.46-5.2H24v9.86h12.7c-.55 2.96-2.26 5.47-4.81 7.16l7.39 5.73C43.98 37.19 46.5 31.26 46.5 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.54 28.44c-.48-1.43-.76-2.95-.76-4.44s.28-3.01.76-4.44L2.56 13.22C.91 16.44 0 20.08 0 24s.91 7.56 2.56 10.78l7.98-6.34z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.94-2.13 15.92-5.81l-7.39-5.73c-2.06 1.38-4.7 2.18-8.53 2.18-6.23 0-11.46-3.92-13.46-9.45l-7.98 6.34C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span className="text-sm font-medium">使用 Google 登入</span>
          </>
        )}
      </button>
    </div>
  )
}

export default GoogleLoginButton

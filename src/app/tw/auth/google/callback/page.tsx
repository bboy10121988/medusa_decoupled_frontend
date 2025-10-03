"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { sdk } from "@lib/config"
import { Spinner } from "@medusajs/icons"

// 簡單的 JWT 解析函數
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
    console.error("解析 JWT 失敗", error)
    return null
  }
}

function GoogleCallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code")
        const state = searchParams.get("state")
        
        if (!code) {
          throw new Error("缺少授權碼")
        }

        console.log("處理 Google OAuth 回調...")
        
        const params = { code, state }
        const token = await sdk.auth.callback("customer", "google", params)

        if (typeof token !== "string") {
          throw new Error("Google 登入回傳資料異常")
        }

        console.log("✅ 獲得 JWT token")
        
        const payload = parseJwt(token)
        console.log("JWT Payload:", payload)

        if (!payload?.actor_id) {
          console.log("🆕 新用戶，需要創建客戶資料")
          
          const email = payload?.email || payload?.data?.email
          
          if (!email) {
            throw new Error("無法獲取 Google 帳戶的 email")
          }

          await sdk.store.customer.create({
            email,
            first_name: payload?.given_name || "",
            last_name: payload?.family_name || "",
          })

          console.log("✅ 客戶資料已創建")

          const refreshedToken = await sdk.auth.refresh()
          console.log("✅ Token 已刷新")
        }

        const finalToken = (await sdk.client.getToken()) || token
        
        window.location.href = `/api/auth/set-token?token=${encodeURIComponent(finalToken)}&redirect=/tw/account`
        
      } catch (error: any) {
        console.error("OAuth 回調處理失敗:", error)
        setStatus("error")
        setMessage(error.message || "登入失敗")
      }
    }

    handleCallback()
  }, [searchParams])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner className="animate-spin w-8 h-8 mx-auto mb-4" />
          <p className="text-lg">正在處理 Google 登入...</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">登入失敗</h1>
          <p className="text-gray-600 mb-4">{message}</p>
          <a 
            href="/tw/account" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            返回登入頁面
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">登入成功</h1>
        <p className="text-gray-600">正在重定向...</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner className="animate-spin w-8 h-8 mx-auto mb-4" />
          <p className="text-lg">載入中...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}

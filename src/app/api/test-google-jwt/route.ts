import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()
    
    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 })
    }

    console.log("🔍 API: 開始處理 Google OAuth callback")
    
    // 使用 Medusa SDK 處理 callback
    const token = await sdk.auth.callback("customer", "google", { code, state })
    
    if (typeof token !== "string") {
      console.error("❌ API: Medusa SDK 回傳非字串 token:", token)
      return NextResponse.json({ 
        error: "Invalid token type", 
        tokenType: typeof token,
        token: token 
      }, { status: 500 })
    }

    // 解析 JWT
    const parseJwt = (token: string) => {
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
        console.error("JWT 解析失敗:", error)
        return null
      }
    }

    const payload = parseJwt(token)
    
    console.log("🎯 API: JWT Token:", token)
    console.log("🎯 API: Payload:", payload)

    return NextResponse.json({ 
      success: true,
      jwt: token,
      payload: payload,
      tokenLength: token.length,
      analysis: {
        hasEmail: !!payload?.email,
        emailVerified: payload?.email_verified,
        hasActorId: !!payload?.actor_id,
        issuer: payload?.iss,
        audience: payload?.aud,
        subject: payload?.sub
      }
    })

  } catch (error: any) {
    console.error("❌ API: Google OAuth 處理失敗:", error)
    return NextResponse.json({ 
      error: "OAuth processing failed", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
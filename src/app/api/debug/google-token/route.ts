import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // 解析 JWT token
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
    
    const debugInfo = {
      tokenType: typeof token,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 50) + "...",
      payload: payload,
      payloadKeys: payload ? Object.keys(payload) : [],
      emailChecks: {
        "payload.email": payload?.email,
        "payload.email_verified": payload?.email_verified, 
        "payload.sub": payload?.sub,
        "payload.aud": payload?.aud,
        "payload.iss": payload?.iss,
        "payload.given_name": payload?.given_name,
        "payload.family_name": payload?.family_name,
        "payload.name": payload?.name,
        "payload.picture": payload?.picture,
      }
    }

    return NextResponse.json({ 
      success: true, 
      debug: debugInfo,
      fullPayload: payload 
    })

  } catch (error: any) {
    console.error("調試 Google token 失敗:", error)
    return NextResponse.json({ 
      error: "調試失敗", 
      message: error.message 
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from "next/server"
import Medusa from "@medusajs/js-sdk"
import { getApiConfig } from "@lib/config"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const config = getApiConfig()
    const medusa = new Medusa({
      baseUrl: config.baseUrl,
      publishableKey: config.publishableKey,
    })

    console.log("🔍 測試 token:", {
      tokenLength: token.length,
      tokenStart: token.substring(0, 50) + "...",
      baseUrl: config.baseUrl
    })

    // 設置 token 並嘗試獲取用戶
    medusa.client.setToken(token)
    
    try {
      const result = await medusa.store.customer.retrieve()
      console.log("✅ 成功獲取 customer:", result)
      
      return NextResponse.json({
        success: true,
        customer: result.customer,
        hasCustomer: !!result.customer,
        customerData: result.customer ? {
          id: result.customer.id,
          email: result.customer.email,
          firstName: result.customer.first_name,
          lastName: result.customer.last_name
        } : null
      })
    } catch (customerError: any) {
      console.error("❌ 獲取 customer 失敗:", customerError)
      
      // 解析 JWT token
      const parseJwt = (token: string) => {
        try {
          const [, payload] = token.split(".")
          if (!payload) return null
          const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
          const decoded = Buffer.from(normalized, "base64").toString("utf8")
          return JSON.parse(decoded)
        } catch (parseError) {
          console.error("JWT 解析錯誤:", parseError)
          return null
        }
      }
      
      const payload = parseJwt(token)
      
      return NextResponse.json({
        success: false,
        error: customerError.message,
        tokenPayload: payload,
        debugInfo: {
          hasToken: true,
          tokenLength: token.length,
          errorDetails: customerError.response?.data || customerError.message
        }
      })
    }

  } catch (error: any) {
    console.error("❌ 測試失敗:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
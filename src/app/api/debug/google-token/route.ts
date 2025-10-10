import { NextRequest, NextResponse } from "next/server"
import { getApiConfig } from "@lib/config"
import Medusa from "@medusajs/js-sdk"

// 診斷工具：檢查 Google OAuth token 的內容
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: "需要提供 token" }, { status: 400 })
    }

    // 解析 JWT token
    const parseJwt = (token: string) => {
      try {
        const [, payload] = token.split(".")
        if (!payload) return null
        
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
        const decoded = Buffer.from(normalized, "base64").toString("utf8")
        return JSON.parse(decoded)
      } catch (error) {
        return { error: `解析失敗: ${error}` }
      }
    }

    const payload = parseJwt(token)
    
    // 嘗試從 Medusa SDK 獲取認證信息
    const config = getApiConfig()
    const medusa = new Medusa({
      baseUrl: config.baseUrl,
      publishableKey: config.publishableKey,
    })
    
    medusa.client.setToken(token)
    
    let authIdentity = null
    try {
      // 嘗試不同的方法獲取認證信息
      authIdentity = { message: "Medusa SDK 沒有 auth.retrieve 方法" }
    } catch (error) {
      authIdentity = { error: `無法獲取 auth identity: ${error}` }
    }

    let customer = null
    try {
      const customerInfo = await medusa.store.customer.retrieve()
      customer = customerInfo?.customer
    } catch (error) {
      customer = { error: `無法獲取 customer: ${error}` }
    }

    return NextResponse.json({
      debug: {
        tokenPayload: payload,
        authIdentity: authIdentity,
        customer: customer,
        tokenLength: token.length,
        tokenStart: token.substring(0, 50) + "...",
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: `診斷失敗: ${error}` },
      { status: 500 }
    )
  }
}
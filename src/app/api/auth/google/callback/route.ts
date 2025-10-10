import { NextRequest, NextResponse } from "next/server"
import Medusa from "@medusajs/js-sdk"
import { revalidateTag } from "next/cache"
import { getApiConfig } from "@lib/config"
import { setAuthToken, getCacheTag } from "@lib/data/cookies"

const createSdkClient = () => {
  const config = getApiConfig()
  return new Medusa({
    baseUrl: config.baseUrl,
    publishableKey: config.publishableKey,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "缺少授權碼",
        },
        { status: 400 }
      )
    }

    console.log("🔐 開始 Google OAuth callback 處理:", { 
      code: code.substring(0, 20) + "...", 
      state,
      timestamp: new Date().toISOString()
    })

    const medusa = createSdkClient()
    const callbackParams: Record<string, string> = { code }
    if (typeof state === "string" && state.length > 0) {
      callbackParams.state = state
    }

    // 調用 Medusa SDK 處理 Google OAuth callback
    console.log("📡 調用 Medusa auth.callback...")
    const token = await medusa.auth.callback("customer", "google", callbackParams)

    if (typeof token !== "string") {
      console.error("❌ Medusa auth.callback 沒有返回有效 token:", token)
      return NextResponse.json(
        {
          success: false,
          message: "後端認證失敗，請檢查 Medusa 配置",
        },
        { status: 500 }
      )
    }

    console.log("✅ 成功獲取 Medusa token:", {
      tokenLength: token.length,
      tokenStart: token.substring(0, 50) + "..."
    })

    // 設置認證 token
    await setAuthToken(token)
    medusa.client.setToken(token)

    // 嘗試獲取當前用戶
    let customer = null
    try {
      console.log("👤 嘗試獲取 customer 資料...")
      const result = await medusa.store.customer.retrieve()
      customer = result.customer
      
      if (customer) {
        console.log("✅ 成功獲取 customer:", { 
          id: customer.id, 
          email: customer.email,
          hasEmail: !!customer.email
        })
      } else {
        console.warn("⚠️ customer 為空")
      }
    } catch (customerError) {
      console.error("❌ 無法獲取 customer，嘗試手動創建:", customerError)
      
      // 解析 JWT token 來獲取用戶信息
      try {
        const parseJwt = (token: string) => {
          const [, payload] = token.split(".")
          if (!payload) return null
          const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
          const decoded = Buffer.from(normalized, "base64").toString("utf8")
          return JSON.parse(decoded)
        }
        
        const payload = parseJwt(token)
        console.log("🔍 解析 JWT payload:", payload)
        
        // 嘗試從 payload 提取 email 和用戶信息
        const email = payload?.email || payload?.sub || null
        const firstName = payload?.given_name || payload?.name?.split(' ')[0] || 'Google'
        const lastName = payload?.family_name || payload?.name?.split(' ').slice(1).join(' ') || '用戶'
        
        if (email) {
          console.log("📧 找到 email，嘗試創建 customer:", email)
          
          try {
            const { customer: newCustomer } = await medusa.store.customer.create({
              email,
              first_name: firstName,
              last_name: lastName,
            })
            
            customer = newCustomer
            console.log("✅ 成功創建 customer:", { id: customer.id, email: customer.email })
            
            // 刷新 token 以確保關聯
            try {
              const refreshedToken = await medusa.auth.refresh()
              if (typeof refreshedToken === "string") {
                await setAuthToken(refreshedToken)
                medusa.client.setToken(refreshedToken)
              }
            } catch (refreshError) {
              console.warn("刷新 token 失敗:", refreshError)
            }
            
          } catch (createError) {
            console.error("❌ 創建 customer 失敗:", createError)
          }
        } else {
          console.error("❌ JWT token 中沒有找到 email")
        }
        
      } catch (parseError) {
        console.error("❌ 解析 JWT token 失敗:", parseError)
      }
      
      // 如果仍然沒有 customer，返回錯誤
      if (!customer) {
        return NextResponse.json(
          {
            success: false,
            message: "無法創建用戶記錄，請檢查 Google OAuth 配置",
            debug: {
              hasToken: true,
              tokenLength: token.length,
              error: customerError instanceof Error ? customerError.message : String(customerError)
            }
          },
          { status: 500 }
        )
      }
    }

    // 如果沒有 email，這是後端問題
    if (customer && !customer.email) {
      console.error("❌ Customer 存在但沒有 email:", customer)
      return NextResponse.json(
        {
          success: false,
          message: "用戶資料缺少 email，請檢查後端 Google OAuth 用戶創建邏輯",
          debug: {
            customerId: customer.id,
            customerData: customer
          }
        },
        { status: 500 }
      )
    }

    // 清除相關快取
    try {
      const customerTag = await getCacheTag("customers")
      if (customerTag) {
        revalidateTag(customerTag)
      }
    } catch (cacheError) {
      console.warn("清除快取失敗:", cacheError)
    }

    console.log("🎉 Google OAuth 登入成功完成")

    return NextResponse.json({
      success: true,
      customer,
    })

  } catch (error) {
    console.error("❌ Google OAuth callback 處理失敗:", error)
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "未知錯誤",
        debug: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}
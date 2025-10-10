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
      console.error("❌ 無法獲取 customer:", customerError)
      
      // 這是關鍵問題：Medusa 返回了 token，但無法獲取對應的 customer
      // 這通常意味著後端沒有正確創建或關聯用戶記錄
      return NextResponse.json(
        {
          success: false,
          message: "認證成功但無法獲取用戶資料，可能是後端 Google OAuth 配置問題",
          debug: {
            hasToken: true,
            tokenLength: token.length,
            error: customerError instanceof Error ? customerError.message : String(customerError)
          }
        },
        { status: 500 }
      )
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
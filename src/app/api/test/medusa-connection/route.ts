import { NextRequest, NextResponse } from "next/server"
import { getApiConfig } from "@lib/config"
import Medusa from "@medusajs/js-sdk"

// 測試 Medusa SDK 連接
export async function GET() {
  try {
    const config = getApiConfig()
    const medusa = new Medusa({
      baseUrl: config.baseUrl,
      publishableKey: config.publishableKey,
    })

    console.log("測試 Medusa SDK 配置:", {
      baseUrl: config.baseUrl,
      publishableKey: config.publishableKey
    })

    // 測試基本連接
    try {
      const collections = await medusa.store.collection.list({ limit: 1 })
      console.log("✅ Medusa SDK 連接成功")
      
      return NextResponse.json({
        success: true,
        message: "Medusa SDK 連接正常",
        config: {
          baseUrl: config.baseUrl,
          publishableKey: config.publishableKey
        },
        testResult: {
          collections: collections.collections?.length || 0
        }
      })
    } catch (apiError) {
      console.error("❌ Medusa API 調用失敗:", apiError)
      
      return NextResponse.json({
        success: false,
        message: "Medusa API 調用失敗",
        error: apiError instanceof Error ? apiError.message : String(apiError),
        config: {
          baseUrl: config.baseUrl,
          publishableKey: config.publishableKey
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error("❌ Medusa SDK 配置錯誤:", error)
    
    return NextResponse.json({
      success: false,
      message: "Medusa SDK 配置錯誤",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { getApiConfig } from "@lib/config"
import Medusa from "@medusajs/js-sdk"

export async function POST() {
  try {
    const config = getApiConfig()
    const medusa = new Medusa({
      baseUrl: config.baseUrl,
      publishableKey: config.publishableKey,
    })

    console.log("🔍 測試 Medusa 配置:", {
      baseUrl: config.baseUrl,
      hasPublishableKey: !!config.publishableKey,
      publishableKeyLength: config.publishableKey?.length
    })

    // 測試 1: 嘗試獲取 regions（這個應該能工作）
    try {
      const regions = await medusa.store.region.list()
      console.log("✅ 成功獲取 regions:", regions.regions?.length)
    } catch (regionError) {
      console.error("❌ 無法獲取 regions:", regionError)
      return NextResponse.json({
        success: false,
        error: "無法連接到 Medusa store API",
        details: regionError instanceof Error ? regionError.message : String(regionError)
      })
    }

    // 測試 2: 嘗試創建客戶
    const testEmail = `test-${Date.now()}@example.com`
    try {
      const { customer } = await medusa.store.customer.create({
        email: testEmail,
        first_name: "Test",
        last_name: "User",
      })

      return NextResponse.json({
        success: true,
        message: "客戶創建成功",
        customer: {
          id: customer?.id,
          email: customer?.email
        }
      })
    } catch (customerError: any) {
      console.error("❌ 客戶創建失敗:", customerError)
      
      // 測試 3: 嘗試直接 API 調用
      try {
        const directResponse = await fetch(`${config.baseUrl}/store/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': config.publishableKey || '',
          },
          body: JSON.stringify({
            email: testEmail,
            first_name: "Direct",
            last_name: "Test",
          }),
        })

        if (directResponse.ok) {
          const directData = await directResponse.json()
          return NextResponse.json({
            success: true,
            message: "直接 API 調用成功",
            method: "direct-api",
            customer: directData.customer
          })
        } else {
          const errorText = await directResponse.text()
          return NextResponse.json({
            success: false,
            error: "SDK 和直接 API 都失敗",
            sdkError: customerError.message,
            apiError: errorText,
            statusCode: directResponse.status
          })
        }
      } catch (directError) {
        return NextResponse.json({
          success: false,
          error: "所有創建方法都失敗",
          sdkError: customerError.message,
          directError: directError instanceof Error ? directError.message : String(directError)
        })
      }
    }

  } catch (error) {
    console.error("❌ 測試失敗:", error)
    return NextResponse.json({
      success: false,
      error: "測試執行失敗",
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
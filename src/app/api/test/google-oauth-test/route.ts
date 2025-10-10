import { NextRequest, NextResponse } from "next/server"
import { getApiConfig } from "@lib/config"
import Medusa from "@medusajs/js-sdk"

// 測試 Google OAuth callback 流程
export async function POST(request: NextRequest) {
  try {
    const { testCode } = await request.json()
    
    const config = getApiConfig()
    const medusa = new Medusa({
      baseUrl: config.baseUrl,
      publishableKey: config.publishableKey,
    })

    console.log("🧪 測試 Google OAuth callback 流程")
    console.log("配置:", {
      baseUrl: config.baseUrl,
      publishableKey: config.publishableKey
    })

    // 使用測試碼嘗試 auth.callback
    const callbackParams = { code: testCode || "test-code-123" }
    
    try {
      console.log("📡 調用 medusa.auth.callback...")
      const result = await medusa.auth.callback("customer", "google", callbackParams)
      
      console.log("✅ auth.callback 成功:", typeof result, result?.substring?.(0, 50))
      
      return NextResponse.json({
        success: true,
        message: "auth.callback 調用成功",
        result: {
          type: typeof result,
          length: typeof result === 'string' ? result.length : 0,
          preview: typeof result === 'string' ? result.substring(0, 100) + "..." : result
        }
      })
      
    } catch (authError) {
      console.error("❌ auth.callback 失敗:", authError)
      
      // 檢查是否是網絡連接問題
      if (authError instanceof Error && authError.message.includes('fetch')) {
        return NextResponse.json({
          success: false,
          message: "網絡連接問題 - 無法連接到後端",
          error: authError.message,
          suggestion: "檢查後端是否在 " + config.baseUrl + " 運行"
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: false,
        message: "Google OAuth callback 測試失敗",
        error: authError instanceof Error ? authError.message : String(authError),
        errorDetails: {
          name: authError instanceof Error ? authError.name : "Unknown",
          stack: authError instanceof Error ? authError.stack : undefined
        }
      }, { status: 500 })
    }

  } catch (generalError) {
    console.error("❌ 測試流程失敗:", generalError)
    
    return NextResponse.json({
      success: false,
      message: "測試流程失敗",
      error: generalError instanceof Error ? generalError.message : String(generalError)
    }, { status: 500 })
  }
}
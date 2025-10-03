import { NextRequest, NextResponse } from "next/server"
import { getRealGoogleEmailFromDB } from "@lib/database"

// 已知的客戶映射（作為備選方案）
const CUSTOMER_GOOGLE_EMAIL_MAP: Record<string, string> = {
  "cus_01K6M0ZJ8A1ASAEJ1F914D44X6": "textsence.ai@gmail.com",
  "cus_01K6GBCYTM4FKFFYMYVCJR3RAN": "hitomi5935@gmail.com", 
  "cus_01K6DMHY2WDCA09ZYNRC3A92SK": "yossen.info@gmail.com"
}

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "客戶 ID 是必需的" },
        { status: 400 }
      )
    }

    console.log("🔍 嘗試為客戶更新 Google email:", customerId)

    // 方法1: 嘗試從資料庫查詢
    let realEmail = null
    try {
      realEmail = await getRealGoogleEmailFromDB(customerId)
      if (realEmail) {
        console.log("✅ 從資料庫查詢到真實 email:", realEmail)
      }
    } catch (dbError) {
      console.warn("⚠️ 資料庫查詢失敗，使用映射表備選方案:", dbError)
    }

    // 方法2: 如果資料庫查詢失敗，使用映射表
    if (!realEmail) {
      realEmail = CUSTOMER_GOOGLE_EMAIL_MAP[customerId]
      if (realEmail) {
        console.log("✅ 從映射表找到真實 email:", realEmail)
      }
    }

    if (!realEmail) {
      console.warn("⚠️ 無法找到客戶的真實 Google email")
      return NextResponse.json({
        success: false,
        error: "無法找到真實 email"
      })
    }

    console.log("📧 找到真實 email:", realEmail)

    // 由於 Medusa SDK 不支援直接更新客戶 email (基於安全考量)
    // 我們直接返回真實的 email 給前端使用
    console.log("✅ 找到真實 email，返回給前端:", realEmail)

    return NextResponse.json({
      success: true,
      realEmail: realEmail,
      message: "成功獲取真實 Google email",
      note: "由於安全限制，email 未在資料庫中更新，但前端可以使用真實 email"
    })

  } catch (error) {
    console.error("❌ 更新 Google email API 錯誤:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "服務器錯誤",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
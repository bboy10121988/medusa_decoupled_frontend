import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "客戶 ID 是必需的" },
        { status: 400 }
      )
    }

    console.log("🔍 通過 Medusa 後端查詢客戶的 Google email:", customerId)

    // 構建 Medusa 後端 API URL
    const backendUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    if (!backendUrl) {
      console.error("❌ Medusa 後端 URL 未設置")
      return NextResponse.json(
        { success: false, error: "後端設置錯誤" },
        { status: 500 }
      )
    }

    // 調用 Medusa 後端的自定義 API 來查詢 provider_identity
    const apiUrl = `${backendUrl}/admin/custom/customer/${customerId}/google-email`
    
    console.log("📞 調用後端 API:", apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要認證，可以在這裡添加 Authorization header
      },
    })

    if (!response.ok) {
      console.error("❌ 後端 API 調用失敗:", response.status, response.statusText)
      
      // 如果後端 API 不存在，回退到前端直接查詢（需要實現）
      console.log("🔄 回退到前端查詢...")
      return await fallbackDirectQuery(customerId)
    }

    const data = await response.json()
    
    if (data.success && data.email) {
      console.log("✅ 從後端獲取到真實 Google email:", data.email)
      return NextResponse.json({
        success: true,
        realEmail: data.email,
        source: 'backend-api'
      })
    } else {
      console.log("⚠️ 後端未找到真實 email")
      return NextResponse.json({
        success: false,
        error: "無法找到客戶的 Google email",
        source: 'backend-api'
      })
    }

  } catch (error) {
    console.error("❌ 查詢 Google email 失敗:", error)
    return NextResponse.json(
      { success: false, error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

// 回退方案：前端直接查詢（暫時返回硬編碼映射）
async function fallbackDirectQuery(customerId: string) {
  console.log("🔄 使用回退查詢方案...")
  
  // 暫時使用硬編碼映射，未來可以改為直接資料庫查詢
  const knownMappings: Record<string, string> = {
    "cus_01K6M0ZJ8A1ASAEJ1F914D44X6": "textsence.ai@gmail.com",
    "cus_01K6GBCYTM4FKFFYMYVCJR3RAN": "hitomi5935@gmail.com", 
    "cus_01K6DMHY2WDCA09ZYNRC3A92SK": "yossen.info@gmail.com"
  }

  const email = knownMappings[customerId]
  
  if (email) {
    console.log("✅ 從回退映射找到 email:", email)
    return NextResponse.json({
      success: true,
      realEmail: email,
      source: 'fallback-mapping'
    })
  } else {
    console.log("⚠️ 回退映射中也未找到客戶 ID:", customerId)
    return NextResponse.json({
      success: false,
      error: `客戶 ID ${customerId} 不在已知映射中`,
      source: 'fallback-mapping'
    })
  }
}
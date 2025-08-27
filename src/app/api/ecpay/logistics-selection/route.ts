import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚚 前端代理：ECPay 物流選擇請求')
    
    // 獲取請求參數
    const body = await request.json()
    console.log('📝 請求參數:', body)
    
    // 準備後端 URL 和 API 密鑰
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
                       process.env.MEDUSA_BACKEND_URL || 
                       'http://localhost:9000'
    
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      console.error('❌ 缺少 Medusa Publishable API Key')
      return NextResponse.json(
        { 
          success: false, 
          message: '缺少 Medusa API 密鑰',
          error: 'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY 環境變數未設定'
        },
        { status: 500 }
      )
    }
    
    const apiUrl = `${backendUrl}/store/ecpay/logistics-selection`
    
    console.log('🔗 代理到:', apiUrl)
    console.log('🔑 使用 API 密鑰:', publishableKey.substring(0, 10) + '...')
    
    // 代理請求到後端
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey,
        'User-Agent': 'Medusa-Frontend-Proxy'
      },
      body: JSON.stringify(body)
    })
    
    console.log('📡 後端回應狀態:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 後端回應錯誤:', errorText)
      return NextResponse.json(
        { 
          success: false, 
          message: `後端 API 錯誤: ${response.status}`,
          error: errorText
        },
        { status: response.status }
      )
    }
    
    // 檢查回應類型
    const contentType = response.headers.get('content-type')
    console.log('📄 回應類型:', contentType)
    
    if (contentType && contentType.includes('application/json')) {
      // JSON 回應
      const result = await response.json()
      console.log('✅ JSON 回應:', result)
      return NextResponse.json(result)
    } else {
      // HTML 回應（ECPay 跳轉頁面）
      const htmlContent = await response.text()
      console.log('🔗 HTML 跳轉頁面')
      
      // 回傳 HTML 內容
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
    }
    
  } catch (error: any) {
    console.error('❌ 代理請求失敗:', error)
    return NextResponse.json(
      {
        success: false,
        message: '代理請求失敗',
        error: error.message
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "ECPay 物流選擇代理 API",
    description: "此端點代理請求到 Medusa 後端的 ECPay 物流選擇 API"
  })
}

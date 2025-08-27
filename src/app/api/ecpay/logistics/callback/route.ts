import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📞 前端物流選擇回調 API 被調用')
    
    const body = await request.json()
    console.log('📝 回調參數:', body)

    // 轉發回調請求到後端
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const apiEndpoint = `${backendUrl}/store/ecpay/logistics-callback`

    console.log('🔄 轉發回調到:', apiEndpoint)
    console.log('🔑 使用 Publishable Key:', publishableKey ? '已設定' : '未設定')

    if (!publishableKey) {
      console.error('❌ 缺少 NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY')
      return NextResponse.json(
        { 
          success: false, 
          message: "系統配置錯誤：缺少必要的API金鑰" 
        },
        { status: 500 }
      )
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ 後端回調 API 錯誤:', response.status, errorData)
      return NextResponse.json({
        success: false,
        message: `後端回調 API 錯誤: ${response.status}`,
        error: errorData
      }, { status: response.status })
    }

    // 檢查回應內容類型
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('text/html')) {
      // 如果是 HTML，直接回傳
      const htmlContent = await response.text()
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
    } else {
      // 如果是 JSON，解析後回傳
      const result = await response.json()
      return NextResponse.json(result)
    }

  } catch (error: any) {
    console.error('❌ 前端物流選擇回調 API 錯誤:', error)
    return NextResponse.json({
      success: false,
      message: '物流選擇回調 API 錯誤',
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "ECPay 物流選擇回調前端 API",
    description: "此端點用於接收綠界物流選擇完成後的回調",
    usage: {
      method: "POST",
      description: "綠界會透過此端點回傳物流選擇結果"
    }
  })
}

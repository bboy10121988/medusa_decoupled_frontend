import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') console.log('📞 前端物流選擇回調 API 被調用')
    
    const body = await request.json()
    if (process.env.NODE_ENV === 'development') console.log('📝 回調參數:', body)

    // 轉發回調請求到後端
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const { getPublishableKeyForBackend } = await import('@lib/medusa-publishable-key')
    const publishableKey = getPublishableKeyForBackend(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)
    const apiEndpoint = `${backendUrl}/store/ecpay/logistics-callback`

    if (process.env.NODE_ENV === 'development') console.log('🔄 轉發回調到:', apiEndpoint)
    if (process.env.NODE_ENV === 'development') console.log('🔑 使用 Publishable Key:', publishableKey ? '已設定' : '未設定')

    if (!publishableKey) {
      if (process.env.NODE_ENV === 'development') console.error('❌ 缺少 Publishable Key')
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
      if (process.env.NODE_ENV === 'development') console.error('❌ 後端回調 API 錯誤:', response.status, errorData)
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
    if (process.env.NODE_ENV === 'development') console.error('❌ 前端物流選擇回調 API 錯誤:', error)
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

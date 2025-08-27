import { NextResponse } from "next/server"

export async function POST(req: Request) {
  console.log('🎯 ECPay 付款回調處理開始')
  console.log('⏰ 回調時間:', new Date().toISOString())
  
  try {
    // 解析回調資料
    const body = await req.text()
    console.log('📨 收到 ECPay 回調資料:', body)
    
    // 如果是 form data 格式，需要解析
    const formData = new URLSearchParams(body)
    const callbackData = Object.fromEntries(formData.entries())
    
    console.log('📋 解析後的回調資料:', callbackData)
    
    // 必要欄位驗證
    const {
      MerchantTradeNo,
      RtnCode,
      RtnMsg,
      TradeNo,
      TradeAmt,
      PaymentDate,
      PaymentType,
      TradeDate
    } = callbackData
    
    if (!MerchantTradeNo) {
      console.error('❌ 缺少商戶交易號碼')
      return new Response("0|Missing MerchantTradeNo", { status: 400 })
    }
    
    console.log(`📊 付款狀態: ${RtnCode === '1' ? '成功' : '失敗'}`)
    console.log(`💰 交易金額: ${TradeAmt}`)
    console.log(`📅 付款時間: ${PaymentDate}`)
    
    // 直接轉發給後端處理
    const backendUrl = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/callback`
    
    console.log('🔄 轉發回調資料到後端:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ECPay-Frontend-Proxy/1.0'
      },
      body: body
    })
    
    console.log('後端處理結果:', response.status, response.statusText)
    
    if (response.ok) {
      const result = await response.text()
      console.log('✅ 後端處理成功:', result)
      
      // 如果付款成功，可以重定向到成功頁面
      if (RtnCode === '1') {
        console.log('🎉 付款成功，準備重定向')
        // 可以根據需要返回重定向指令或其他響應
      }
      
      return new Response(result)
    } else {
      const errorText = await response.text()
      console.error('❌ 後端處理失敗:', errorText)
      return new Response("0|Backend Error", { status: 500 })
    }
    
  } catch (error) {
    console.error('💥 付款回調處理錯誤:', error)
    return new Response("0|System Error", { status: 500 })
  }
}

// 支援 GET 請求（有些情況下 ECPay 可能使用 GET）
export async function GET(req: Request) {
  console.log('📥 收到 GET 付款回調')
  
  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams.entries())
  
  console.log('🔍 GET 參數:', params)
  
  // 轉換為 POST 處理
  const formData = new URLSearchParams(params)
  const mockRequest = {
    text: async () => formData.toString()
  } as Request
  
  return POST(mockRequest)
}

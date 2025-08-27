import { NextResponse } from "next/server"

export async function POST(req: Request) {
  console.log('🌐🌐🌐 前端 ECPay API 被呼叫！！！')
  console.log('⏰ 時間:', new Date().toISOString())
  
  try {
    const { cart, customer, shippingAddress, shippingMethod, selectedStore } = await req.json()
    
    console.log('📦 前端收到的參數:')
    console.log('- cart ID:', cart?.id)
    console.log('- cart total:', cart?.total)
    console.log('- cart items:', cart?.items?.length || 0)
    console.log('- customer ID:', customer?.id) 
    console.log('- shippingAddress:', !!shippingAddress ? '✅ 有地址' : '❌ 無地址')
    console.log('- shippingMethod:', shippingMethod)
    console.log('- selectedStore:', !!selectedStore ? '✅ 有門市' : '❌ 無門市')

    // 驗證必要資訊
    if (!cart || !cart.id) {
      return NextResponse.json(
        { success: false, message: "購物車資訊無效" },
        { status: 400 }
      )
    }

    if (!shippingAddress ||
        !shippingAddress.first_name || 
        !shippingAddress.last_name ||
        !shippingAddress.address_1 ||
        !shippingAddress.city ||
        !shippingAddress.phone) {
      return NextResponse.json(
        { success: false, message: "請先填寫完整收件資訊" },
        { status: 400 }
      )
    }

    console.log('🔄 準備調用後端 API...')
    console.log('後端 URL:', `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/create-payment`)
    console.log('API Key:', process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? 'SET' : 'NOT_SET')
    
    const backendUrl = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/create-payment`
    const requestBody = { 
      cart,
      customer,
      shippingAddress,
      shippingMethod,
      selectedStore
    }
    
    console.log('🔄 Request payload:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      body: JSON.stringify(requestBody),
    })

    console.log('後端回應狀態:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 後端錯誤回應:', errorText)
      
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { error: errorData.error || errorData.message || "後端處理失敗" },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { error: `後端處理失敗: ${response.status} ${response.statusText}` },
          { status: response.status }
        )
      }
    }
    
    const data = await response.json()
    console.log('後端回應數據:', data)
    
    // 驗證回應數據
    if (!data.html) {
      console.error('❌ 後端未返回 HTML:', data)
      return NextResponse.json(
        { error: "後端未返回付款表單 HTML" },
        { status: 500 }
      )
    }
    
    console.log('✅ 付款表單 HTML 驗證通過')
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}

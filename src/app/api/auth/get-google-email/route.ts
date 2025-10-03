import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 })
    }

    // 取得客戶的認證 token 來進行後端查詢
    const authToken = request.cookies.get('_medusa_auth_token')?.value

    if (!authToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    // 這裡我們需要直接查詢資料庫，因為 Medusa SDK 可能沒有提供這個功能
    // 我們可以使用原生的資料庫查詢
    const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/admin/custom/google-email/${customerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // 如果後端沒有這個端點，我們回傳失敗讓前端處理
      return NextResponse.json({ success: false, error: 'Backend API not available' })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      email: data.email || null
    })

  } catch (error: any) {
    console.error('Get Google email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
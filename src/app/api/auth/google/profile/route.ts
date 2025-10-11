// 向 Medusa 後端請求獲取 Google 用戶資料的 API Endpoint
// 建議將此檔案保存到前端專案中的相應位置

import { NextRequest, NextResponse } from 'next/server'
import { getAuthHeaders } from '@/lib/data/cookies'

// 這個端點用於向 Medusa 後端查詢用戶的 Google 身份資料
export async function GET(request: NextRequest) {
  try {
    // 檢查是否有認證標頭
    const headers = await getAuthHeaders()
    
    if (!(headers as any)?.authorization) {
      return NextResponse.json(
        { error: 'Authorization header required' }, 
        { status: 401 }
      )
    }
    
    // 設置後端 URL
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    
    // 首先嘗試獲取當前客戶資料
    const customerResponse = await fetch(`${backendUrl}/store/customers/me`, {
      headers: headers as any,
      cache: 'no-cache',
    })
    
    if (!customerResponse.ok) {
      console.error('從 Medusa 獲取客戶資料失敗:', customerResponse.status, customerResponse.statusText)
      return NextResponse.json(
        { error: `Failed to fetch customer data: ${customerResponse.statusText}` }, 
        { status: customerResponse.status }
      )
    }
    
    const customerData = await customerResponse.json()
    
    // 如果客戶郵件是預設值，嘗試獲取 Google 提供者身份資訊
    if (customerData.customer.email === 'example@medusajs.com') {
      console.log('檢測到預設郵件，嘗試查詢提供者身份資訊')
      
      // 向後端發送請求以獲取關聯的 OAuth 提供者身份資訊
      // 這需要後端提供相應的 API，這只是一個示例
      try {
        const providerResponse = await fetch(`${backendUrl}/store/customers/me/auth-provider`, {
          headers: headers as any,
          cache: 'no-cache',
        })
        
        if (providerResponse.ok) {
          const providerData = await providerResponse.json()
          return NextResponse.json({
            customer: customerData.customer,
            providerInfo: providerData,
            message: 'Retrieved provider identity'
          })
        }
      } catch (providerError) {
        console.error('獲取提供者資訊失敗:', providerError)
        // 繼續使用可用的客戶資料
      }
    }
    
    return NextResponse.json({
      customer: customerData.customer,
      message: 'Customer data retrieved'
    })
    
  } catch (error) {
    console.error('處理獲取 Google 用戶資料請求失敗:', error)
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    )
  }
}
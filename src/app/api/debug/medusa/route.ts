import { NextRequest, NextResponse } from "next/server"
import { getAuthHeaders } from "@lib/data/cookies"

export async function GET(_request: NextRequest) {
  try {
    // console.log('🔍 測試 Medusa 後端連接...')
    
    // 檢查認證 headers
    const authHeaders = await getAuthHeaders()
    // console.log('📋 認證 headers:', authHeaders)
    
    // 直接調用 Medusa 後端的 /store/customers/me
    const medusaUrl = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me`
    // console.log('🎯 調用 Medusa 端點:', medusaUrl)
    
    const response = await fetch(medusaUrl, {
      method: 'GET',
      headers: authHeaders,
    })
    
    // console.log('📡 Medusa 回應:', {
      // status: response.status,
      // statusText: response.statusText,
      // ok: response.ok,
      // headers: Object.fromEntries(response.headers.entries())
    // })
    
    let responseData
    try {
      responseData = await response.json()
      // console.log('📄 Medusa 回應內容:', responseData)
    } catch (jsonError) {
      // console.log('⚠️ 無法解析 JSON，嘗試讀取文本:', jsonError)
      const textData = await response.text()
      // console.log('📄 Medusa 回應 (文本):', textData)
      responseData = { error: 'Non-JSON response', text: textData }
    }
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      authHeaders: authHeaders,
      medusaUrl: medusaUrl
    }, { status: response.status })
    
  } catch (error) {
    // console.error('❌ Medusa 連接測試錯誤:', error)
    return NextResponse.json({
      success: false,
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
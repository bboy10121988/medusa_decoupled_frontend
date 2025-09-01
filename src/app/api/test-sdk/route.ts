import { NextRequest, NextResponse } from 'next/server'
import { sdk } from "@lib/config"

export const maxDuration = 10

export async function GET(request: NextRequest) {
  try {
    // 測試 SDK 連接
    const regionResponse = await sdk.client.fetch(`/store/regions?limit=1`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": (await import('@lib/medusa-publishable-key')).getPublishableKeyForBackend(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL),
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "SDK 連接正常", 
      data: regionResponse 
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('測試 SDK 連接時出錯:', error)
    return NextResponse.json({ 
      success: false, 
      message: "SDK 連接錯誤", 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

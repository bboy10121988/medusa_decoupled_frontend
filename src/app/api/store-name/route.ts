import { NextResponse } from 'next/server'
import { getStoreName } from '@lib/store-name'

// API 路由處理函數
export async function GET() {
  try {
    const name = await getStoreName()
    return NextResponse.json({ name })
  } catch (error) {
    console.error('API 路由中獲取店名時出錯:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store name' },
      { status: 500 }
    )
  }
}

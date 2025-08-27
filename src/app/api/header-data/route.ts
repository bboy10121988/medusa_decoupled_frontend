import { NextResponse } from 'next/server'
import { getHeaderData } from '@lib/store-name'

// API 路由處理函數
export async function GET() {
  try {
    const headerData = await getHeaderData()
    return NextResponse.json({
      storeName: headerData?.storeName || "TIMS FANTACY WORLD",
      logoWidth: headerData?.logoWidth || 150,
    })
  } catch (error) {
    console.error('API 路由中獲取 header 數據時出錯:', error)
    return NextResponse.json(
      { error: 'Failed to fetch header data' },
      { status: 500 }
    )
  }
}

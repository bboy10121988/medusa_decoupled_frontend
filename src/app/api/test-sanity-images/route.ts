import { NextRequest, NextResponse } from 'next/server'
import { getSanityImages } from '@/lib/services/sanity-media-service'

export async function GET() {
  try {
    const images = await getSanityImages()
    return NextResponse.json({
      success: true,
      count: images.length,
      images: images.slice(0, 5), // 只返回前5張圖片以避免資料量過大
      message: `成功獲取 ${images.length} 張 Sanity 圖片`
    })
  } catch (error) {
    console.error('Sanity 圖片測試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: 'Sanity 圖片獲取失敗'
    }, { status: 500 })
  }
}
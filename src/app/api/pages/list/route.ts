import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity-client'

export async function GET(request: NextRequest) {
  try {
    // 從 Sanity 查詢所有 GrapesJS 頁面
    const pages = await client.fetch(
      `*[_type == "grapesJSPageV2"] | order(updatedAt desc) {
        _id,
        title,
        slug,
        status,
        createdAt,
        updatedAt
      }`
    )

    return NextResponse.json({
      success: true,
      pages: pages || [],
      message: '頁面列表載入成功'
    })

  } catch (error) {
    console.error('從 Sanity 載入頁面列表失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '載入失敗' 
      },
      { status: 500 }
    )
  }
}
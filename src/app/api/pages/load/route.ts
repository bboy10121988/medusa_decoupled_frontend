import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    if (!pageId) {
      return NextResponse.json(
        { success: false, error: '缺少 pageId 參數' },
        { status: 400 }
      )
    }

    // 將 pageId 轉換為 slug 格式
    const slug = pageId.toLowerCase().replace(/[^a-z0-9]/g, '-')

    // 從 Sanity 查詢頁面
    const page = await client.fetch(
      `*[_type == "grapesJSPageV2" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        status,
        grapesHtml,
        grapesCss,
        grapesComponents,
        grapesStyles,
        createdAt,
        updatedAt
      }`,
      { slug }
    )

    return NextResponse.json({
      success: true,
      page: page || null,
      message: page ? '頁面載入成功' : '頁面不存在'
    })

  } catch (error) {
    console.error('從 Sanity 載入頁面失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '載入失敗' 
      },
      { status: 500 }
    )
  }
}
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

    // 將 pageId 轉換為 slug 格式（如果需要）
    const slug = pageId.toLowerCase().replace(/[^a-z0-9]/g, '-')

    console.log('載入頁面查詢:', { originalPageId: pageId, processedSlug: slug })

    // 從 Sanity 查詢頁面 - 嘗試多種查詢方式
    let page = await client.fetch(
      `*[_type == "dynamicPage" && slug.current == $slug][0] {
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
      { slug: pageId } // 先嘗試原始 pageId
    )

    // 如果沒找到，嘗試處理後的 slug
    if (!page && pageId !== slug) {
      page = await client.fetch(
        `*[_type == "dynamicPage" && slug.current == $slug][0] {
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
    }

    if (!page) {
      return NextResponse.json({
        success: false,
        error: '頁面不存在',
        message: `找不到 pageId: ${pageId} (slug: ${slug}) 對應的頁面`
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      page: page,
      message: '頁面載入成功'
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
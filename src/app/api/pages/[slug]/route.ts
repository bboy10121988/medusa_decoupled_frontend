import { NextRequest, NextResponse } from 'next/server'
import { grapesJSPageService } from '@/lib/services/grapesjs-page-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const searchParams = request.nextUrl.searchParams
    const preview = searchParams.get('preview') === 'true'
    
    // 獲取頁面數據
    const page = await grapesJSPageService.getPageBySlug(slug)
    
    if (!page) {
      return NextResponse.json(
        { error: '頁面不存在' },
        { status: 404 }
      )
    }

    // 檢查頁面狀態
    if (!preview && page.status !== 'published') {
      return NextResponse.json(
        { error: '頁面尚未發布' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('API 錯誤:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
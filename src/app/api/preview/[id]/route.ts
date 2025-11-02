import { NextRequest, NextResponse } from 'next/server'
import { grapesJSPageService } from '@/lib/services/grapesjs-page-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // 獲取頁面數據（包含草稿）
    const page = await grapesJSPageService.getPageById(id)
    
    if (!page) {
      return NextResponse.json(
        { error: '頁面不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    // console.error('預覽 API 錯誤:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // 更新頁面內容
    const updatedPage = await grapesJSPageService.updatePage({
      _id: id,
      ...body
    })
    
    return NextResponse.json(updatedPage)
  } catch (error) {
    // console.error('更新預覽 API 錯誤:', error)
    return NextResponse.json(
      { error: '更新失敗' },
      { status: 500 }
    )
  }
}
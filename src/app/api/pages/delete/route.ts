import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity-client'

export async function POST(request: NextRequest) {
  try {
    const { pageId } = await request.json()

    if (!pageId) {
      return NextResponse.json(
        { success: false, error: '缺少 pageId 參數' },
        { status: 400 }
      )
    }

    console.log('正在刪除頁面:', pageId)

    // 從 Sanity 刪除頁面
    const result = await client.delete(pageId)

    console.log('頁面已刪除:', result)

    return NextResponse.json({
      success: true,
      message: '頁面刪除成功',
      deletedId: pageId
    })

  } catch (error) {
    console.error('從 Sanity 刪除頁面失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '刪除失敗' 
      },
      { status: 500 }
    )
  }
}

// 保持向後兼容的 DELETE 方法
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    if (!pageId) {
      return NextResponse.json(
        { success: false, error: '缺少 pageId 參數' },
        { status: 400 }
      )
    }

    // 從 Sanity 刪除頁面
    const result = await client.delete(pageId)

    console.log('頁面已刪除:', result)

    return NextResponse.json({
      success: true,
      message: '頁面刪除成功',
      deletedId: pageId
    })

  } catch (error) {
    console.error('從 Sanity 刪除頁面失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '刪除失敗' 
      },
      { status: 500 }
    )
  }
}
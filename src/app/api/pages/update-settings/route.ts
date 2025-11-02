import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity-client'

export async function POST(request: NextRequest) {
  try {
    const { pageId, settings } = await request.json()

    if (!pageId || !settings) {
      return NextResponse.json(
        { success: false, error: '缺少必要參數' },
        { status: 400 }
      )
    }

    // console.log('更新頁面設定:', { pageId, settings })

    // 更新頁面設定
    const result = await client
      .patch(pageId)
      .set({
        title: settings.title,
        slug: {
          _type: 'slug',
          current: settings.slug
        },
        status: settings.status,
        updatedAt: new Date().toISOString()
      })
      .commit()

    // console.log('頁面設定已更新:', result)

    return NextResponse.json({
      success: true,
      data: result,
      message: '頁面設定已更新'
    })

  } catch (error) {
    // console.error('更新頁面設定失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '更新失敗' 
      },
      { status: 500 }
    )
  }
}
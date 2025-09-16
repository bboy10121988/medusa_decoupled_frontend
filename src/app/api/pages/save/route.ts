import { NextRequest, NextResponse } from 'next/server'
import { client } from '@shared/sanity-integration'

export async function POST(request: NextRequest) {
  try {
    const { pageId, pageData } = await request.json()

    console.log('收到保存請求:', { pageId, pageData: { ...pageData, grapesHtml: `[${pageData.grapesHtml?.length || 0} chars]` } })

    if (!pageData) {
      return NextResponse.json(
        { success: false, error: '缺少頁面數據' },
        { status: 400 }
      )
    }

    if (!pageData.slug?.current) {
      return NextResponse.json(
        { success: false, error: '缺少頁面 slug' },
        { status: 400 }
      )
    }

    // 檢查是否已存在相同 slug 的頁面
    const existingPage = await client.fetch(
      `*[_type == "grapesJSPageV2" && slug.current == $slug][0]`,
      { slug: pageData.slug.current }
    )

    console.log('查找現有頁面結果:', existingPage ? `找到頁面: ${existingPage._id}` : '未找到現有頁面')

    let result

    if (existingPage) {
      // 更新現有頁面
      result = await client
        .patch(existingPage._id)
        .set({
          grapesHtml: pageData.grapesHtml,
          grapesCss: pageData.grapesCss,
          grapesComponents: pageData.grapesComponents,
          grapesStyles: pageData.grapesStyles,
          updatedAt: new Date().toISOString()
        })
        .commit()

      console.log('頁面已更新:', result?._id)
    } else {
      // 創建新頁面
      result = await client.create({
        ...pageData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      console.log('新頁面已創建:', result?._id)
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: existingPage ? '頁面已更新' : '頁面已創建'
    })

  } catch (error) {
    console.error('保存頁面到 Sanity 失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '保存失敗' 
      },
      { status: 500 }
    )
  }
}
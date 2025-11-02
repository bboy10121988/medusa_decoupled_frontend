import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity-client'

export async function POST(request: NextRequest) {
  try {
    const { title, slug, status = 'draft' } = await request.json()

    // console.log('收到新頁面建立請求:', { title, slug, status })

    if (!title) {
      return NextResponse.json(
        { success: false, error: '缺少頁面標題' },
        { status: 400 }
      )
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, error: '缺少頁面路徑' },
        { status: 400 }
      )
    }

    // 驗證slug格式
    const slugPattern = /^[a-z0-9-]+$/
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { success: false, error: '頁面路徑只能包含小寫字母、數字和連字符' },
        { status: 400 }
      )
    }

    // 檢查是否已存在相同 slug 的頁面
    const existingPage = await client.fetch(
      `*[_type == "dynamicPage" && slug.current == $slug][0]`,
      { slug }
    )

    if (existingPage) {
      return NextResponse.json(
        { success: false, error: '該頁面路徑已存在，請選擇其他路徑' },
        { status: 400 }
      )
    }

    // 創建新頁面
    const newPage = await client.create({
      _type: 'dynamicPage',
      title,
      slug: {
        _type: 'slug',
        current: slug
      },
      status,
      grapesHtml: '<div>歡迎使用 GrapesJS 編輯器！</div>',
      grapesCss: 'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }',
      grapesComponents: '[]',
      grapesStyles: '[]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seo: {
        _type: 'seoMeta',
        title: title,
        description: '',
        keywords: [],
        openGraph: {
          title: title,
          description: '',
          image: null
        }
      }
    })

    // console.log('新頁面已創建:', newPage._id)

    return NextResponse.json(newPage)

  } catch (error) {
    // console.error('建立頁面失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '建立頁面失敗' 
      },
      { status: 500 }
    )
  }
}
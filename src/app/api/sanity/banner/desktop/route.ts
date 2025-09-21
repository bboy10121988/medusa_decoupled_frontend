import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export const runtime = 'nodejs'

// 上傳並更新桌面版 banner 圖片
export async function POST(req: NextRequest) {
  try {
    const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

    if (!token || !projectId) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要的配置' 
      }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const bannerId = formData.get('bannerId') as string
    const slideIndex = formData.get('slideIndex') as string

    if (!file || !bannerId || slideIndex === null) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要的參數：file, bannerId, slideIndex' 
      }, { status: 400 })
    }

    // 文件驗證
    const MAX_SIZE_BYTES = 6 * 1024 * 1024 // 6MB
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ 
        success: false, 
        error: '文件過大（最大 6MB）' 
      }, { status: 413 })
    }

    const mime = file.type
    if (!mime || !mime.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        error: '只允許上傳圖片文件' 
      }, { status: 415 })
    }

    const writeClient = createClient({
      projectId,
      dataset,
      apiVersion: '2023-05-30',
      token,
      useCdn: false,
      perspective: 'published',
    })

    // 1. 上傳圖片到 Sanity
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_')
    
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: `desktop-banner-${sanitizedName}`,
      contentType: mime,
    })

    // 2. 更新 mainBanner 的指定 slide 的 desktopImage
    const slideIndexNum = parseInt(slideIndex)
    
    // 首先獲取當前的 homePage 文檔
    const homePage = await writeClient.fetch(`*[_type == "homePage"][0]`)
    
    if (!homePage) {
      return NextResponse.json({ 
        success: false, 
        error: '找不到首頁文檔' 
      }, { status: 404 })
    }

    // 找到對應的 mainBanner 和 slide
    const mainSections = homePage.mainSections || []
    let bannerFound = false
    
    const updatedSections = mainSections.map((section: any) => {
      if (section._type === 'mainBanner' && section._key === bannerId) {
        bannerFound = true
        const updatedSlides = (section.slides || []).map((slide: any, index: number) => {
          if (index === slideIndexNum) {
            return {
              ...slide,
              desktopImage: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: asset._id
                }
              }
            }
          }
          return slide
        })
        
        return {
          ...section,
          slides: updatedSlides
        }
      }
      return section
    })

    if (!bannerFound) {
      return NextResponse.json({ 
        success: false, 
        error: '找不到指定的 banner' 
      }, { status: 404 })
    }

    // 更新文檔
    const result = await writeClient
      .patch(homePage._id)
      .set({ mainSections: updatedSections })
      .commit()

    return NextResponse.json({
      success: true,
      message: '桌面版 banner 圖片上傳並更新成功',
      asset: {
        _id: asset._id,
        url: asset.url,
        originalFilename: asset.originalFilename,
      },
      updatedDocument: result
    })

  } catch (error: any) {
    console.error('桌面版 banner 圖片上傳更新錯誤:', error)
    return NextResponse.json(
      { success: false, error: error?.message || '操作失敗' },
      { status: 500 }
    )
  }
}
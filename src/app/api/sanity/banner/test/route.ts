import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export const runtime = 'nodejs'

// 獲取首頁的所有 mainBanner 數據
export async function GET() {
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Missing project ID' }, { status: 500 })
    }

    const readClient = createClient({
      projectId,
      dataset,
      apiVersion: '2023-05-30',
      useCdn: false,
      perspective: 'published',
    })

    // 獲取首頁的所有 mainBanner 數據
    const homePage = await readClient.fetch(`
      *[_type == "homePage"][0] {
        _id,
        title,
        "mainBanners": mainSections[_type == "mainBanner"] {
          _key,
          _type,
          isActive,
          "slides": slides[] {
            _key,
            heading,
            subheading,
            "desktopImage": desktopImage.asset->url,
            "desktopImageAlt": desktopImage.alt,
            "mobileImage": mobileImage.asset->url,
            "mobileImageAlt": mobileImage.alt,
            imageLink
          },
          "settings": settings {
            autoplay,
            autoplaySpeed,
            showArrows,
            showDots
          }
        }
      }
    `)

    return NextResponse.json({
      success: true,
      data: homePage,
      bannerCount: homePage?.mainBanners?.length || 0,
      totalSlides: homePage?.mainBanners?.reduce((total: number, banner: any) => 
        total + (banner.slides?.length || 0), 0) || 0
    })

  } catch (error: any) {
    console.error('獲取 banner 數據錯誤:', error)
    return NextResponse.json(
      { success: false, error: error?.message || '獲取失敗' },
      { status: 500 }
    )
  }
}

// 測試更新特定 banner 的特定 slide
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, bannerIndex, slideIndex, imageType } = body

    if (action === 'test-update') {
      // 這裡只是返回測試信息，不實際更新
      return NextResponse.json({
        success: true,
        message: '測試更新請求',
        params: {
          bannerIndex,
          slideIndex,
          imageType,
          mobileUploadUrl: '/api/sanity/banner/mobile',
          desktopUploadUrl: '/api/sanity/banner/desktop'
        },
        instructions: {
          mobile: 'POST /api/sanity/banner/mobile with FormData: file, bannerId, slideIndex',
          desktop: 'POST /api/sanity/banner/desktop with FormData: file, bannerId, slideIndex'
        }
      })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })

  } catch (error: any) {
    console.error('測試更新錯誤:', error)
    return NextResponse.json(
      { success: false, error: error?.message || '測試失敗' },
      { status: 500 }
    )
  }
}
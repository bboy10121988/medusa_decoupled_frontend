import { NextRequest, NextResponse } from 'next/server'
import { client } from '@lib/sanity'

export async function GET(request: NextRequest) {
  try {
    // 測試獲取首頁 mainBanner 數據
    const query = `*[_type == "homePage"][0] {
      title,
      "mainSections": mainSections[_type == "mainBanner"] {
        _type,
        isActive,
        "slides": slides[] {
          heading,
          subheading,
          "desktopImage": desktopImage.asset->url,
          "desktopImageAlt": desktopImage.alt,
          "mobileImage": mobileImage.asset->url,
          "mobileImageAlt": mobileImage.alt,
          buttonText,
          buttonLink
        },
        "settings": settings {
          autoplay,
          autoplaySpeed,
          showArrows,
          showDots
        }
      }
    }`
    
    const result = await client.fetch(query)
    
    console.log('🎯 MainBanner 測試結果:', JSON.stringify(result, null, 2))
    
    return NextResponse.json({
      success: true,
      data: result,
      bannerCount: result?.mainSections?.length || 0
    })
  } catch (error) {
    console.error('❌ MainBanner 測試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
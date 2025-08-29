import { NextResponse } from 'next/server'
import { getHomepage } from '@lib/sanity'

export async function GET() {
  try {
    const homepage = await getHomepage()
    
    // 檢查每個區塊的 isActive 狀態
    const debugInfo = {
      title: homepage.title,
      sectionsCount: homepage.mainSections?.length || 0,
      sections: homepage.mainSections?.map(section => ({
        _type: section._type,
        isActive: section.isActive,
        heading: (section as any).heading || (section as any).title,
        // 添加特定欄位用於識別
        ...(section._type === 'serviceCardSection' && {
          cardsCount: (section as any).cards?.length || 0
        }),
        ...(section._type === 'blogSection' && {
          limit: (section as any).limit,
          category: (section as any).category
        })
      })) || []
    }
    
    return NextResponse.json(debugInfo, { status: 200 })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch homepage data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

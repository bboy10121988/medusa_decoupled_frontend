import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 檢查請求是否來自 Sanity
    const signature = request.headers.get('sanity-webhook-signature')
    if (!signature) {
      return NextResponse.json({ error: '未授權的請求' }, { status: 401 })
    }

    // 觸發快取更新
    // 這裡使用 'sanity' tag，因為我們在 safeFetch 中已經為所有請求添加了這個 tag
    revalidateTag('sanity')
    
    console.log(`[Sanity Webhook] Cache revalidated for tag: sanity. Event type: ${body._type}`)

    return NextResponse.json({ 
      message: 'Cache revalidated',
      timestamp: new Date().toISOString(),
      type: body._type
    })
  } catch (error: any) {
    console.error('Webhook 處理錯誤:', error)
    return NextResponse.json({ 
      error: error.message 
    }, { 
      status: 500 
    })
  }
}

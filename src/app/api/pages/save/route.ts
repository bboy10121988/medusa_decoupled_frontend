import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity-client'

export async function POST(request: NextRequest) {
  try {
    // 設定請求超時處理
    const requestTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('請求超時，請稍後再試')), 30000)
    )
    
    // 解析請求內容，加上超時處理
    const requestData = await Promise.race([
      request.json(),
      requestTimeout
    ]) as any
    
    const { pageId, pageData } = requestData

    console.log('收到保存請求:', { 
      pageId, 
      pageData: { 
        ...pageData,
        grapesHtml: pageData?.grapesHtml ? `[${pageData.grapesHtml.length || 0} chars]` : 'undefined' 
      } 
    })

    // 詳細的輸入驗證
    if (!pageData) {
      console.error('保存失敗: 缺少頁面數據')
      return NextResponse.json(
        { success: false, error: '缺少頁面數據' },
        { status: 400 }
      )
    }

    if (!pageData._id) {
      console.error('保存失敗: 缺少頁面 ID')
      return NextResponse.json(
        { success: false, error: '缺少頁面 ID' },
        { status: 400 }
      )
    }

    // 驗證 HTML 和 CSS 數據是否有效
    if (typeof pageData.grapesHtml !== 'string') {
      console.error('保存失敗: HTML 內容格式無效')
      return NextResponse.json(
        { success: false, error: 'HTML 內容格式無效' },
        { status: 400 }
      )
    }
    
    if (typeof pageData.grapesCss !== 'string') {
      console.error('保存失敗: CSS 內容格式無效')
      return NextResponse.json(
        { success: false, error: 'CSS 內容格式無效' },
        { status: 400 }
      )
    }

    // 檢查 JSON 數據是否有效
    try {
      if (pageData.grapesComponents) {
        // 確保是有效的 JSON
        if (typeof pageData.grapesComponents === 'string') {
          JSON.parse(pageData.grapesComponents)
        }
      }
      if (pageData.grapesStyles) {
        // 確保是有效的 JSON
        if (typeof pageData.grapesStyles === 'string') {
          JSON.parse(pageData.grapesStyles)
        }
      }
    } catch (jsonError) {
      console.error('保存失敗: 組件或樣式數據格式無效', jsonError)
      return NextResponse.json(
        { success: false, error: '組件或樣式數據格式無效' },
        { status: 400 }
      )
    }

    // 驗證頁面是否存在
    const existingPage = await client.fetch(
      `*[_type == "grapesJSPageV2" && _id == $id][0]`,
      { id: pageData._id }
    ).catch(err => {
      console.error('查詢頁面失敗:', err)
      return null
    })

    console.log('查找現有頁面結果:', existingPage ? `找到頁面: ${existingPage._id}` : '未找到現有頁面')

    if (!existingPage) {
      console.error(`保存失敗: 找不到 ID 為 ${pageData._id} 的頁面`)
      return NextResponse.json(
        { success: false, error: `找不到 ID 為 ${pageData._id} 的頁面` },
        { status: 404 }
      )
    }

    // 嘗試更新頁面，使用重試邏輯
    const maxRetries = 3
    let retryCount = 0
    let lastError = null

    while (retryCount < maxRetries) {
      try {
        console.log(`嘗試更新頁面 (嘗試 ${retryCount + 1}/${maxRetries})`)
        
        const result = await client
          .patch(existingPage._id)
          .set({
            grapesHtml: pageData.grapesHtml,
            grapesCss: pageData.grapesCss,
            grapesComponents: pageData.grapesComponents,
            grapesStyles: pageData.grapesStyles,
            updatedAt: new Date().toISOString()
          })
          .commit()

        console.log('頁面已成功更新:', result?._id)
        
        return NextResponse.json({
          success: true,
          data: result,
          message: '頁面已更新'
        })
      } catch (updateError: any) {
        lastError = updateError
        retryCount++
        console.error(`更新頁面失敗 (嘗試 ${retryCount}/${maxRetries}):`, updateError)
        
        // 如果是權限錯誤，立即失敗不重試
        if (updateError.message?.includes('permission')) {
          break
        }
        
        // 增加延遲時間，使用指數退避策略
        if (retryCount < maxRetries) {
          const delay = 1000 * Math.pow(2, retryCount - 1)
          console.log(`等待 ${delay}ms 後重試...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // 所有重試都失敗
    console.error('保存頁面到 Sanity 失敗，已達到最大重試次數:', lastError)
    return NextResponse.json(
      { 
        success: false, 
        error: lastError instanceof Error 
          ? `保存失敗 (${lastError.message})` 
          : '保存失敗，請稍後再試'
      },
      { status: 500 }
    )

  } catch (error) {
    console.error('保存頁面到 Sanity 失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error 
          ? `保存處理錯誤: ${error.message}` 
          : '保存處理發生未知錯誤' 
      },
      { status: 500 }
    )
  }
}
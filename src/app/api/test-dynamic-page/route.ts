import { NextResponse } from 'next/server'
import { grapesJSPageService } from '@/lib/services/grapesjs-page-service'

// 測試用 API：創建一個測試頁面
export async function POST() {
  try {
    // 創建測試頁面
    const testPage = await grapesJSPageService.createPage({
      title: '測試頁面',
      slug: 'test-page',
      description: '這是一個測試頁面',
      status: 'published',
      grapesHtml: `
        <div style="padding: 2rem; text-align: center; font-family: system-ui;">
          <h1 style="color: #2563eb; margin-bottom: 1rem;">🎉 動態頁面測試成功！</h1>
          <p style="color: #6b7280; font-size: 1.1rem;">
            這個頁面是通過 Sanity CMS 和 GrapesJS 創建的動態頁面。
          </p>
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin: 2rem auto;
            max-width: 600px;
          ">
            <h2>✅ 功能驗證清單</h2>
            <ul style="text-align: left; list-style: none; padding: 0;">
              <li>✅ Sanity CMS 數據存儲</li>
              <li>✅ 動態路由解析</li>
              <li>✅ GrapesJS 頁面渲染</li>
              <li>✅ 自定義 HTML/CSS 支援</li>
            </ul>
          </div>
          <p style="margin-top: 2rem; color: #9ca3af;">
            訪問路徑: <strong>/test-page</strong>
          </p>
        </div>
      `,
      grapesCss: `
        body {
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .test-container {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
      grapesComponents: '[]',
      grapesStyles: '[]'
    })

    return NextResponse.json({
      success: true,
      message: '測試頁面創建成功',
      page: testPage,
      url: '/test-page'
    })

  } catch (error) {
    console.error('創建測試頁面失敗:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '創建失敗' 
      },
      { status: 500 }
    )
  }
}
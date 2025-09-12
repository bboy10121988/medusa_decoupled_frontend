import { grapesJSPageService } from '@/lib/services/grapesjs-page-service'

export default function SanityConnectionTest() {
  const handleTestConnection = async () => {
    try {
      console.log('🔍 測試 Sanity 連線...')
      
      // 測試讀取權限
      const pages = await grapesJSPageService.getAllPages()
      console.log('✅ Sanity 讀取成功！頁面數量:', pages.length)
      console.log('📄 現有頁面:', pages)
      
      if (pages.length === 0) {
        console.log('ℹ️ 資料庫中尚無 GrapesJS 頁面')
      }
      
      alert(`✅ Sanity 連線成功！\n找到 ${pages.length} 個頁面`)
      
    } catch (error) {
      console.error('❌ Sanity 連線失敗:', error)
      alert(`❌ 連線失敗: ${error}`)
    }
  }

  const handleTestCreate = async () => {
    try {
      console.log('🔍 測試 Sanity 寫入權限...')
      
      const testPage = {
        title: '測試頁面',
        slug: `test-page-${Date.now()}`,
        description: '這是一個測試頁面',
        status: 'draft' as const,
        grapesHtml: '<div><h1>測試頁面</h1><p>這是測試內容</p></div>',
        grapesCss: 'h1 { color: blue; }',
        grapesComponents: {},
        grapesStyles: {},
        homeModules: []
      }
      
      const result = await grapesJSPageService.createPage(testPage)
      console.log('✅ 測試頁面創建成功:', result)
      alert(`✅ 寫入測試成功！\n創建了頁面: ${result.title}`)
      
    } catch (error: any) {
      console.error('❌ Sanity 寫入失敗:', error)
      
      if (error.message?.includes('權限不足')) {
        alert(`❌ 寫入權限不足\n\n請按照以下步驟設定：\n1. 前往 https://sanity.io/manage\n2. 選擇專案 ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}\n3. API → Tokens → Add API token\n4. 設定 Editor 或 Admin 權限\n5. 複製 token 到 .env.local 的 NEXT_PUBLIC_SANITY_TOKEN`)
      } else {
        alert(`❌ 寫入失敗: ${error.message}`)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Sanity 連線測試</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📡 連線狀態測試</h2>
          <p className="text-gray-600 mb-4">
            測試 Sanity 資料庫連線是否正常，並檢查現有的 GrapesJS 頁面。
          </p>
          <button
            onClick={handleTestConnection}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            測試讀取連線
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">✏️ 寫入權限測試</h2>
          <p className="text-gray-600 mb-4">
            測試是否可以創建新的 GrapesJS 頁面。需要設定 Sanity token。
          </p>
          <button
            onClick={handleTestCreate}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            測試創建頁面
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">⚙️ 設定說明</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>當前配置：</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>專案 ID: {process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}</li>
              <li>資料集: {process.env.NEXT_PUBLIC_SANITY_DATASET}</li>
              <li>API 版本: {process.env.NEXT_PUBLIC_SANITY_API_VERSION}</li>
              <li>Token 狀態: {process.env.NEXT_PUBLIC_SANITY_TOKEN ? '✅ 已設定' : '❌ 未設定'}</li>
            </ul>
            
            {!process.env.NEXT_PUBLIC_SANITY_TOKEN && (
              <div className="mt-4 p-4 bg-yellow-100 rounded">
                <p className="font-medium">需要設定 Sanity Token：</p>
                <ol className="list-decimal ml-6 mt-2 space-y-1">
                  <li>前往 <a href="https://sanity.io/manage" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Sanity 管理面板</a></li>
                  <li>選擇專案並進入 API → Tokens</li>
                  <li>創建新 token 並設定 Editor 權限</li>
                  <li>在 .env.local 中設定 NEXT_PUBLIC_SANITY_TOKEN</li>
                  <li>重新啟動開發伺服器</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
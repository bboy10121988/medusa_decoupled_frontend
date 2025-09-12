interface PageProps {
  params: Promise<{ countryCode: string; pageId: string }>
}

// GrapesJS 頁面資料類型
interface GrapesJSPageData {
  id: string
  name: string
  html: string
  css: string
  components: any
  styles: any
  createdAt: string
  updatedAt: string
}

// 從 API 獲取頁面數據
async function getPageData(pageId: string): Promise<GrapesJSPageData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/grapesjs-pages?id=${pageId}`, {
      cache: 'no-store' // 確保獲取最新數據
    })
    
    if (!response.ok) {
      console.log(`頁面 ${pageId} 不存在於 GrapesJS 數據中`)
      return null
    }
    
    const result = await response.json()
    return result.success ? result.page : null
  } catch (error) {
    console.error('獲取頁面數據失敗:', error)
    return null
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { countryCode, pageId } = await params

  // 嘗試從 GrapesJS 獲取頁面數據
  const grapesJSPage = await getPageData(pageId)
  
  if (grapesJSPage) {
    // 如果是 GrapesJS 建立的頁面，渲染完整內容
    return (
      <div className="min-h-screen bg-white">
        {/* 注入 CSS 樣式 */}
        {grapesJSPage.css && (
          <style dangerouslySetInnerHTML={{ __html: grapesJSPage.css }} />
        )}
        
        {/* 渲染頁面內容 */}
        <div 
          dangerouslySetInnerHTML={{ __html: grapesJSPage.html }}
          className="w-full"
        />
        
        {/* 頁面資訊 */}
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-3 py-2 rounded opacity-75 hover:opacity-100 transition-opacity">
          頁面: {grapesJSPage.name} | 更新時間: {new Date(grapesJSPage.updatedAt).toLocaleString('zh-TW')}
        </div>
      </div>
    )
  }

  // 如果不是 GrapesJS 頁面，顯示預設內容
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          動態頁面: {pageId}
        </h1>
        <p className="text-gray-600 mb-4">
          國家/地區代碼: {countryCode}
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                此頁面尚未通過 GrapesJS 編輯器建立。
                <br />
                請前往 <a href={`/${countryCode}/studio`} className="underline font-medium">頁面編輯器</a> 建立名為 "{pageId}" 的頁面。
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-500">
          這是一個動態頁面，可以根據 pageId 載入不同的內容。
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { pageId } = await params
  
  return {
    title: `${pageId} | 動態頁面`,
    description: `動態頁面 ${pageId} 的描述`,
  }
}

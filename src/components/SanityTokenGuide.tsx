'use client'

export default function SanityTokenGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🔑</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">設定 Sanity Token</h1>
        <p className="text-gray-600">需要設定 Sanity API Token 才能使用編輯器功能</p>
      </div>

      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                為什麼需要 Token？
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>GrapesJS 編輯器需要寫入權限才能保存和更新頁面到 Sanity CMS。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">設定步驟：</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">前往 Sanity 管理面板</h3>
                <p className="text-gray-600 mt-1">
                  開啟 <a 
                    href="https://sanity.io/manage/personal/project/m7o2mv1n" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    https://sanity.io/manage/personal/project/m7o2mv1n
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">創建新的 API Token</h3>
                <p className="text-gray-600 mt-1">
                  在 "API" 頁籤中點擊 "Add API token"
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">設定權限</h3>
                <p className="text-gray-600 mt-1">
                  選擇 <span className="font-mono bg-gray-100 px-2 py-1 rounded">Editor</span> 權限，這樣就能讀取和寫入內容
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">複製 Token</h3>
                <p className="text-gray-600 mt-1">
                  創建後複製產生的 token（這是唯一一次可以看到完整 token 的機會）
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">更新 .env.local</h3>
                <p className="text-gray-600 mt-1 mb-2">
                  在項目根目錄的 <span className="font-mono bg-gray-100 px-2 py-1 rounded">.env.local</span> 檔案中更新：
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>NEXT_PUBLIC_SANITY_TOKEN=your_actual_token_here</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                6
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">重新啟動開發伺服器</h3>
                <p className="text-gray-600 mt-1 mb-2">
                  在終端機中停止並重新啟動：
                </p>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>npm run dev</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                完成設定後
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>編輯器將能夠正常保存和載入頁面，您可以開始創建和編輯頁面了！</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            重新載入頁面
          </button>
        </div>
      </div>
    </div>
  )
}
// import SanityTokenGuide from '@/components/SanityTokenGuide'

export const metadata = {
  title: 'Sanity Token 設定指南',
  description: '學習如何設定 Sanity API Token 以使用 GrapesJS 編輯器'
}

export default function SanitySetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Sanity Token 設定指南
          </h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>注意：</strong> 此功能暫時停用，請聯繫開發人員以獲取設定協助。
          </div>
        </div>
      </div>
    </div>
  )
}
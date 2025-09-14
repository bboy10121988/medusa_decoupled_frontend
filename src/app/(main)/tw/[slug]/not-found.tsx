export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">頁面未找到</p>
        <p className="text-gray-500 mt-2">
          您請求的頁面不存在或已被移動。
        </p>
        <a 
          href="/pages-manager" 
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回頁面管理器
        </a>
      </div>
    </div>
  )
}
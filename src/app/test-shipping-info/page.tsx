import ShippingInfoTab from '../../modules/products/components/shipping-info-tab'

export default function TestShippingInfo() {
  // 模擬商品資料
  const mockProduct = {
    id: 'test-product',
    title: '測試商品',
    description: '這是一個測試商品',
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">ShippingInfoTab 組件測試</h1>
      
      <div className="border border-gray-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">退換貨規則測試</h2>
        <ShippingInfoTab product={mockProduct} />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">測試說明：</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>這個頁面直接測試 ShippingInfoTab 組件</li>
          <li>組件應該自動從 /api/pages/return 獲取資料</li>
          <li>檢查瀏覽器控制台確認 API 調用和轉換過程</li>
          <li>確認 Portable Text 正確轉換為 HTML 格式</li>
        </ul>
      </div>
    </div>
  )
}
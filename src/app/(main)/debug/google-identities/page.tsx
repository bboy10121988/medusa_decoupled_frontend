import { getAllGoogleIdentities } from '@/lib/data/google-identity';

export const dynamic = 'force-dynamic'; // 確保頁面不會被快取

export default async function GoogleIdentitiesPage() {
  const result = await getAllGoogleIdentities();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Google 身份測試頁面</h1>
      
      {result.success ? (
        <>
          <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
            <p className="text-green-700">✅ 成功獲取 {result.data?.length || 0} 筆 Google 身份資料</p>
          </div>
          
          {result.data && result.data.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">身份資料列表</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        電子郵件
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名稱
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Google ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        客戶 ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.data.map((identity, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {identity.email || '(無電子郵件)'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {identity.name || `${identity.given_name || ''} ${identity.family_name || ''}`.trim() || '(無名稱)'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {identity.provider_user_id || '(無 ID)'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {identity.customer_id || '(未關聯客戶)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">原始資料</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-yellow-700">查詢成功但沒有找到任何 Google 身份資料</p>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700">❌ 查詢失敗: {result.error}</p>
        </div>
      )}
    </div>
  );
}
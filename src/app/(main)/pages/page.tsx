import Link from 'next/link'
import { grapesJSPageService, type GrapesJSPageData } from '@/lib/services/grapesjs-page-service'

export const metadata = {
  title: '所有頁面',
  description: '瀏覽所有已發布的 GrapesJS 頁面'
}

export default async function PagesIndexPage() {
  let pages: GrapesJSPageData[] = []
  let error: string | null = null

  try {
    pages = await grapesJSPageService.getPublishedPages()
  } catch (err) {
    console.error('載入頁面列表失敗:', err)
    error = '載入頁面列表失敗'
    pages = []
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">載入失敗</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">暫無頁面</h1>
          <p className="text-gray-600">目前沒有已發布的頁面</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">所有頁面</h1>
        <p className="text-gray-600">瀏覽所有已發布的頁面</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page._id}
            href={`/pages/${page.slug.current}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {page.title}
              </h2>
              
              {page.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {page.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  已發布
                </span>
                
                {page.publishedAt && (
                  <time dateTime={page.publishedAt}>
                    {new Date(page.publishedAt).toLocaleDateString('zh-TW')}
                  </time>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          共 {pages.length} 個頁面
        </div>
      </div>
    </div>
  )
}
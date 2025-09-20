import { notFound } from 'next/navigation'
import { client } from '@/sanity-client'
import { Metadata } from 'next'
// import GrapesJSPageRenderer from '@/components/grapesjs/GrapesJSPageRenderer'

// 強制動態渲染，避免預渲染問題
export const dynamic = 'force-dynamic'

// 已知的系統路由，這些路由不應該被 GrapesJS 頁面處理
const SYSTEM_ROUTES = [
  'account',
  'affiliate',
  'affiliate-admin', 
  'blog',
  'cart',
  'categories',
  'collections',
  'login-affiliate',
  'order',
  'products',
  'regitster-affiliate',
  'store',
  'test-footer',
  // 管理相關路由
  'studio',
  'grapesjs-pages',
  'pages-manager',
  // 其他系統路由
  'checkout',
  'admin',
  'api'
]

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// 動態生成頁面元數據
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const page = await client.fetch(
      `*[_type == "grapesJSPageV2" && slug.current == $slug][0] {
        title,
        seoTitle,
        seoDescription,
        seoKeywords
      }`,
      { slug }
    )

    if (!page) {
      return {
        title: '頁面未找到',
        description: '請求的頁面不存在'
      }
    }

    return {
      title: page.seoTitle || page.title || '頁面',
      description: page.seoDescription || '使用 GrapesJS 編輯器創建的頁面',
      keywords: page.seoKeywords ? page.seoKeywords.join(', ') : undefined,
    }
  } catch (error) {
    console.error('生成頁面元數據失敗:', error)
    return {
      title: '頁面',
      description: '頁面內容'
    }
  }
}

// 主頁面組件
export default async function DynamicPageV2({ params }: PageProps) {
  const { slug } = await params
  
  // 如果是系統路由，則調用 notFound() 讓其他路由處理
  if (SYSTEM_ROUTES.includes(slug)) {
    notFound()
  }
  
  try {
    // 從 Sanity 獲取頁面數據（包含草稿頁面用於測試）
    const page = await client.fetch(
      `*[_type == "grapesJSPageV2" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        status,
        grapesHtml,
        grapesCss,
        grapesComponents,
        grapesStyles,
        createdAt,
        updatedAt
      }`,
      { slug }
    )

    if (!page) {
      notFound()
    }

    // 暫時顯示基本頁面信息，GrapesJS 渲染器暫時停用
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <strong>注意：</strong> GrapesJS 頁面渲染功能暫時停用
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-2">頁面資訊：</h2>
            <p><strong>Slug:</strong> {slug}</p>
            <p><strong>狀態:</strong> {page.status}</p>
            <p><strong>更新時間:</strong> {page.updatedAt}</p>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('載入頁面失敗:', error)
    notFound()
  }
}

// 生成靜態路徑（可選，用於預渲染）
// export async function generateStaticParams() { /* removed */ }
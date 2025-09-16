import { notFound } from 'next/navigation'
import { client } from '@shared/sanity-integration'
import { Metadata } from 'next'

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

    // 返回渲染的 HTML 內容
    return (
      <div className="dynamic-page">
        {/* 頁面狀態指示器 */}
        {(page.status === 'preview' || page.status === 'draft') && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: page.status === 'draft' ? '#dc2626' : '#ff9500',
            color: '#fff',
            padding: '8px',
            textAlign: 'center',
            fontSize: '14px',
            zIndex: 1000
          }}>
            {page.status === 'draft' ? '草稿模式 - 此頁面正在開發中' : '預覽模式 - 此頁面尚未發布'}
          </div>
        )}
        
        {/* 渲染頁面內容 */}
        <div 
          dangerouslySetInnerHTML={{ 
            __html: page.grapesHtml || '<div>此頁面沒有內容</div>' 
          }} 
        />
        
        {/* 內嵌樣式 */}
        {page.grapesCss && (
          <style dangerouslySetInnerHTML={{ __html: page.grapesCss }} />
        )}
      </div>
    )
  } catch (error) {
    console.error('載入頁面失敗:', error)
    notFound()
  }
}

// 生成靜態路徑（可選，用於預渲染）
export async function generateStaticParams() {
  try {
    const pages = await client.fetch(
      `*[_type == "grapesJSPageV2" && status == "published"] {
        slug
      }`
    )

    return pages.map((page: any) => ({
      slug: page.slug?.current || page._id,
    }))
  } catch (error) {
    console.error('生成靜態路徑失敗:', error)
    return []
  }
}

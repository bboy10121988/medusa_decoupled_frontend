import { notFound } from 'next/navigation'
import { client } from '@/sanity-client'
import { Metadata } from 'next'
import GrapesJSPageRenderer from '@/components/grapesjs/GrapesJSPageRenderer'

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

    // 使用 GrapesJS 頁面渲染器
    return <GrapesJSPageRenderer slug={slug} preview={page.status !== 'published'} />
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

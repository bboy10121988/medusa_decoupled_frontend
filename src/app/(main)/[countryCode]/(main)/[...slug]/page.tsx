import { notFound } from 'next/navigation'
import { client } from '@/sanity-client'
import { Metadata } from 'next'
import SimplePageRenderer from '@/components/grapesjs/SimplePageRenderer'

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
  'cms',
  // 其他系統路由
  'checkout',
  'admin',
  'api'
]

interface PageProps {
  params: Promise<{
    countryCode: string
    slug: string[]
  }>
}

// 動態生成頁面元數據
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  
  // 將 slug 數組轉換為字符串，處理多層路由
  const slugString = slug.join('/')
  
  try {
    const page = await client.fetch(
      `*[_type == "grapesJSPageV2" && slug.current == $slug][0] {
        title,
        seoTitle,
        seoDescription,
        seoKeywords
      }`,
      { slug: slugString }
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
export default async function CountryCodeCatchAllPage({ params }: PageProps) {
  const { countryCode, slug } = await params
  
  // 將 slug 數組轉換為字符串
  const slugString = slug.join('/')
  
  // 檢查第一個路由段是否為系統路由
  const firstSegment = slug[0]
  if (SYSTEM_ROUTES.includes(firstSegment)) {
    notFound()
  }
  
  try {
    // 從 Sanity 獲取頁面數據
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
      { slug: slugString }
    )

    if (!page) {
      console.log(`頁面未找到: /${countryCode}/${slugString}`)
      notFound()
    }

    console.log(`載入頁面: /${countryCode}/${slugString}`, { 
      pageId: page._id, 
      title: page.title,
      status: page.status 
    })

    // 使用簡單頁面渲染器
    return (
      <SimplePageRenderer 
        htmlContent={page.grapesHtml || '<p>頁面內容為空</p>'} 
        cssContent={page.grapesCss}
      />
    )
  } catch (error) {
    console.error('載入頁面失敗:', error)
    notFound()
  }
}

// 生成靜態路徑（可選，用於預渲染）
// 移除預產生的靜態參數，避免影響其他動態路由的建置
// export async function generateStaticParams() { /* removed to force dynamic */ }

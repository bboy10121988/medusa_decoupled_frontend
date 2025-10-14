import { notFound } from 'next/navigation'
import { client } from '@/sanity-client'
import { Metadata } from 'next'
import { DynamicPageContent } from '@/components/dynamic-page/DynamicPageContent'

// 系統保留路由
const SYSTEM_ROUTES = [
  'account', 'cart', 'checkout', 'login', 'register', 
  'store', 'api', 'admin', 'cms', '_next', 'sitemap.xml', 'robots.txt'
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
      `*[_type == "dynamicPage" && slug.current == $slug][0] {
        title,
        status,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogTitle,
        ogDescription,
        "socialImage": socialImage {
          "asset": asset->,
          "alt": alt
        },
        twitterCard
      }`,
      { slug: slugString }
    )

    if (page?.status !== 'published') {
      return {
        title: '頁面未找到',
        description: '請求的頁面不存在'
      }
    }

    return {
      title: page.seoTitle || page.title || '動態頁面',
      description: page.seoDescription || '動態生成的頁面內容',
      keywords: page.seoKeywords?.join(', ') || '',
      
      // Open Graph 社群媒體分享
      openGraph: {
        title: page.ogTitle || page.seoTitle || page.title || '動態頁面',
        description: page.ogDescription || page.seoDescription || '動態生成的頁面內容',
        type: 'website',
        locale: 'zh_TW',
        ...(page.socialImage?.asset?.url && {
          images: [{
            url: `${page.socialImage.asset.url}?w=1200&h=630&fit=crop&crop=center`,
            width: 1200,
            height: 630,
            alt: page.socialImage.alt || page.title || '動態頁面'
          }]
        })
      },
      
      // Twitter 卡片
      twitter: {
        card: page.twitterCard || 'summary_large_image',
        title: page.ogTitle || page.seoTitle || page.title || '動態頁面',
        description: page.ogDescription || page.seoDescription || '動態生成的頁面內容',
        ...(page.socialImage?.asset?.url && {
          images: [`${page.socialImage.asset.url}?w=1200&h=630&fit=crop&crop=center`]
        })
      }
    }
  } catch (error) {
    console.error('生成元數據時出錯:', error)
    return {
      title: '頁面未找到',
      description: '請求的頁面不存在'
    }
  }
}

// 頁面組件
export default async function DynamicPage({ params }: PageProps) {
  const { slug, countryCode } = await params
  
  // 將 slug 數組轉換為字符串，處理多層路由
  const slugString = slug.join('/')
  
  // 檢查第一個路由段是否為系統路由
  const firstSegment = slug[0]
  if (SYSTEM_ROUTES.includes(firstSegment)) {
    notFound()
  }
  
  try {
    // 從 Sanity 獲取頁面數據
    const page = await client.fetch(
      `*[_type == "dynamicPage" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        status,
        description,
        pageContent,
        seoTitle,
        seoDescription,
        seoKeywords,
        customCSS,
        customJS,
        _createdAt,
        _updatedAt
      }`,
      { slug: slugString }
    )

    if (!page) {
      console.log(`頁面未找到: /${countryCode}/${slugString}`)
      notFound()
    }

    // 檢查頁面發布狀態 - 只有已發布的頁面可以在前端顯示
    if (page.status !== 'published') {
      console.log(`頁面未發布: /${countryCode}/${slugString}`, { 
        pageId: page._id, 
        status: page.status,
        title: page.title 
      })
      notFound()
    }

    console.log(`載入動態頁面: /${countryCode}/${slugString}`, { 
      pageId: page._id, 
      title: page.title,
      status: page.status,
      hasContent: !!page.pageContent?.length
    })

    // 渲染頁面內容
    return (
      <div className="dynamic-page">
        {/* 頁面標題區塊 */}
        {page.title && (
          <div className="page-header bg-gray-50 py-8">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
              {page.description && (
                <p className="text-lg text-gray-600 mt-2">{page.description}</p>
              )}
            </div>
          </div>
        )}
        
        {/* 頁面內容區塊 */}
        <div className="page-content">
          <div className="container mx-auto px-4 py-8">
            <DynamicPageContent content={page.pageContent || []} />
          </div>
        </div>

        {/* 自定義 CSS */}
        {page.customCSS && (
          <style dangerouslySetInnerHTML={{ __html: page.customCSS }} />
        )}
        
        {/* 自定義 JavaScript */}
        {page.customJS && (
          <script dangerouslySetInnerHTML={{ __html: page.customJS }} />
        )}
      </div>
    )
  } catch (error) {
    console.error('載入頁面失敗:', error)
    notFound()
  }
}
import { Suspense } from 'react'
import GrapesJSPageRenderer from '@/components/cms/grapesjs/GrapesJSPageRenderer'
import { grapesJSPageService } from '@/lib/services/grapesjs-page-service'

interface PageProps {
  params: { slug: string }
  searchParams: { preview?: string }
}

// 生成頁面元數據
export async function generateMetadata({ params }: PageProps) {
  try {
    const page = await grapesJSPageService.getPageBySlug(params.slug)
    
    if (!page) {
      return {
        title: '頁面不存在',
        description: '找不到指定的頁面'
      }
    }

    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.description,
      keywords: page.seoKeywords?.join(', '),
      openGraph: {
        title: page.seoTitle || page.title,
        description: page.seoDescription || page.description,
        images: page.ogImage?.asset?.url ? [page.ogImage.asset.url] : undefined,
      }
    }
  } catch (error) {
    console.error('生成元數據時出錯:', error)
    return {
      title: '載入錯誤',
      description: '頁面載入失敗'
    }
  }
}

// 靜態生成已發布的頁面
export async function generateStaticParams() {
  try {
    const publishedPages = await grapesJSPageService.getPublishedPages()
    
    return publishedPages.map((page) => ({
      slug: page.slug.current,
    }))
  } catch (error) {
    console.error('生成靜態參數時出錯:', error)
    return []
  }
}

export default function GrapesJSPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams.preview === 'true'

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">載入頁面中...</p>
          </div>
        </div>
      }
    >
      <GrapesJSPageRenderer slug={params.slug} preview={isPreview} />
    </Suspense>
  )
}
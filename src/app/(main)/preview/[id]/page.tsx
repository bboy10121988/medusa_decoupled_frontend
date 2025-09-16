import { Suspense } from 'react'
import { grapesJSPageService } from '@/lib/services/grapesjs-page-service'
import GrapesJSPageRendererById from '@/components/cms/grapesjs/GrapesJSPageRendererById'

interface PreviewPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PreviewPageProps) {
  try {
    const page = await grapesJSPageService.getPageById(params.id)
    
    if (!page) {
      return {
        title: '預覽 - 頁面不存在',
        description: '找不到指定的頁面'
      }
    }

    return {
      title: `預覽 - ${page.title}`,
      description: page.description || '頁面預覽',
      robots: 'noindex, nofollow' // 預覽頁面不被搜索引擎索引
    }
  } catch (error) {
    console.error('生成預覽元數據時出錯:', error)
    return {
      title: '預覽 - 載入錯誤',
      description: '頁面載入失敗'
    }
  }
}

export default function PreviewPage({ params }: PreviewPageProps) {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">載入預覽中...</p>
          </div>
        </div>
      }
    >
      <GrapesJSPageRendererById id={params.id} preview={true} />
    </Suspense>
  )
}
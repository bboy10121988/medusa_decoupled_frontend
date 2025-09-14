'use client'

import { useEffect, useState } from 'react'
import { grapesJSPageService, type GrapesJSPageData } from '@/lib/services/grapesjs-page-service'

interface Props {
  slug: string
  preview?: boolean
}

export default function GrapesJSPageRenderer({ slug, preview = false }: Props) {
  const [page, setPage] = useState<GrapesJSPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const pageData = await grapesJSPageService.getPageBySlug(slug)
        
        if (!pageData) {
          setError('頁面不存在')
          return
        }

        // 檢查頁面狀態
        if (!preview && pageData.status !== 'published') {
          setError('頁面未發布')
          return
        }

        setPage(pageData)
      } catch (err) {
        console.error('載入頁面失敗:', err)
        setError('載入頁面時出現錯誤')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [slug, preview])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入頁面中...</p>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">頁面不存在</h2>
          <p className="text-gray-600 mb-8">{error || '找不到指定的頁面'}</p>
          <a 
            href="/" 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            回到首頁
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 預覽模式提示 */}
      {preview && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 z-50">
          <strong>預覽模式</strong> - 此頁面正在預覽中
        </div>
      )}
      
      {/* 頁面內容 */}
      <div 
        className={preview ? 'pt-12' : ''}
        dangerouslySetInnerHTML={{ 
          __html: page.grapesHtml || '<div>此頁面沒有內容</div>' 
        }} 
      />
      
      {/* 頁面樣式 */}
      <style dangerouslySetInnerHTML={{ 
        __html: page.grapesCss || '' 
      }} />
    </>
  )
}
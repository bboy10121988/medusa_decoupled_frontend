'use client'

import { useEffect, useState } from 'react'
import { grapesJSPageService, type GrapesJSPageData } from '@/lib/services/grapesjs-page-service'
import Head from 'next/head'

interface GrapesJSPageRendererProps {
  readonly slug: string
  readonly preview?: boolean // 預覽模式，包含草稿狀態
}

export default function GrapesJSPageRenderer({ slug, preview = false }: GrapesJSPageRendererProps) {
  const [page, setPage] = useState<GrapesJSPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const pageData = await grapesJSPageService.getPageBySlug(slug)
        
        if (!pageData) {
          setError('頁面不存在')
          return
        }

        // 檢查頁面狀態
        if (!preview && pageData.status !== 'published') {
          setError('頁面尚未發布')
          return
        }

        setPage(pageData)
      } catch (err) {
        console.error('載入頁面失敗:', err)
        setError('載入頁面失敗')
      } finally {
        setIsLoading(false)
      }
    }

    loadPage()
  }, [slug, preview])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入頁面中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">頁面載入失敗</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">頁面不存在</h1>
          <p className="text-gray-600">找不到指定的頁面</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{page.seoTitle || page.title}</title>
        <meta name="description" content={page.seoDescription || page.description} />
        {page.seoKeywords && page.seoKeywords.length > 0 && (
          <meta name="keywords" content={page.seoKeywords.join(', ')} />
        )}
        
        {/* Open Graph tags */}
        <meta property="og:title" content={page.seoTitle || page.title} />
        <meta property="og:description" content={page.seoDescription || page.description} />
        <meta property="og:type" content="website" />
        {page.ogImage && (
          <meta property="og:image" content={page.ogImage.asset?.url} />
        )}
        
        {/* Viewport setting */}
        {page.viewport && page.viewport !== 'responsive' && (() => {
          let width = '320'
          if (page.viewport === 'desktop') width = '1024'
          else if (page.viewport === 'tablet') width = '768'
          
          return (
            <meta 
              name="viewport" 
              content={`width=${width}`} 
            />
          )
        })()}
      </Head>

      {/* 預覽模式標識 */}
      {preview && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>預覽模式</strong> - 這是頁面的預覽版本，狀態：{page.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 頁面內容 */}
      <div className="grapesjs-rendered-page">
        {/* 自定義 CSS */}
        {page.customCSS && (
          <style dangerouslySetInnerHTML={{ __html: page.customCSS }} />
        )}
        
        {/* GrapesJS CSS */}
        {page.grapesCss && (
          <style dangerouslySetInnerHTML={{ __html: page.grapesCss }} />
        )}
        
        {/* 頁面 HTML 內容 */}
        {page.grapesHtml && (
          <div 
            dangerouslySetInnerHTML={{ __html: page.grapesHtml }}
            className="w-full"
          />
        )}
        
        {/* 自定義 JavaScript */}
        {page.customJS && (
          <script dangerouslySetInnerHTML={{ __html: page.customJS }} />
        )}
      </div>

      {/* 添加基本的響應式樣式 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .grapesjs-rendered-page {
            width: 100%;
            min-height: 100vh;
          }
          
          .grapesjs-rendered-page * {
            box-sizing: border-box;
          }
          
          .grapesjs-rendered-page img {
            max-width: 100%;
            height: auto;
          }
          
          @media (max-width: 768px) {
            .grapesjs-rendered-page {
              padding: 0;
            }
          }
        `
      }} />
    </>
  )
}
'use client'

import { useEffect, useState, useRef } from 'react'
import { grapesJSPageService, type GrapesJSPageData } from '@/lib/services/grapesjs-page-service'

interface Props {
  slug: string
  preview?: boolean
}

export default function GrapesJSPageRenderer({ slug, preview = false }: Props) {
  const [page, setPage] = useState<GrapesJSPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // 執行內聯 JavaScript
  const executeInlineScripts = (content: string) => {
    if (typeof window === 'undefined') return content

    // 提取並執行 script 標籤
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi
    const scripts: string[] = []
    
    const cleanContent = content.replace(scriptRegex, (match, scriptContent) => {
      if (scriptContent && scriptContent.trim()) {
        scripts.push(scriptContent.trim())
      }
      return '' // 移除 script 標籤，避免重複執行
    })

    // 延遲執行腳本，確保 DOM 已載入
    setTimeout(() => {
      scripts.forEach((scriptContent, index) => {
        try {
          console.log(`🔧 執行內聯腳本 ${index + 1}:`, scriptContent.substring(0, 100) + '...')
          
          // 創建函數來執行腳本，提供更好的作用域隔離
          const executeScript = new Function(scriptContent)
          executeScript()
          
          console.log(`✅ 腳本 ${index + 1} 執行成功`)
        } catch (error) {
          console.error(`❌ 腳本 ${index + 1} 執行失敗:`, error)
        }
      })
    }, 100)

    return cleanContent
  }

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

  // 當頁面內容載入後，執行內聯腳本
  useEffect(() => {
    if (page && page.grapesHtml && contentRef.current) {
      console.log('🎬 開始處理頁面內容和腳本...')
      
      // 執行內聯腳本
      executeInlineScripts(page.grapesHtml)
      
      // 初始化輪播等互動組件
      setTimeout(() => {
        // 檢查並初始化靜態輪播
        const carousels = document.querySelectorAll('.static-carousel')
        console.log(`🎠 找到 ${carousels.length} 個輪播組件`)
        
        carousels.forEach((carousel, index) => {
          console.log(`🔧 初始化輪播 ${index + 1}`)
          
          // 觸發輪播初始化
          if (typeof window !== 'undefined' && (window as any).showSlide) {
            (window as any).showSlide(0)
            if ((window as any).startAutoplay) {
              (window as any).startAutoplay()
            }
          }
        })
      }, 200)
    }
  }, [page])

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

  // 處理頁面內容，移除 script 標籤避免重複執行
  const processedHtml = page.grapesHtml ? executeInlineScripts(page.grapesHtml) : '<div>此頁面沒有內容</div>'

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
        ref={contentRef}
        className={preview ? 'pt-12' : ''}
        dangerouslySetInnerHTML={{ 
          __html: processedHtml
        }} 
      />
      
      {/* 頁面樣式 */}
      <style dangerouslySetInnerHTML={{ 
        __html: page.grapesCss || '' 
      }} />
    </>
  )
}
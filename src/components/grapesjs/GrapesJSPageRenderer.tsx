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
        // 清理腳本內容，移除可能的特殊字符
        const cleanScript = scriptContent.trim()
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
        
        scripts.push(cleanScript)
      }
      return '' // 移除 script 標籤，避免重複執行
    })

    // 延遲執行腳本，確保 DOM 已載入
    setTimeout(() => {
      scripts.forEach((scriptContent, index) => {
        try {
          console.log(`🔧 執行內聯腳本 ${index + 1}:`, scriptContent.substring(0, 100) + '...')
          
          // 驗證腳本內容是否有效
          if (!scriptContent || scriptContent.trim().length === 0) {
            console.warn(`⚠️ 腳本 ${index + 1} 為空，跳過執行`)
            return
          }
          
          // 檢查是否包含可能有問題的內容
          if (scriptContent.includes('<') || scriptContent.includes('>')) {
            console.warn(`⚠️ 腳本 ${index + 1} 包含 HTML 標籤，可能有問題:`, scriptContent)
          }
          
          // 使用更安全的執行方式
          if (typeof window !== 'undefined') {
            try {
              // 驗證 JavaScript 語法
              console.log(`🔍 驗證腳本語法...`)
              console.log(`腳本內容類型: ${typeof scriptContent}`)
              console.log(`腳本長度: ${scriptContent.length}`)
              console.log(`腳本前100字符:`, scriptContent.substring(0, 100))
              console.log(`腳本是否包含特殊字符:`, {
                hasLt: scriptContent.includes('<'),
                hasGt: scriptContent.includes('>'),
                hasAmp: scriptContent.includes('&'),
                hasNewlines: scriptContent.includes('\n'),
                hasTabs: scriptContent.includes('\t')
              })
              
              // 清理和格式化腳本內容
              let cleanedScript = scriptContent
                // 修復缺少分號的問題 
                .replace(/(\w)\s+(const|let|var)\s/g, '$1; $2 ')
                .replace(/(\})\s*(const|let|var|document|window)/g, '$1; $2')
                .replace(/(\w)\s+(document|window)/g, '$1; $2')
                // 確保語句正確分隔
                .replace(/([;}])\s*([a-zA-Z_$])/g, '$1\n$2')
                .trim()
              
              console.log(`🧹 清理後的腳本:`, cleanedScript.substring(0, 200) + '...')
              
              // 直接使用 eval 執行，不再使用 Function 構造函數驗證
              console.log(`✅ 跳過語法驗證，直接執行腳本`)
              eval(cleanedScript)
              console.log(`✅ 腳本 ${index + 1} 執行成功`)
              
            } catch (mainError) {
              console.error(`❌ 腳本 ${index + 1} 執行失敗:`, mainError)
              console.error(`原始腳本內容:`, JSON.stringify(scriptContent))
              
              // 嘗試最基本的執行方式
              try {
                console.log(`🔄 嘗試執行原始腳本...`)
                eval(scriptContent)
                console.log(`✅ 原始腳本執行成功`)
              } catch (fallbackError) {
                console.error(`❌ 所有執行方式都失敗:`, fallbackError)
              }
            }
          } else {
            // 在服務器端環境中，使用 eval
            eval(scriptContent)
          }
          
        } catch (error) {
          console.error(`❌ 腳本 ${index + 1} 執行失敗:`, error)
          console.error('腳本內容:', scriptContent)
          console.error('腳本長度:', scriptContent.length)
          console.error('腳本前50字符:', scriptContent.substring(0, 50))
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
    if (page?.grapesHtml && contentRef.current) {
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
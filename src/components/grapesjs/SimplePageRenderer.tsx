'use client'

import { useEffect, useState, useRef } from 'react'

interface Props {
  htmlContent: string
  cssContent?: string
}

export default function SimplePageRenderer({ htmlContent, cssContent }: Props) {
  const [isClient, setIsClient] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 確保只在客戶端渲染，避免 hydration 問題
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 執行內聯腳本
  useEffect(() => {
    if (!isClient || !containerRef.current || !htmlContent) return

    // 提取並執行 script 標籤
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi
    let match
    const scripts: string[] = []
    
    while ((match = scriptRegex.exec(htmlContent)) !== null) {
      const scriptContent = match[1]
      if (scriptContent && scriptContent.trim()) {
        scripts.push(scriptContent.trim())
      }
    }

    // 延遲執行腳本，確保 DOM 已渲染
    const timer = setTimeout(() => {
      scripts.forEach((scriptContent, index) => {
        try {
          console.log(`🔧 執行頁面腳本 ${index + 1}`)
          eval(scriptContent)
          console.log(`✅ 頁面腳本 ${index + 1} 執行成功`)
        } catch (error) {
          console.error(`❌ 頁面腳本 ${index + 1} 執行失敗:`, error)
        }
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [isClient, htmlContent])

  // 清理 HTML 內容，移除可能導致 hydration 問題的標籤
  const cleanHtmlContent = htmlContent
    // 移除 body 標籤和其他可能的根級標籤
    .replace(/<\/?body[^>]*>/gi, '')
    .replace(/<\/?html[^>]*>/gi, '')
    .replace(/<\/?head[^>]*>/gi, '')
    // 移除可能的 doctype
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .trim()

  // 服務器端渲染時顯示占位符
  if (!isClient) {
    return (
      <div className="grapes-page-content">
        <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
      </div>
    )
  }

  return (
    <div className="grapes-page-content" ref={containerRef}>
      {cssContent && (
        <style dangerouslySetInnerHTML={{ __html: cssContent }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: cleanHtmlContent }} />
    </div>
  )
}
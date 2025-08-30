"use client"

import { NextStudio } from "next-sanity/studio"
import config from "../../../sanity.config"
import { ErrorBoundary } from "react-error-boundary"
import { useEffect } from "react"

function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div role="alert" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Sanity Studio 發生錯誤</h2>
      <p>錯誤訊息：{error.message}</p>
      <button onClick={resetErrorBoundary} style={{ marginRight: '10px' }}>
        重試
      </button>
      <button onClick={() => window.location.reload()}>
        重新載入頁面
      </button>
    </div>
  )
}

export default function StudioPage() {
  // 清理可能存在的 EventSource 連接
  useEffect(() => {
    // 僅開發環境過濾由中止請求引起的無害錯誤日誌（RxJS AbortError 噪音）
    const enableNoiseFilter = process.env.NODE_ENV !== 'production'
    const originalConsoleError = console.error
    let handleRejection: ((e: PromiseRejectionEvent) => void) | null = null

    if (enableNoiseFilter) {
      const errorFilter = (...args: any[]) => {
        try {
          const text = args.map((a) => (a?.stack || a?.message || String(a))).join(" ")
          if (text.includes('AbortError') || text.includes('signal is aborted')) {
            // 靜音這類錯誤
            return
          }
        } catch {}
        originalConsoleError(...args)
      }
      console.error = errorFilter as any

      handleRejection = (e: PromiseRejectionEvent) => {
        const msg = String(e?.reason?.message || e?.reason || '')
        if ((e?.reason?.name === 'AbortError') || msg.includes('signal is aborted')) {
          // 阻止未處理拒絕在控制台噪音
          e.preventDefault()
        }
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('unhandledrejection', handleRejection)
      }
    }

    // 在組件卸載時清理所有可能的連接
    return () => {
      // 還原 console.error / 事件監聽（僅在開發時有安裝）
      console.error = originalConsoleError
      if (enableNoiseFilter && typeof window !== 'undefined' && handleRejection) {
        window.removeEventListener('unhandledrejection', handleRejection)
      }
      // 清理任何可能的 EventSource 連接
      if (typeof window !== 'undefined') {
        // 查找並關閉任何開啟的 EventSource 連接
        const eventSources = (window as any).__sanityEventSources || []
        eventSources.forEach((es: EventSource) => {
          if (es.readyState !== EventSource.CLOSED) {
            es.close()
          }
        })
      }
    }
  }, [])

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('Sanity Studio Error:', error)
      }}
    >
      <NextStudio config={config} />
    </ErrorBoundary>
  )
}

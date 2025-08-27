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
    // 在組件卸載時清理所有可能的連接
    return () => {
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

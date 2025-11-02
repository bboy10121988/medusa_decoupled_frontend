"use client"

import { ErrorBoundary } from "react-error-boundary"
import { useEffect, useState } from "react"
import { NextStudio } from 'next-sanity/studio'

function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div role="alert" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Sanity CMS 發生錯誤</h2>
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

export default function CMSPage() {
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    // console.log('Sanity CMS page loaded')
    
    // 動態導入配置
    import('../../../../sanity.config').then((module) => {
      setConfig(module.default)
    }).catch((error) => {
      // console.error('Failed to load Sanity config:', error)
    })
  }, [])

  if (!config) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>載入 Sanity CMS...</h1>
        <p>正在初始化 CMS 配置</p>
      </div>
    )
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <NextStudio config={config} />
    </ErrorBoundary>
  )
}

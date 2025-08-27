"use client"

import { NextStudio } from "next-sanity/studio"
import config from "../../../../sanity.config"
import { ErrorBoundary } from "react-error-boundary"

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

export default function CMSCatchAllPage() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Sanity CMS Error:', error, errorInfo)
      }}
    >
      <NextStudio config={config} />
    </ErrorBoundary>
  )
}

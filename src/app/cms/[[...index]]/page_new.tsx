"use client"

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

export default function CMSPage() {
  // 暫時禁用 Sanity CMS 以解決建置相容性問題
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Sanity CMS</h1>
      <p>CMS 功能暫時禁用以解決建置相容性問題</p>
      <p>請聯繫開發團隊以重新啟用此功能</p>
    </div>
  )
}

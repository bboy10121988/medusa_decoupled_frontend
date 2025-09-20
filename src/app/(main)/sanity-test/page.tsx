'use client'

import { useState } from 'react'

export default function SanityTestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testAssetsAPI = async () => {
    setLoading(true)
    setResult('')
    
    try {
      console.log('🔍 測試 Sanity Assets API...')
      const response = await fetch('/api/sanity/assets?page=1&pageSize=5')
      const data = await response.json()
      
      if (response.ok) {
        setResult(JSON.stringify(data, null, 2))
        console.log('✅ API 回應:', data)
      } else {
        setResult(`❌ API 錯誤 (${response.status}): ${JSON.stringify(data, null, 2)}`)
        console.error('API 錯誤:', data)
      }
    } catch (error) {
      const errorMsg = `❌ 網路錯誤: ${error}`
      setResult(errorMsg)
      console.error('網路錯誤:', error)
    } finally {
      setLoading(false)
    }
  }

  const testUploadAPI = async () => {
    setLoading(true)
    setResult('')
    
    try {
      console.log('🔍 測試上傳權限...')
      // 創建一個小的測試圖片
      const canvas = document.createElement('canvas')
      canvas.width = 10
      canvas.height = 10
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 0, 10, 10)
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png')
      })
      
      const formData = new FormData()
      formData.append('file', blob, 'test.png')
      
      const response = await fetch('/api/sanity/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ 上傳成功: ${JSON.stringify(data, null, 2)}`)
        console.log('✅ 上傳成功:', data)
      } else {
        setResult(`❌ 上傳失敗 (${response.status}): ${JSON.stringify(data, null, 2)}`)
        console.error('上傳失敗:', data)
      }
    } catch (error) {
      const errorMsg = `❌ 上傳錯誤: ${error}`
      setResult(errorMsg)
      console.error('上傳錯誤:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Sanity 連接測試</h1>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={testAssetsAPI}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '測試中...' : '測試圖片列表 API'}
        </button>
        
        <button 
          onClick={testUploadAPI}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '測試中...' : '測試上傳權限'}
        </button>
      </div>

      {result && (
        <div>
          <h2>測試結果</h2>
          <pre style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '6px',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '0.9rem',
            whiteSpace: 'pre-wrap'
          }}>
            {result}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
        <h3>環境變數檢查</h3>
        <ul style={{ margin: 0 }}>
          <li><strong>專案 ID:</strong> {process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '❌ 未設定'}</li>
          <li><strong>Dataset:</strong> {process.env.NEXT_PUBLIC_SANITY_DATASET || '❌ 未設定'}</li>
          <li><strong>API 版本:</strong> {process.env.NEXT_PUBLIC_SANITY_API_VERSION || '❌ 未設定'}</li>
        </ul>
      </div>
    </div>
  )
}
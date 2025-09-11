import React, { useEffect, useRef } from 'react'
import { ObjectInputProps } from 'sanity'

interface GrapesJSEditorProps extends ObjectInputProps {
  // 移除 value 覆寫，使用父類的定義
}

const GrapesJSEditorComponent: React.FC<GrapesJSEditorProps> = (props) => {
  const { onChange, value } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string>('')

  useEffect(() => {
    const initializeEditor = async () => {
      if (!containerRef.current) return

      try {
        // 動態載入 ReactStudioEditor 組件
        const { default: StudioEditor } = await import('@grapesjs/studio-sdk/react')
        const React = await import('react')
        const ReactDOM = await import('react-dom/client')
        
        // 動態載入樣式
        await import('@grapesjs/studio-sdk/style')
        
        // 創建 React 根元素並渲染編輯器
        const root = ReactDOM.createRoot(containerRef.current)
        
        root.render(
          React.createElement(StudioEditor, {
            options: {
              licenseKey: 'demo',
              project: {
                type: 'web',
                default: {
                  pages: [
                    { 
                      name: 'Page', 
                      component: value?.html || '<h1 style="color: #333;">開始編輯你的頁面</h1><p>從左側拖拉組件到這裡開始設計</p>' 
                    }
                  ]
                }
              }
            }
          })
        )
        
        setIsLoading(false)
        console.log('GrapesJS Studio SDK 編輯器載入完成')

      } catch (error) {
        console.error('載入 GrapesJS Studio SDK 失敗:', error)
        setError(error instanceof Error ? error.message : '未知錯誤')
        setIsLoading(false)
      }
    }

    initializeEditor()
  }, [value])

  if (error) {
    return (
      <div style={{
        padding: '20px',
        border: '1px solid #e74c3c',
        borderRadius: '4px',
        backgroundColor: '#fdf2f2',
        color: '#e74c3c',
        textAlign: 'center'
      }}>
        <h3>編輯器載入失敗</h3>
        <p>錯誤: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          重新載入
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{
          display: 'inline-block',
          width: '20px',
          height: '20px',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '10px'
        }} />
        <p>正在載入 GrapesJS 頁面編輯器...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', minHeight: '600px' }}>
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '600px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#fff'
        }}
      />
      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px', fontSize: '14px' }}>
        <strong>💡 使用說明:</strong>
        <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
          <li>從左側面板拖拉組件到編輯區域</li>
          <li>點擊組件進行編輯</li>
          <li>使用右側面板調整樣式</li>
          <li>編輯完成後記得保存文檔</li>
        </ul>
      </div>
    </div>
  )
}

export default GrapesJSEditorComponent

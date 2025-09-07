"use client"

import React, { useEffect, useRef, useState } from 'react'

const MinimalGrapesJSEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initStep, setInitStep] = useState('開始初始化...')

  useEffect(() => {
    const initializeEditor = async () => {
      try {
        setInitStep('檢查容器元素...')
        
        // 確保容器元素存在
        if (!editorRef.current) {
          throw new Error('編輯器容器未找到')
        }

        setInitStep('載入 GrapesJS...')
        
        // 動態載入 GrapesJS
        const { default: grapesjs } = await import('grapesjs')
        
        setInitStep('載入基本區塊插件...')
        
        // 載入基本插件
        const { default: blocksBasic } = await import('grapesjs-blocks-basic')
        
        setInitStep('初始化編輯器...')
        
        // 等待一點時間確保 DOM 完全準備好
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 再次檢查容器
        if (!editorRef.current) {
          throw new Error('編輯器容器在初始化時丟失')
        }

        console.log('🔍 容器元素:', editorRef.current)
        console.log('🔍 容器 ID:', editorRef.current.id)
        
        // 創建編輯器
        const editorInstance = grapesjs.init({
          container: editorRef.current,
          height: '600px',
          width: 'auto',
          
          // 禁用存儲以避免衝突
          storageManager: false,
          
          // 使用基本插件
          plugins: [blocksBasic],
          
          pluginsOpts: {
            'grapesjs-blocks-basic': {
              blocks: ['column1', 'column2', 'text', 'link', 'image'],
              flexGrid: true
            }
          },
          
          // 簡單的區塊管理器
          blockManager: {
            appendTo: '#blocks-panel',
            blocks: [
              {
                id: 'text-block',
                label: '文字',
                content: '<div>插入你的文字</div>',
                category: '基本'
              },
              {
                id: 'image-block',
                label: '圖片',
                content: '<img src="https://via.placeholder.com/300x200" alt="placeholder">',
                category: '基本'
              }
            ]
          },
          
          // 簡單的面板設置
          panels: {
            defaults: []
          },
          
          // 默認內容
          components: `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
              <h1>歡迎使用 GrapesJS</h1>
              <p>這是一個簡單的編輯器實例。</p>
              <p>你可以編輯這些內容或從左側拖拽新的元素。</p>
            </div>
          `,
          
          style: `
            body { margin: 0; font-family: Arial, sans-serif; }
            h1 { color: #333; }
            p { color: #666; line-height: 1.6; }
          `
        })

        setInitStep('編輯器初始化完成')
        
        // 監聽載入事件
        editorInstance.on('load', () => {
          console.log('✅ GrapesJS 編輯器載入完成')
          setIsLoading(false)
          setEditor(editorInstance)
        })

        // 監聽錯誤事件
        editorInstance.on('error', (err: any) => {
          console.error('❌ GrapesJS 錯誤:', err)
          setError(`編輯器錯誤: ${err.message || err}`)
        })

      } catch (error) {
        console.error('❌ 初始化失敗:', error)
        setError(error instanceof Error ? error.message : '未知錯誤')
        setIsLoading(false)
      }
    }

    // 延遲一點時間確保組件完全掛載
    const timer = setTimeout(initializeEditor, 200)
    
    return () => {
      clearTimeout(timer)
      if (editor) {
        try {
          editor.destroy()
        } catch (e) {
          console.warn('清理編輯器時出錯:', e)
        }
      }
    }
  }, [])

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: '#fee', 
        border: '1px solid #fcc',
        borderRadius: '4px',
        margin: '20px'
      }}>
        <h2 style={{ color: '#c33' }}>編輯器載入失敗</h2>
        <p style={{ color: '#666' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007cba',
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
        backgroundColor: '#f9f9f9',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007cba',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>正在載入編輯器...</h2>
        <p style={{ color: '#666' }}>{initStep}</p>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 頂部工具欄 */}
      <div style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>GrapesJS 編輯器</h1>
        <div>
          <button
            onClick={() => {
              if (editor) {
                const html = editor.getHtml()
                const css = editor.getCss()
                console.log('HTML:', html)
                console.log('CSS:', css)
                alert('代碼已輸出到控制台')
              }
            }}
            style={{
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            獲取代碼
          </button>
        </div>
      </div>

      {/* 主要編輯區域 */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* 左側區塊面板 */}
        <div style={{
          width: '200px',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #ddd',
          padding: '10px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>區塊</h3>
          <div id="blocks-panel"></div>
        </div>

        {/* 中央編輯器 */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div 
            ref={editorRef}
            id="gjs-editor"
            style={{ 
              height: '100%', 
              width: '100%',
              backgroundColor: 'white'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default MinimalGrapesJSEditor

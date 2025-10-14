import React, { useCallback, useEffect, useRef } from 'react'
import { set } from 'sanity'

// GrapesJS 編輯器輸入組件
const GrapesJSInput = React.forwardRef<any, any>((props, ref) => {
  const { elementProps, onChange, value = {} } = props
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<any>(null)

  const { html = '', css = '', components = '[]' } = value

  // 初始化編輯器
  useEffect(() => {
    let mounted = true

    const initEditor = async () => {
      try {
        if (!mounted || !editorRef.current) return

        const grapesjs = (await import('grapesjs')).default

        console.log('正在初始化 Sanity GrapesJS 編輯器...')

        editorInstance.current = grapesjs.init({
          container: editorRef.current,
          height: '600px',
          width: '100%',
          storageManager: false,
          components: html || `
            <div style="padding: 20px; text-align: center;">
              <h1>開始設計您的頁面</h1>
              <p>從左側拖拽元件到這裡</p>
            </div>
          `,
          style: css || '',
          blockManager: {
            appendTo: '.blocks-container',
          },
          styleManager: {
            appendTo: '.styles-container',
          },
          layerManager: {
            appendTo: '.layers-container',
          },
        })

        // 添加基本元件
        const blockManager = editorInstance.current.BlockManager

        blockManager.add('text', {
          label: '文字',
          content: '<div class="text-block">輸入您的文字</div>',
          category: '基本元素',
        })

        blockManager.add('image', {
          label: '圖片',
          content: '<img src="https://via.placeholder.com/300x200" alt="圖片" style="max-width: 100%;">',
          category: '基本元素',
        })

        blockManager.add('button', {
          label: '按鈕',
          content: '<button class="btn">點擊按鈕</button>',
          category: '基本元素',
        })

        blockManager.add('section', {
          label: '區塊',
          content: '<section class="section"><div class="container"><h2>標題</h2><p>內容</p></div></section>',
          category: '佈局',
        })

        // 監聽變更並儲存到 Sanity
        editorInstance.current.on('component:update', () => {
          saveToSanity()
        })

        console.log('Sanity GrapesJS 編輯器初始化成功')

      } catch (error) {
        console.error('Sanity GrapesJS 編輯器初始化失敗:', error)
      }
    }

    const timer = setTimeout(initEditor, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (editorInstance.current) {
        try {
          editorInstance.current.destroy()
        } catch (e) {
          console.warn('編輯器銷毀時發生錯誤:', e)
        }
      }
    }
  }, [])

  // 儲存到 Sanity
  const saveToSanity = useCallback(() => {
    if (!editorInstance.current) return

    try {
      const editor = editorInstance.current
      const html = editor.getHtml()
      const css = editor.getCss()
      const components = JSON.stringify(editor.getComponents())

      onChange([
        set({ html, css, components }, [])
      ])

    } catch (error) {
      console.error('儲存到 Sanity 時發生錯誤:', error)
    }
  }, [onChange])

  // 手動儲存按鈕
  const handleSave = useCallback(() => {
    saveToSanity()
  }, [saveToSanity])

  return (
    <div className="grapesjs-sanity-editor">
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">GrapesJS 視覺編輯器</h3>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            儲存變更
          </button>
        </div>
        <p className="text-sm text-gray-600">使用拖拽方式設計您的頁面，變更會自動儲存到 Sanity</p>
      </div>

      <div className="grapesjs-editor-wrapper border border-gray-300 rounded-lg overflow-hidden">
        <div className="flex h-96">
          {/* 左側元件面板 */}
          <div className="w-64 bg-white border-r border-gray-200">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">元件庫</h4>
              <div className="blocks-container"></div>
            </div>
          </div>

          {/* 中間編輯區域 */}
          <div className="flex-1 bg-gray-100">
            <div ref={editorRef} className="w-full h-full"></div>
          </div>

          {/* 右側樣式面板 */}
          <div className="w-64 bg-white border-l border-gray-200">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">樣式設定</h4>
              <div className="styles-container mb-4"></div>
              <h4 className="font-medium text-gray-900 mb-3">圖層</h4>
              <div className="layers-container"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 顯示當前儲存的資料（除錯用） */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600">顯示儲存的資料（開發模式）</summary>
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <div><strong>HTML:</strong> {html.substring(0, 100)}...</div>
            <div><strong>CSS:</strong> {css.substring(0, 100)}...</div>
            <div><strong>Components:</strong> {components.substring(0, 100)}...</div>
          </div>
        </details>
      )}
    </div>
  )
})

GrapesJSInput.displayName = 'GrapesJSInput'

export default GrapesJSInput

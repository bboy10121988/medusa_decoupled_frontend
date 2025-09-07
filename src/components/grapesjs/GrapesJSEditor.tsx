"use client"

import React, { useEffect, useRef, useState } from 'react'
import type { Editor } from 'grapesjs'

// 動態導入 GrapesJS 及其插件
interface GrapesJSEditorProps {
  onEditorReady?: (editor: Editor) => void
}

const GrapesJSEditor: React.FC<GrapesJSEditorProps> = ({ onEditorReady }) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeEditor = async () => {
      try {
        setIsLoading(true)
        
        // 動態導入 GrapesJS 和基本插件
        const [
          { default: grapesjs },
          { default: blocksBasic }
        ] = await Promise.all([
          import('grapesjs'),
          import('grapesjs-blocks-basic')
        ])

        if (!editorRef.current) return

        // 初始化編輯器
        const editorInstance = grapesjs.init({
          container: editorRef.current,
          height: '100vh',
          width: 'auto',
          
          // 存儲設置
          storageManager: {
            type: 'local',
            autosave: true,
            autoload: true,
            stepsBeforeSave: 1
          },

          // 插件配置
          plugins: [blocksBasic],
          
          pluginsOpts: {
            'grapesjs-blocks-basic': { 
              flexGrid: true,
              blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video']
            }
          },

          // 畫布設置
          canvas: {
            styles: [
              'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'
            ]
          },

          // 區塊管理器配置
          blockManager: {
            appendTo: '#blocks',
            blocks: [
              {
                id: 'section',
                label: '<b>Section</b>',
                attributes: { class: 'gjs-block-section' },
                content: `<section>
                  <h1>Insert title here</h1>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </section>`
              },
              {
                id: 'text',
                label: 'Text',
                content: '<div data-gjs-type="text">Insert your text here</div>',
              },
              {
                id: 'image',
                label: 'Image',
                select: true,
                content: { type: 'image' },
                activate: true,
              }
            ]
          },

          // 圖層管理器
          layerManager: {
            appendTo: '#layers'
          },

          // 樣式管理器
          styleManager: {
            appendTo: '#styles',
            sectors: [
              {
                name: 'Dimension',
                open: false,
                buildProps: ['width', 'min-height', 'padding'],
                properties: [
                  {
                    type: 'integer',
                    name: 'The width',
                    property: 'width',
                    units: ['px', '%'],
                    defaults: 'auto',
                    min: 0,
                  }
                ]
              },
              {
                name: 'Extra',
                open: false,
                buildProps: ['background-color', 'box-shadow', 'custom-prop'],
                properties: [
                  {
                    id: 'custom-prop',
                    name: 'Custom Label',
                    property: 'font-size',
                    type: 'select',
                    defaults: '32px',
                    options: [
                      { id: '12px', value: '12px', name: 'Tiny' },
                      { id: '18px', value: '18px', name: 'Medium' },
                      { id: '32px', value: '32px', name: 'Big' },
                    ],
                  }
                ]
              }
            ]
          },

          // 屬性管理器
          traitManager: {
            appendTo: '#traits'
          },

          // 面板設置
          panels: {
            defaults: [
              {
                id: 'layers',
                el: '.panel__right',
                resizable: {
                  maxDim: 350,
                  minDim: 200,
                  tc: false,
                  cl: true,
                  cr: false,
                  bc: false,
                  keyWidth: 'flex-basis',
                },
              },
              {
                id: 'panel-switcher',
                el: '.panel__switcher',
                buttons: [
                  {
                    id: 'show-layers',
                    active: true,
                    label: 'Layers',
                    command: 'show-layers',
                    togglable: false,
                  },
                  {
                    id: 'show-style',
                    active: true,
                    label: 'Styles',
                    command: 'show-styles',
                    togglable: false,
                  },
                  {
                    id: 'show-traits',
                    active: true,
                    label: 'Traits',
                    command: 'show-traits',
                    togglable: false,
                  }
                ],
              },
              {
                id: 'panel-devices',
                el: '.panel__devices',
                buttons: [
                  {
                    id: 'device-desktop',
                    label: 'Desktop',
                    command: 'set-device-desktop',
                    active: true,
                    togglable: false,
                  },
                  {
                    id: 'device-mobile',
                    label: 'Mobile',
                    command: 'set-device-mobile',
                    togglable: false,
                  }
                ],
              }
            ]
          },

          // 設備管理器
          deviceManager: {
            devices: [
              {
                name: 'Desktop',
                width: '',
              },
              {
                name: 'Mobile',
                width: '320px',
                widthMedia: '480px',
              }
            ]
          },

          // 默認內容
          components: `
            <div style="margin: 100px 50px; padding: 25px; font-family: Helvetica, serif">
              <h1>歡迎使用 GrapesJS 編輯器</h1>
              <p>這是一個完整功能的視覺化網頁編輯器，整合了 Sanity CMS。</p>
              <div style="padding: 25px; margin-top: 50px; background-color: #ededed">
                <p>你可以從左側的區塊面板拖拽元素到這裡</p>
                <p>使用右側的面板來編輯樣式和屬性</p>
              </div>
            </div>
          `,

          style: `
            * { box-sizing: border-box; }
            body { margin: 0; }
            .gjs-block-section { 
              background-color: #f7f8fc; 
              padding: 10px; 
              margin-bottom: 10px; 
            }
          `
        })

        // 添加自定義命令
        editorInstance.Commands.add('set-device-desktop', {
          run: (editor) => editor.setDevice('Desktop')
        })

        editorInstance.Commands.add('set-device-mobile', {
          run: (editor) => editor.setDevice('Mobile')
        })

        editorInstance.Commands.add('show-layers', {
          run: () => {
            const layerContainer = document.getElementById('layers')
            if (layerContainer) layerContainer.style.display = 'block'
          }
        })

        editorInstance.Commands.add('show-styles', {
          run: () => {
            const styleContainer = document.getElementById('styles')
            if (styleContainer) styleContainer.style.display = 'block'
          }
        })

        editorInstance.Commands.add('show-traits', {
          run: () => {
            const traitContainer = document.getElementById('traits')
            if (traitContainer) traitContainer.style.display = 'block'
          }
        })

        // 監聽編輯器事件
        editorInstance.on('load', () => {
          console.log('✅ GrapesJS 編輯器載入完成')
          setIsLoading(false)
          
          // 通知父組件編輯器已準備好
          if (onEditorReady) {
            onEditorReady(editorInstance)
          }
        })

        editorInstance.on('storage:error', (err) => {
          console.error('❌ 存儲錯誤:', err)
        })

        setEditor(editorInstance)

      } catch (error) {
        console.error('❌ GrapesJS 初始化失敗:', error)
        setError(error instanceof Error ? error.message : '未知錯誤')
        setIsLoading(false)
      }
    }

    initializeEditor()

    // 清理函數
    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [onEditorReady])

  if (error) {
    return (
      <div className="error-container">
        <h2>編輯器載入失敗</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>重新載入</button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>正在載入 GrapesJS 編輯器...</h2>
        <p>請稍候，編輯器正在初始化中...</p>
      </div>
    )
  }

  return (
    <div className="gjs-editor-container">
      {/* 頂部工具欄 */}
      <div className="panel__top">
        <div className="panel__basic-actions"></div>
        <div className="panel__devices"></div>
        <div className="panel__switcher"></div>
      </div>

      {/* 主要編輯區域 */}
      <div className="editor-row">
        {/* 左側面板 */}
        <div className="panel__left">
          <div className="panel-title">區塊</div>
          <div id="blocks"></div>
        </div>

        {/* 中央畫布 */}
        <div className="editor-canvas">
          <div ref={editorRef} className="gjs-editor"></div>
        </div>

        {/* 右側面板 */}
        <div className="panel__right">
          <div className="layers-container">
            <div className="panel-title">圖層</div>
            <div id="layers"></div>
          </div>
          <div className="styles-container">
            <div className="panel-title">樣式</div>
            <div id="styles"></div>
          </div>
          <div className="traits-container">
            <div className="panel-title">屬性</div>
            <div id="traits"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .gjs-editor-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .panel__top {
          height: 40px;
          background: #444;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
        }

        .panel__devices button,
        .panel__switcher button {
          background: #555;
          color: white;
          border: none;
          padding: 5px 10px;
          margin: 0 2px;
          cursor: pointer;
          border-radius: 3px;
        }

        .panel__devices button:hover,
        .panel__switcher button:hover {
          background: #666;
        }

        .panel__devices button.gjs-pn-active,
        .panel__switcher button.gjs-pn-active {
          background: #007cba;
        }

        .editor-row {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .panel__left {
          width: 230px;
          background: #f8f8f8;
          border-right: 1px solid #ddd;
          overflow-y: auto;
        }

        .panel__right {
          width: 230px;
          background: #f8f8f8;
          border-left: 1px solid #ddd;
          overflow-y: auto;
        }

        .editor-canvas {
          flex: 1;
          position: relative;
        }

        .gjs-editor {
          height: 100%;
          width: 100%;
        }

        .panel-title {
          background: #ddd;
          padding: 8px 10px;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          border-bottom: 1px solid #ccc;
        }

        #blocks,
        #layers,
        #styles,
        #traits {
          padding: 10px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #f5f5f5;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007cba;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #f5f5f5;
          color: #d32f2f;
        }

        .error-container button {
          background: #007cba;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
        }

        .error-container button:hover {
          background: #005a8b;
        }

        /* GrapesJS 覆蓋樣式 */
        :global(.gjs-pn-panel) {
          background: transparent ;
        }

        :global(.gjs-block) {
          background: white;
          border: 1px solid #ddd;
          border-radius: 3px;
          margin-bottom: 5px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        :global(.gjs-block:hover) {
          border-color: #007cba;
          box-shadow: 0 2px 4px rgba(0,124,186,0.2);
        }

        :global(.gjs-frame) {
          border: none ;
        }

        :global(.gjs-cv-canvas) {
          background: white;
        }
      `}</style>
    </div>
  )
}

export default GrapesJSEditor

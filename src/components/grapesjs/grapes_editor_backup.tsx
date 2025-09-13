'use client'

import { useEffect, useRef, useState } from 'react'
import { grapesJSPageService, type GrapesJSPageData, type SavePageParams, type UpdatePageParams } from '@/lib/services/grapesjs-page-service'
import 'grapesjs/dist/css/grapes.min.css'
import './grapes-editor.css'

interface GrapesEditorProps {
  onSave?: (content: string) => void
}

interface GrapesEditorProps {
  onSave?: (content: string) => void
}

// 使用 Sanity 服務，不再需要本地 API
export default function GrapesEditor({ onSave }: GrapesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<any>(null)
  const [pages, setPages] = useState<GrapesJSPageData[]>([])
  const [currentPageId, setCurrentPageId] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<GrapesJSPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [workspaceVisible, setWorkspaceVisible] = useState(false)

  // 載入頁面列表
  const loadPages = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 開始載入 Sanity 頁面...')
      
      const loadedPages = await grapesJSPageService.getAllPages()
      console.log('📄 載入的頁面數量:', loadedPages.length)
      console.log('📄 頁面列表:', loadedPages)
      
      setPages(loadedPages)
      
      // 如果沒有頁面，創建一個默認首頁
      if (loadedPages.length === 0) {
        console.log('沒有找到頁面，嘗試創建默認首頁...')
        
        const defaultPageParams: SavePageParams = {
          title: '首頁',
          slug: 'home',
          description: '使用 GrapesJS 編輯器創建的首頁',
          status: 'draft',
          grapesHtml: '<div><h1>歡迎來到首頁</h1><p>這是使用 GrapesJS 編輯器創建的頁面。</p></div>',
          grapesCss: '',
          grapesComponents: {},
          grapesStyles: {},
          homeModules: []
        }
        
        try {
          const newPage = await grapesJSPageService.createPage(defaultPageParams)
          if (newPage) {
            const updatedPages = await grapesJSPageService.getAllPages()
            setPages(updatedPages)
            setCurrentPage(newPage)
            setCurrentPageId(newPage._id!)
          }
        } catch (createError: any) {
          console.error('創建默認頁面失敗:', createError)
          
          // 顯示友善的錯誤訊息
          if (createError.message?.includes('需要 Sanity 寫入權限') || 
              createError.message?.includes('Sanity 寫入權限不足')) {
            alert('⚠️ 需要設定 Sanity Token\n\n' + createError.message)
          } else {
            alert('創建默認頁面失敗: ' + createError.message)
          }
        }
      } else {
        // 載入第一個頁面作為當前頁面
        const firstPage = loadedPages[0]
        setCurrentPage(firstPage)
        setCurrentPageId(firstPage._id!)
      }
    } catch (error) {
      console.error('載入頁面失敗:', error)
      
      // 即使載入失敗也要停止 loading 狀態
      // 這樣用戶可以使用編輯器的其他功能
    } finally {
      setIsLoading(false)
    }
  }

  // 載入頁面內容到編輯器
  const loadPageToEditor = async (pageId: string, editor: any) => {
    try {
      const pageData = await grapesJSPageService.getPageById(pageId)
      if (pageData) {
        setCurrentPage(pageData)
        
        editor.setComponents(pageData.grapesHtml || '')
        editor.setStyle(pageData.grapesCss || '')
        
        // 如果有 components 和 styles 數據，則使用它們
        if (pageData.grapesComponents) {
          const projectData: any = {
            assets: [],
            styles: [],
            pages: []
          }

          if (pageData.grapesStyles) {
            try {
              projectData.styles = typeof pageData.grapesStyles === 'string' 
                ? JSON.parse(pageData.grapesStyles) 
                : pageData.grapesStyles
            } catch (e) {
              console.warn('Failed to parse grapesStyles:', e)
            }
          }

          try {
            const components = typeof pageData.grapesComponents === 'string'
              ? JSON.parse(pageData.grapesComponents)
              : pageData.grapesComponents
            
            projectData.pages = [{
              frames: [{
                component: components
              }]
            }]
          } catch (e) {
            console.warn('Failed to parse grapesComponents:', e)
          }

          editor.loadProjectData(projectData)
        }
        
        console.log('頁面載入成功:', pageData.title)
      }
    } catch (error) {
      console.error('載入頁面到編輯器失敗:', error)
    }
  }

  // 保存當前頁面
  const saveCurrentPage = async (editor: any) => {
    if (!currentPageId || !currentPage) return false
    
    try {
      const html = editor.getHtml()
      const css = editor.getCss()
      const components = editor.getComponents()
      const styles = editor.getStyles()
      
      const updateParams: UpdatePageParams = {
        _id: currentPage._id!,
        grapesHtml: html,
        grapesCss: css,
        grapesComponents: components,
        grapesStyles: styles
      }

      const updatedPage = await grapesJSPageService.updatePage(updateParams)
      setCurrentPage(updatedPage)
      
      // 重新載入頁面列表
      await loadPages()
      
      if (onSave) {
        onSave(html)
      }
      
      console.log('頁面保存成功')
      return true
    } catch (error) {
      console.error('保存頁面失敗:', error)
      return false
    }
  }

  // 初始載入頁面列表
  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    if (!editorRef.current || editorInstance.current || isLoading) return

    // 動態導入所有依賴
    const initEditor = async () => {
      try {
        const grapesjs = (await import('grapesjs')).default
        const pluginWebpage = (await import('grapesjs-preset-webpage')).default
        const pluginBlocksBasic = (await import('grapesjs-blocks-basic')).default
        const pluginForms = (await import('grapesjs-plugin-forms')).default
        const pluginCountdown = (await import('grapesjs-component-countdown')).default
        const pluginTabs = (await import('grapesjs-tabs')).default
        const pluginCustomCode = (await import('grapesjs-custom-code')).default
        const pluginTooltip = (await import('grapesjs-tooltip')).default
        const pluginTyped = (await import('grapesjs-typed')).default
        const enhancedHomeModulesPlugin = (await import('./plugins/enhanced-home-modules')).default
        const addBootstrapComponents = (await import('./bootstrap-components-simple')).default

        console.log('所有插件載入完成')

        // 確保容器存在且有效
        if (!editorRef.current) {
          console.error('編輯器容器不存在')
          return
        }

        // 強制清理容器和防止 React 衝突
        const container = editorRef.current
        
        // 添加標記告訴 React 不要管理此節點
        container.setAttribute('data-grapesjs-managed', 'true')
        
        // 停止 React 對此容器的管理，使用更安全的清理方式
        try {
          // 使用較溫和的清理方法
          container.textContent = ''
          // 等待一個微任務週期確保清理完成
          await new Promise<void>(resolve => queueMicrotask(() => resolve()))
        } catch (error) {
          console.warn('清理容器時出現錯誤:', error)
          // 如果出錯，至少嘗試設置為空
          container.innerHTML = ''
        }

        // 初始化 GrapesJS 編輯器
        const editor = grapesjs.init({
          container: editorRef.current!,
          fromElement: false, // 關鍵：不從元素內容初始化，避免與 React 衝突
          height: '100vh',
          width: 'auto',
          
          // 避免 DOM 衝突的配置
          avoidInlineStyle: false,
          
          // 不使用本地儲存，改用 API
          storageManager: {
            type: 'none'
          },

        // Device Manager 配置
        deviceManager: {
          devices: [
            {
              name: 'Desktop',
              width: '',
              widthMedia: '1024px'
            },
            {
              name: 'Tablet',
              width: '768px',
              widthMedia: '768px'
            },
            {
              name: 'Mobile',
              width: '320px',
              widthMedia: '480px'
            }
          ]
        },

        // Canvas 配置
        canvas: {
          styles: [
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            'data:text/css;base64,' + btoa(`
              /* Global responsive styles - ensure all blocks are full-width responsive */
              
              /* Responsive images */
              img {
                max-width: 100% !important;
                height: auto !important;
                width: 100% !important;
                display: block !important;
              }
              
              /* Responsive containers and blocks */
              div, section, article, aside, header, footer, nav {
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
              
              /* Responsive text blocks */
              p, h1, h2, h3, h4, h5, h6, span, a {
                max-width: 100% !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
              }
              
              /* Responsive tables */
              table {
                width: 100% !important;
                max-width: 100% !important;
                table-layout: auto !important;
              }
              
              /* Responsive media elements */
              video, audio, iframe {
                max-width: 100% !important;
                width: 100% !important;
                height: auto !important;
              }
              
              /* Responsive form elements */
              input, textarea, select, button {
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
              
              /* Enhanced Bootstrap components */
              .card, .alert, .modal, .carousel, .accordion {
                max-width: 100% !important;
                width: 100% !important;
              }
              
              /* Responsive custom components */
              [data-gjs-type] {
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
              
              /* Ensure all new elements are responsive */
              * {
                box-sizing: border-box !important;
              }
              
              /* Mobile device specific styles */
              @media (max-width: 768px) {
                img, div, section, article {
                  width: 100% !important;
                  margin-left: 0 !important;
                  margin-right: 0 !important;
                }
              }
            `)
          ],
          scripts: [
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js'
          ]
        },
        
        // 插件
        plugins: [
          pluginWebpage,
          pluginBlocksBasic,
          pluginForms,
          pluginCountdown,
          pluginTabs,
          pluginCustomCode,
          pluginTooltip,
          pluginTyped,
          enhancedHomeModulesPlugin
        ],

        // 插件選項
        pluginsOpts: {
          'grapesjs-preset-webpage': {
            modalImportTitle: 'Import Template',
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
            modalImportContent: function(editor: any) {
              return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
            },
            importViewerOptions: {
              enableImport: true
            }
          }
        }
      })

      // 載入 Bootstrap 組件
      addBootstrapComponents(editor)

      // 自定義響應式區塊設定
      const setupResponsiveBlocks = () => {
        // 覆蓋預設圖片組件樣式
        editor.DomComponents.addType('image', {
          model: {
            defaults: {
              tagName: 'img',
              attributes: {
                style: 'width: 100%; max-width: 100%; height: auto; display: block;'
              },
              traits: [
                'alt',
                'src',
                {
                  type: 'text',
                  label: 'Width',
                  name: 'width',
                  changeProp: true
                },
                {
                  type: 'text', 
                  label: 'Height',
                  name: 'height',
                  changeProp: true
                }
              ]
            }
          }
        })

        // 覆蓋預設文字組件樣式
        editor.DomComponents.addType('text', {
          model: {
            defaults: {
              tagName: 'div',
              attributes: {
                style: 'width: 100%; max-width: 100%; box-sizing: border-box;'
              }
            }
          }
        })

        // 覆蓋預設容器組件樣式
        editor.DomComponents.addType('default', {
          model: {
            defaults: {
              attributes: {
                style: 'width: 100%; max-width: 100%; box-sizing: border-box;'
              }
            }
          }
        })

        // Add custom responsive image block
        editor.BlockManager.add('responsive-image', {
          label: 'Responsive Image',
          category: 'Basic Elements',
          content: {
            type: 'image',
            style: {
              'width': '100%',
              'max-width': '100%',
              'height': 'auto',
              'display': 'block'
            },
            attributes: {
              src: 'https://via.placeholder.com/800x400/cccccc/969696?text=Responsive+Image',
              alt: 'Responsive Image'
            }
          }
        })

        // Add responsive container block
        editor.BlockManager.add('responsive-container', {
          label: 'Responsive Container',
          category: 'Basic Elements', 
          content: `
            <div style="width: 100%; max-width: 100%; padding: 20px; box-sizing: border-box; border: 2px dashed #ccc;">
              <p>Responsive Container - Add content here</p>
            </div>
          `
        })
      }

      // 設定響應式區塊
      setupResponsiveBlocks()

      // 監聽組件添加事件，自動應用響應式樣式
      editor.on('component:add', (component: any) => {
        const type = component.get('type')
        const tagName = component.get('tagName')
        
        // 自動為圖片添加響應式樣式
        if (type === 'image' || tagName === 'img') {
          component.addStyle({
            'width': '100%',
            'max-width': '100%',
            'height': 'auto',
            'display': 'block'
          })
        }
        
        // 自動為容器元素添加響應式樣式
        if (['div', 'section', 'article', 'header', 'footer'].includes(tagName)) {
          component.addStyle({
            'max-width': '100%',
            'box-sizing': 'border-box'
          })
        }
        
        // 自動為文字元素添加響應式樣式
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'].includes(tagName)) {
          component.addStyle({
            'max-width': '100%',
            'word-wrap': 'break-word',
            'overflow-wrap': 'break-word'
          })
        }
      })

      // 添加工具列按鈕
      editor.Panels.addPanel({
        id: 'panel-top',
        el: '.panel__top'
      })

      editor.Panels.addButton('options', [
        {
          id: 'save-btn',
          className: 'btn-save',
          label: '💾',
          command: 'save-content',
          attributes: { title: 'Save Content (Ctrl+S)' }
        },
        {
          id: 'preview-btn',
          className: 'btn-preview',
          label: '👁️',
          command: 'preview-page',
          attributes: { title: 'Preview Page' }
        },
        {
          id: 'publish-btn',
          className: 'btn-publish',
          label: '🚀',
          command: 'publish-page',
          attributes: { title: 'Publish Page' }
        }
      ])

      // 保存命令
      editor.Commands.add('save-content', {
        run: async (editor: any) => {
          const success = await saveCurrentPage(editor)
          if (success) {
            alert('頁面已保存成功！')
          } else {
            alert('保存失敗，請重試。')
          }
        }
      })

      // 預覽命令
      editor.Commands.add('preview-page', {
        run: async (editor: any) => {
          if (!currentPageId) {
            alert('請先選擇或創建一個頁面')
            return
          }
          
          // 先保存當前內容
          const success = await saveCurrentPage(editor)
          if (success) {
            // 在新視窗中打開預覽
            const previewUrl = `/preview/${currentPageId}`
            window.open(previewUrl, '_blank')
          } else {
            alert('保存失敗，無法預覽')
          }
        }
      })

      // 發布命令
      editor.Commands.add('publish-page', {
        run: async (editor: any) => {
          if (!currentPageId || !currentPage) {
            alert('請先選擇或創建一個頁面')
            return
          }
          
          const confirmed = confirm('確定要發布這個頁面嗎？發布後將在前端網站中可見。')
          if (!confirmed) return
          
          try {
            // 先保存當前內容
            await saveCurrentPage(editor)
            
            // 然後發布頁面
            const updateParams = {
              _id: currentPage._id!,
              status: 'published' as const
            }
            
            const updatedPage = await grapesJSPageService.updatePage(updateParams)
            setCurrentPage(updatedPage)
            
            alert('頁面已發布成功！')
            
            // 提供查看已發布頁面的選項
            const viewPublished = confirm('要在新視窗中查看已發布的頁面嗎？')
            if (viewPublished) {
              const publishedUrl = `/pages/${updatedPage.slug.current}`
              window.open(publishedUrl, '_blank')
            }
          } catch (error) {
            console.error('發布失敗:', error)
            alert('發布失敗，請重試。')
          }
        }
      })

      // 自定義工作區按鈕功能
      const workspaceActions = {
        previewMode: () => {
          const pnm = editor.Panels
          const command = 'sw-visibility'
          pnm.getButton('options', command)?.trigger('click')
        },
        fullscreenMode: () => {
          const pnm = editor.Panels
          const command = 'fullscreen'
          pnm.getButton('options', command)?.trigger('click')
        },
        responsiveTest: () => {
          const devices = editor.DeviceManager.getAll()
          let currentIndex = 0
          const currentDevice = editor.DeviceManager.getSelected()
          
          devices.forEach((device: any, index: number) => {
            if (device === currentDevice) {
              currentIndex = index
            }
          })
          
          const nextIndex = (currentIndex + 1) % devices.length
          editor.DeviceManager.select(devices.at(nextIndex))
        },
        resetLayout: () => {
          editor.setDevice('Desktop')
          editor.Canvas.setZoom(1)
          alert('版面已重置到預設狀態')
        }
      }

      // 將工作區動作暴露到全局，以便底部組件使用
      window.workspaceActions = workspaceActions
          }
        }
      })

      // 創建開合容器的函數
      const createCollapsibleContainer = (editor: any) => {
        // 檢查是否已存在容器，避免重複創建
        const existingContainer = document.querySelector('#custom-workspace-container')
        if (existingContainer) {
          existingContainer.remove()
        }

        // 獲取編輯器主容器
        const editorContainer = document.querySelector('#gjs') as HTMLElement
        if (!editorContainer) return

        // 創建下方工作區容器
        const container = document.createElement('div')
        container.id = 'custom-workspace-container'
        container.style.cssText = `
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #ddd;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
          z-index: 999;
          font-family: system-ui, -apple-system, sans-serif;
          transition: all 0.3s ease;
        `

        // 創建標題欄（包含下三角圖標）
        const header = document.createElement('div')
        header.style.cssText = `
          padding: 8px 16px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 1px solid #dee2e6;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          position: relative;
        `
        
        // 添加下三角圖標
        header.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; color: #495057;">🛠️ 工作區工具</span>
            <svg id="toggle-icon" style="width: 16px; height: 16px; transition: transform 0.3s ease; fill: #6c757d;" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
        `

        // 創建內容區域
        const content = document.createElement('div')
        content.id = 'workspace-content'
        content.style.cssText = `
          padding: 16px;
          height: 200px;
          overflow-y: auto;
          transition: all 0.3s ease;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        `

        // 添加工具選項（以卡片形式布局）
        content.innerHTML = `
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border: 1px solid #dee2e6;">
            <h4 style="margin: 0 0 12px 0; color: #333; font-size: 14px; font-weight: 600;">快速操作</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button id="preview-mode" style="width: 100%; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">📱 預覽模式</button>
              <button id="fullscreen-mode" style="width: 100%; padding: 8px 12px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">🖥️ 全螢幕編輯</button>
              <button id="responsive-test" style="width: 100%; padding: 8px 12px; background: #ffc107; color: #000; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">📏 響應式測試</button>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border: 1px solid #dee2e6;">
            <h4 style="margin: 0 0 12px 0; color: #333; font-size: 14px; font-weight: 600;">版面控制</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button id="toggle-panels" style="width: 100%; padding: 8px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">👁️ 切換面板</button>
              <button id="reset-layout" style="width: 100%; padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">🔄 重置版面</button>
              <button id="zoom-controls" style="width: 100%; padding: 8px 12px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">� 縮放控制</button>
            </div>
          </div>

          <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border: 1px solid #dee2e6;">
            <h4 style="margin: 0 0 12px 0; color: #333; font-size: 14px; font-weight: 600;">開發工具</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button id="view-code" style="width: 100%; padding: 8px 12px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">💻 查看代碼</button>
              <button id="export-html" style="width: 100%; padding: 8px 12px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">📄 匯出 HTML</button>
              <button id="clear-storage" style="width: 100%; padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500;">�️ 清除快取</button>
            </div>
          </div>
        `

        // 組裝容器
        container.appendChild(header)
        container.appendChild(content)
        document.body.appendChild(container)

        // 調整編輯器高度，為工作區留出空間
        if (editorContainer) {
          editorContainer.style.paddingBottom = '240px'
        }

        // 添加展開/收合功能
        let isExpanded = true
        header.addEventListener('click', () => {
          isExpanded = !isExpanded
          const icon = document.getElementById('toggle-icon')
          
          if (isExpanded) {
            content.style.height = '200px'
            content.style.padding = '16px'
            container.style.bottom = '0'
            if (icon) icon.style.transform = 'rotate(0deg)'
            if (editorContainer) editorContainer.style.paddingBottom = '240px'
          } else {
            content.style.height = '0'
            content.style.padding = '0 16px'
            container.style.bottom = '-200px'
            if (icon) icon.style.transform = 'rotate(180deg)'
            if (editorContainer) editorContainer.style.paddingBottom = '40px'
          }
        })

        // 綁定功能按鈕事件
        bindWorkspaceEvents(editor)
      }

      // 綁定工作區事件的函數
      const bindWorkspaceEvents = (editor: any) => {
        // 預覽模式
        const previewBtn = document.getElementById('preview-mode')
        if (previewBtn) {
          previewBtn.addEventListener('click', () => {
            const pnm = editor.Panels
            const command = 'sw-visibility'
            pnm.getButton('options', command)?.trigger('click')
          })
        }

        // 全螢幕模式
        const fullscreenBtn = document.getElementById('fullscreen-mode')
        if (fullscreenBtn) {
          fullscreenBtn.addEventListener('click', () => {
            const pnm = editor.Panels
            const command = 'fullscreen'
            pnm.getButton('options', command)?.trigger('click')
          })
        }

        // 響應式測試
        const responsiveBtn = document.getElementById('responsive-test')
        if (responsiveBtn) {
          responsiveBtn.addEventListener('click', () => {
            const devices = editor.DeviceManager.getAll()
            let currentIndex = 0
            const currentDevice = editor.DeviceManager.getSelected()
            
            devices.forEach((device: any, index: number) => {
              if (device === currentDevice) {
                currentIndex = index
              }
            })
            
            const nextIndex = (currentIndex + 1) % devices.length
            editor.DeviceManager.select(devices.at(nextIndex))
          })
        }

        // 切換面板
        const togglePanelsBtn = document.getElementById('toggle-panels')
        if (togglePanelsBtn) {
          togglePanelsBtn.addEventListener('click', () => {
            const panels = document.querySelectorAll('.gjs-pn-panel')
            panels.forEach((panel: any) => {
              if (panel.style.display === 'none') {
                panel.style.display = 'block'
              } else {
                panel.style.display = 'none'
              }
            })
          })
        }

        // 重置版面
        const resetLayoutBtn = document.getElementById('reset-layout')
        if (resetLayoutBtn) {
          resetLayoutBtn.addEventListener('click', () => {
            // 重置 canvas 尺寸
            editor.setDevice('Desktop')
            
            // 重置所有面板為可見
            const panels = document.querySelectorAll('.gjs-pn-panel')
            panels.forEach((panel: any) => {
              panel.style.display = 'block'
            })
            
            // 重置編輯器視圖
            editor.Canvas.setZoom(1)
            alert('版面已重置到預設狀態')
          })
        }

        // 縮放控制
        const zoomBtn = document.getElementById('zoom-controls')
        if (zoomBtn) {
          zoomBtn.addEventListener('click', () => {
            const currentZoom = editor.Canvas.getZoom()
            const newZoom = currentZoom >= 1.5 ? 0.5 : currentZoom + 0.25
            editor.Canvas.setZoom(newZoom)
          })
        }

        // 查看代碼
        const viewCodeBtn = document.getElementById('view-code')
        if (viewCodeBtn) {
          viewCodeBtn.addEventListener('click', () => {
            const pnm = editor.Panels
            const command = 'export-template'
            pnm.getButton('options', command)?.trigger('click')
          })
        }

        // 匯出 HTML
        const exportBtn = document.getElementById('export-html')
        if (exportBtn) {
          exportBtn.addEventListener('click', () => {
            const html = editor.getHtml()
            const css = editor.getCss()
            const fullCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exported Page</title>
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`
            
            const blob = new Blob([fullCode], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'exported-page.html'
            a.click()
            URL.revokeObjectURL(url)
          })
        }

        // 清除快取
        const clearStorageBtn = document.getElementById('clear-storage')
        if (clearStorageBtn) {
          clearStorageBtn.addEventListener('click', () => {
            if (confirm('確定要清除所有本地快取嗎？此操作無法復原。')) {
              editor.StorageManager.clear()
              localStorage.clear()
              sessionStorage.clear()
              alert('快取已清除')
            }
          })
        }
      }      // 載入當前頁面
      editor.on('load', () => {
        // 添加自訂工作區切換按鈕到 views 面板
        editor.Panels.addButton('views', {
          id: 'custom-workspace',
          className: 'gjs-pn-btn',
          label: `<svg style="display: block; max-width:22px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4,4H7V7H4V4M10,4H13V7H10V4M16,4H19V7H16V4M4,10H7V13H4V10M10,10H13V13H10V10M16,10H19V13H16V10M4,16H7V19H4V16M10,16H13V19H10V16M16,16H19V19H16V19Z"></path>
          </svg>`,
          attributes: { 
            title: '切換工作區'
          },
          command: 'toggle-workspace'
        })

        // 添加工作區切換命令
        editor.Commands.add('toggle-workspace', {
          run: function(editor: any) {
            // 直接創建下方工作區域（固定顯示）
            createCollapsibleContainer(editor)
          }
        })

        setTimeout(() => {
          // 載入當前頁面
          if (currentPageId && pages.length > 0) {
            loadPageToEditor(currentPageId, editor)
          }
        }, 500)
      })

      // 鍵盤快捷鍵
      const handleKeydown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault()
          editor.runCommand('save-content')
        }
      }

      editor.on('load', () => {
        const container = editor.getContainer()
        if (container) {
          container.addEventListener('keydown', handleKeydown)
        }
      })

      editorInstance.current = editor
      } catch (error) {
        console.error('初始化編輯器時出現錯誤:', error)
      }
    }

    initEditor()

    return () => {
      // 安全地銷毀編輯器實例
      if (editorInstance.current) {
        try {
          // 先移除所有事件監聽器
          editorInstance.current.off()
          
          // 更安全的 DOM 清理
          const container = editorRef.current
          if (container) {
            // 使用 React 友好的方式清理 DOM
            requestAnimationFrame(() => {
              try {
                // 先嘗試清空內容
                container.innerHTML = ''
              } catch (error) {
                console.warn('清理容器時出現錯誤:', error)
              }
            })
          }
          
          // 最後銷毀編輯器
          editorInstance.current.destroy()
        } catch (error) {
          console.warn('銷毀編輯器時出現錯誤:', error)
        } finally {
          editorInstance.current = null
        }
      }
    }
  }, [onSave, isLoading, pages.length])

  // 組件的主要渲染邏輯
  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <i className="fa fa-spinner fa-spin" style={{ fontSize: '48px' }}></i>
          </div>
          <p style={{ fontSize: '18px' }}>載入頁面中...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh' }}>
      <div 
        ref={editorRef}
        suppressHydrationWarning={true}
        key="grapesjs-editor-container"
      >
        <h1>歡迎使用 GrapesJS 編輯器!</h1>
        <p>這是一個功能強大的視覺化網頁編輯器。</p>
      </div>
    </div>
  )
}
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
  const [isSaving, setIsSaving] = useState(false)
  const updatePagesListRef = useRef<((selectedPageId?: string) => void) | null>(null)

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
      setIsSaving(true)
      
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
    } finally {
      setIsSaving(false)
    }
  }

  // 初始載入頁面列表
  useEffect(() => {
    loadPages()
  }, [])

  // 監聽 currentPageId 變化，更新頁面選擇器 UI
  useEffect(() => {
    if (updatePagesListRef.current) {
      updatePagesListRef.current(currentPageId)
    }
  }, [currentPageId])

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

      // 創建頁面選擇器
      editor.on('load', () => {
        setTimeout(() => {
          createPageSelector(editor)
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
      // 安全地清理側邊欄事件監聽器
      try {
        if ((window as any).sidebarCleanup) {
          (window as any).sidebarCleanup()
          delete (window as any).sidebarCleanup
        }
      } catch (error) {
        console.warn('清理側邊欄時出現錯誤:', error)
      }
      
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

  // 在組件返回 JSX 之前，定義輔助函數
  // 創建美觀的頁面選擇器
  const createPageSelector = (editor: any) => {
    // 側邊欄狀態和元素引用
    let isExpanded = false
    let sidebarElement: HTMLElement | null = null
    let toggleBtnElement: HTMLElement | null = null
    
    // 清理舊的側邊欄和事件監聽器
    if ((window as any).sidebarCleanup) {
      try {
        (window as any).sidebarCleanup()
      } catch (error) {
        console.warn('清理舊側邊欄時出現錯誤:', error)
      }
      delete (window as any).sidebarCleanup
    }
    
    // 安全地移除現有元素
    const existingSidebar = document.querySelector('.gjs-custom-sidebar')
    if (existingSidebar) {
      try {
        existingSidebar.remove()
      } catch (error) {
        console.warn('移除現有側邊欄時出現錯誤:', error)
      }
    }

    const existingToggleBtn = document.querySelector('.gjs-sidebar-toggle-header')
    if (existingToggleBtn) {
      try {
        existingToggleBtn.remove()
      } catch (error) {
        console.warn('移除現有切換按鈕時出現錯誤:', error)
      }
    }

    // 動態獲取頁首工具列的高度
    const getHeaderHeight = () => {
      const header = document.querySelector('.gjs-pn-panel.gjs-pn-views') || 
                    document.querySelector('.gjs-pn-panel') ||
                    document.querySelector('[class*="gjs-pn"]')
      
      if (header) {
        const height = header.getBoundingClientRect().height
        return Math.max(height + 5, 45) // 增加5px高度
      }
      return 45 // 預設高度也增加5px
    }

    const headerHeight = getHeaderHeight()

    // 動態獲取 GrapesJS 左側面板的寬度
    const getLeftPanelWidth = () => {
      const leftPanel = document.querySelector('.gjs-pn-panels-left') || 
                       document.querySelector('.gjs-sm-sectors') ||
                       document.querySelector('[class*="gjs-pn-panel"]:first-child')
      
      if (leftPanel) {
        const width = leftPanel.getBoundingClientRect().width
        return Math.max(width, 0)
      }
      return 0 // 如果沒有左側面板，返回0
    }

    const leftPanelWidth = getLeftPanelWidth()

    // 創建側邊欄容器
    const sidebar = document.createElement('div')
    sidebar.className = 'gjs-custom-sidebar'
    sidebar.style.cssText = `
      position: fixed;
      top: ${headerHeight}px;
      left: ${leftPanelWidth}px;
      width: 280px;
      height: calc(100vh - ${headerHeight}px);
      background: linear-gradient(135deg, #2c2c2c 0%, #1e1e1e 100%);
      border-right: 1px solid #555;
      z-index: 1000;
      transform: translateX(-280px);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
    `

    // 設置側邊欄元素引用
    sidebarElement = sidebar

    // 創建標題
    const title = document.createElement('div')
    title.innerHTML = '<i class="fa fa-file-text"></i> 頁面管理'
    title.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      color: #e0e0e0;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #444;
      display: flex;
      align-items: center;
      gap: 10px;
    `

    // 創建新增頁面按鈕
    const addPageButton = document.createElement('button')
    addPageButton.innerHTML = '<i class="fa fa-plus"></i> 新增頁面'
    addPageButton.style.cssText = `
      width: 100%;
      padding: 14px 18px;
      margin-bottom: 25px;
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    `

    addPageButton.onmouseenter = () => {
      addPageButton.style.background = 'linear-gradient(135deg, #0056b3 0%, #004085 100%)'
      addPageButton.style.transform = 'translateY(-2px)'
      addPageButton.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.4)'
    }

    addPageButton.onmouseleave = () => {
      addPageButton.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
      addPageButton.style.transform = 'translateY(0)'
      addPageButton.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)'
    }

    // 創建頁面列表容器
    const pagesList = document.createElement('div')
    pagesList.className = 'gjs-pages-list'
    pagesList.style.cssText = `
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-right: 8px;
    `

    // 自定義滾動條樣式
    const scrollStyle = document.createElement('style')
    scrollStyle.textContent = `
      .gjs-pages-list::-webkit-scrollbar {
        width: 8px;
      }
      .gjs-pages-list::-webkit-scrollbar-track {
        background: #333;
        border-radius: 4px;
      }
      .gjs-pages-list::-webkit-scrollbar-thumb {
        background: #666;
        border-radius: 4px;
      }
      .gjs-pages-list::-webkit-scrollbar-thumb:hover {
        background: #888;
      }
    `
    document.head.appendChild(scrollStyle)

    // 切換側邊欄展開/收合
    const toggleSidebar = () => {
      isExpanded = !isExpanded
      if (sidebarElement) {
        sidebarElement.style.transform = isExpanded ? 'translateX(0)' : 'translateX(-280px)'
      }
      
      // 更新按鈕樣式
      if (toggleBtnElement) {
        toggleBtnElement.style.backgroundColor = isExpanded ? '#463a3c' : 'transparent'
        toggleBtnElement.style.color = isExpanded ? '#fff' : '#999'
      }
      
      if (isExpanded) {
        updatePagesList()
      }
    }

    // 收合側邊欄（只收合，不切換）
    const collapseSidebar = () => {
      if (isExpanded && sidebarElement) {
        isExpanded = false
        sidebarElement.style.transform = 'translateX(-280px)'
        
        // 更新按鈕樣式
        if (toggleBtnElement) {
          toggleBtnElement.style.backgroundColor = 'transparent'
          toggleBtnElement.style.color = '#999'
        }
      }
    }

    // 添加點擊外部區域收合側邊欄的監聽器
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // 如果點擊的不是側邊欄、漢堡按鈕或它們的子元素，則收合側邊欄
      if (sidebarElement && toggleBtnElement && isExpanded) {
        const clickedInsideSidebar = sidebarElement.contains(target)
        const clickedToggleBtn = toggleBtnElement.contains(target)
        
        if (!clickedInsideSidebar && !clickedToggleBtn) {
          collapseSidebar()
        }
      }
    }

    // 添加全域點擊監聽器 - 使用更強健的方式
    const addGlobalClickListener = () => {
      // 移除舊的監聽器
      document.removeEventListener('click', handleClickOutside)
      
      // 添加新的監聽器
      document.addEventListener('click', handleClickOutside, true) // 使用 capture 模式
      
      // 也監聽全螢幕元素的點擊
      const fullscreenElement = document.fullscreenElement || (document as any).webkitFullscreenElement
      if (fullscreenElement) {
        fullscreenElement.addEventListener('click', handleClickOutside, true)
      }
    }

    addGlobalClickListener()

    // 監聽全螢幕狀態變化
    const handleFullscreenChange = () => {
      setTimeout(() => {
        addGlobalClickListener()
        // 重新獲取元素引用，因為全螢幕模式可能改變 DOM 結構
        sidebarElement = document.querySelector('.gjs-custom-sidebar') as HTMLElement
        toggleBtnElement = document.querySelector('.gjs-sidebar-toggle-header') as HTMLElement
        
        // 重新計算左側面板寬度並調整側邊欄位置
        if (sidebarElement) {
          const newLeftPanelWidth = getLeftPanelWidth()
          const newHeaderHeight = getHeaderHeight()
          sidebarElement.style.left = `${newLeftPanelWidth}px`
          sidebarElement.style.top = `${newHeaderHeight}px`
          sidebarElement.style.height = `calc(100vh - ${newHeaderHeight}px)`
        }
      }, 100)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    // 監聽視窗大小變化，重新調整側邊欄位置
    const handleResize = () => {
      if (sidebarElement) {
        const newLeftPanelWidth = getLeftPanelWidth()
        const newHeaderHeight = getHeaderHeight()
        sidebarElement.style.left = `${newLeftPanelWidth}px`
        sidebarElement.style.top = `${newHeaderHeight}px`
        sidebarElement.style.height = `calc(100vh - ${newHeaderHeight}px)`
      }
    }

    window.addEventListener('resize', handleResize)
    
    // 清理函數（當元件卸載時移除監聽器）
    const cleanup = () => {
      try {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
        window.removeEventListener('resize', handleResize)
        
        // 安全地移除 DOM 元素
        if (sidebarElement) {
          try {
            sidebarElement.remove()
          } catch (error) {
            console.warn('移除側邊欄元素時出現錯誤:', error)
          }
        }
        
        if (toggleBtnElement) {
          try {
            toggleBtnElement.remove()
          } catch (error) {
            console.warn('移除切換按鈕時出現錯誤:', error)
          }
        }
        
        // 移除所有已添加的 CSS 樣式
        const existingStyle = document.getElementById('gjs-custom-sidebar-styles')
        if (existingStyle) {
          try {
            existingStyle.remove()
          } catch (error) {
            console.warn('移除樣式元素時出現錯誤:', error)
          }
        }
        
        // 也移除全螢幕元素的監聽器
        const fullscreenElement = document.fullscreenElement || (document as any).webkitFullscreenElement
        if (fullscreenElement) {
          fullscreenElement.removeEventListener('click', handleClickOutside)
        }
      } catch (error) {
        console.warn('清理側邊欄時出現錯誤:', error)
      }
    }

    // 將清理函數存儲起來，以便後續使用
    ;(window as any).sidebarCleanup = cleanup

    // 在頁首添加漢堡按鈕
    const addToggleButtonToHeader = () => {
      const deviceButtons = document.querySelector('.gjs-pn-panel.gjs-pn-devices .gjs-pn-buttons') ||
                          document.querySelector('.gjs-pn-devices .gjs-pn-buttons') ||
                          document.querySelector('[class*="device"] .gjs-pn-buttons') ||
                          document.querySelector('.gjs-pn-buttons')

      if (deviceButtons) {
        const headerToggleBtn = document.createElement('span')
        headerToggleBtn.className = 'gjs-pn-btn gjs-sidebar-toggle-header'
        headerToggleBtn.innerHTML = '<i class="fa fa-bars"></i>'
        headerToggleBtn.title = '頁面管理'
        headerToggleBtn.style.cssText = `
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          padding: 6px 8px;
          margin-right: 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
          color: #999;
        `
        
        headerToggleBtn.onmouseenter = () => {
          headerToggleBtn.style.backgroundColor = '#f0f0f0'
          headerToggleBtn.style.color = '#333'
        }
        
        headerToggleBtn.onmouseleave = () => {
          headerToggleBtn.style.backgroundColor = isExpanded ? '#463a3c' : 'transparent'
          headerToggleBtn.style.color = isExpanded ? '#fff' : '#999'
        }
        
        headerToggleBtn.onclick = toggleSidebar
        
        // 設置按鈕元素引用
        toggleBtnElement = headerToggleBtn
        
        deviceButtons.insertBefore(headerToggleBtn, deviceButtons.firstChild)
        console.log('漢堡按鈕添加成功')
      }
    }

    // 更新頁面列表 - 接收當前頁面ID作為參數確保同步
    const updatePagesList = (selectedPageId: string = currentPageId) => {
      // 使用更安全的 DOM 清理方式
      try {
        // 使用 requestAnimationFrame 確保在正確的時機更新 DOM
        requestAnimationFrame(() => {
          try {
            pagesList.textContent = '' // 使用 textContent 而不是 innerHTML
            
            pages.forEach((page) => {
              const isSelected = page._id === selectedPageId
        
        const pageItem = document.createElement('div')
        pageItem.className = 'gjs-page-item'
        pageItem.style.cssText = `
          padding: 16px 18px;
          background: ${isSelected ? 'linear-gradient(135deg, #463a3c 0%, #3a2f31 100%)' : 'linear-gradient(135deg, #444 0%, #3a3a3a 100%)'};
          border: ${isSelected ? '2px solid #b9a5a6' : '1px solid #555'};
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 15px;
          min-height: 54px;
          position: relative;
          overflow: hidden;
        `
        
        if (isSelected) {
          pageItem.style.boxShadow = '0 4px 16px rgba(185, 165, 166, 0.3)'
        }
        
        pageItem.onmouseenter = () => {
          if (!isSelected) {
            pageItem.style.background = 'linear-gradient(135deg, #555 0%, #4a4a4a 100%)'
            pageItem.style.transform = 'translateX(6px)'
            pageItem.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          }
        }
        
        pageItem.onmouseleave = () => {
          if (!isSelected) {
            pageItem.style.background = 'linear-gradient(135deg, #444 0%, #3a3a3a 100%)'
            pageItem.style.transform = 'translateX(0)'
            pageItem.style.boxShadow = 'none'
          } else {
            pageItem.style.boxShadow = '0 4px 16px rgba(185, 165, 166, 0.3)'
          }
        }

        const nameContainer = document.createElement('div')
        nameContainer.style.cssText = `
          display: flex;
          align-items: center;
          flex: 1;
          gap: 12px;
          overflow: hidden;
        `

        const pageIcon = document.createElement('i')
        pageIcon.className = 'fa fa-file-o'
        pageIcon.style.cssText = `
          color: ${isSelected ? '#fff' : '#b9a5a6'};
          font-size: 18px;
          min-width: 18px;
        `

        const pageName = document.createElement('span')
        pageName.style.cssText = `
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${isSelected ? '#fff' : '#e0e0e0'};
          font-weight: ${isSelected ? '600' : '400'};
        `
        pageName.textContent = page.title

        if (isSelected) {
          const selectedIcon = document.createElement('i')
          selectedIcon.className = 'fa fa-check-circle'
          selectedIcon.style.cssText = `
            color: #b9a5a6;
            font-size: 16px;
            margin-left: 10px;
          `
          nameContainer.appendChild(pageIcon)
          nameContainer.appendChild(pageName)
          nameContainer.appendChild(selectedIcon)
        } else {
          nameContainer.appendChild(pageIcon)
          nameContainer.appendChild(pageName)
        }

        const actionsContainer = document.createElement('div')
        actionsContainer.style.cssText = `
          display: flex;
          gap: 8px;
          margin-left: 15px;
          opacity: 0;
          transition: opacity 0.2s ease;
        `
        
        pageItem.addEventListener('mouseenter', () => {
          actionsContainer.style.opacity = '1'
        })
        
        pageItem.addEventListener('mouseleave', () => {
          actionsContainer.style.opacity = '0'
        })

        // 重命名按鈕
        const renameBtn = document.createElement('button')
        renameBtn.innerHTML = '<i class="fa fa-edit"></i>'
        renameBtn.title = '重命名頁面'
        renameBtn.style.cssText = `
          background: rgba(185, 165, 166, 0.1);
          color: #b9a5a6;
          border: 1px solid rgba(185, 165, 166, 0.3);
          border-radius: 8px;
          padding: 8px 10px;
          cursor: pointer;
          font-size: 13px;
          min-width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        `
        
        renameBtn.onmouseenter = () => {
          renameBtn.style.background = 'rgba(185, 165, 166, 0.2)'
          renameBtn.style.borderColor = '#b9a5a6'
          renameBtn.style.color = '#fff'
          renameBtn.style.transform = 'scale(1.1)'
        }
        
        renameBtn.onmouseleave = () => {
          renameBtn.style.background = 'rgba(185, 165, 166, 0.1)'
          renameBtn.style.borderColor = 'rgba(185, 165, 166, 0.3)'
          renameBtn.style.color = '#b9a5a6'
          renameBtn.style.transform = 'scale(1)'
        }
        
        renameBtn.onclick = async (e) => {
          e.stopPropagation()
          const newName = prompt('請輸入新的頁面名稱:', page.title)
          if (newName && newName.trim() && newName.trim() !== page.title) {
            try {
              const updateParams: UpdatePageParams = {
                _id: page._id!,
                title: newName.trim()
              }
              await grapesJSPageService.updatePage(updateParams)
              await loadPages()
              updatePagesList()
            } catch (error) {
              console.error('重命名頁面失敗:', error)
              alert('重命名失敗，請稍後再試')
            }
          }
        }

        // 刪除按鈕（只有多於一個頁面時顯示）
        if (pages.length > 1) {
          const deleteBtn = document.createElement('button')
          deleteBtn.innerHTML = '<i class="fa fa-trash"></i>'
          deleteBtn.title = '刪除頁面'
          deleteBtn.style.cssText = `
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
            border: 1px solid rgba(220, 53, 69, 0.3);
            border-radius: 8px;
            padding: 8px 10px;
            cursor: pointer;
            font-size: 13px;
            min-width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          `
          
          deleteBtn.onmouseenter = () => {
            deleteBtn.style.background = 'rgba(220, 53, 69, 0.2)'
            deleteBtn.style.borderColor = '#dc3545'
            deleteBtn.style.color = '#fff'
            deleteBtn.style.transform = 'scale(1.1)'
          }
          
          deleteBtn.onmouseleave = () => {
            deleteBtn.style.background = 'rgba(220, 53, 69, 0.1)'
            deleteBtn.style.borderColor = 'rgba(220, 53, 69, 0.3)'
            deleteBtn.style.color = '#dc3545'
            deleteBtn.style.transform = 'scale(1)'
          }
          
          deleteBtn.onclick = async (e) => {
            e.stopPropagation()
            if (confirm(`確定要刪除頁面 "${page.title}" 嗎？此操作無法撤銷。`)) {
              try {
                await grapesJSPageService.deletePage(page._id!)
                await loadPages()
                // 如果刪除的是當前頁面，切換到第一個頁面
                if (page._id === currentPageId && pages.length > 1) {
                  const firstPage = pages.find(p => p._id !== page._id)
                  if (firstPage) {
                    setCurrentPageId(firstPage._id!)
                    await loadPageToEditor(firstPage._id!, editor)
                    updatePagesList(firstPage._id!) // 傳遞新選中的頁面ID
                  }
                } else {
                  updatePagesList() // 沒有切換頁面時使用預設值
                }
              } catch (error) {
                console.error('刪除頁面失敗:', error)
                alert('刪除失敗，請稍後再試')
              }
            }
          }
          
          actionsContainer.appendChild(renameBtn)
          actionsContainer.appendChild(deleteBtn)
        } else {
          actionsContainer.appendChild(renameBtn)
        }

        // 點擊切換頁面
        pageItem.onclick = async (e) => {
          const target = e.target as HTMLElement
          if (target === pageItem || target === nameContainer || target === pageIcon || target === pageName) {
            if (page._id !== currentPageId) {
              setCurrentPageId(page._id!)
              await loadPageToEditor(page._id!, editor)
              updatePagesList(page._id!) // 傳遞新的頁面ID確保UI立即更新
            }
          }
        }

        pageItem.appendChild(nameContainer)
        pageItem.appendChild(actionsContainer)
        pagesList.appendChild(pageItem)
      })
        } catch (innerError) {
          console.warn('更新頁面列表時出現內部錯誤:', innerError)
        }
      })
      } catch (outerError) {
        console.error('更新頁面列表失敗:', outerError)
        // 降級處理：直接清空列表
        pagesList.innerHTML = ''
      }
    }

    // 將 updatePagesList 函數保存到 ref 中，以便從 React 狀態監聽器中調用
    updatePagesListRef.current = updatePagesList

    // 新增頁面事件
    addPageButton.onclick = async () => {
      const newPageName = prompt('請輸入新頁面名稱:', `頁面 ${pages.length + 1}`)
      if (newPageName?.trim()) {
        try {
          // 生成唯一的 slug
          const slug = newPageName.trim()
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
            .replace(/-+/g, '-')
            .replace(/(^-)|(-$)/g, '')
            + '-' + Date.now()

          const newPageParams: SavePageParams = {
            title: newPageName.trim(),
            slug,
            description: `新創建的頁面：${newPageName.trim()}`,
            status: 'draft',
            grapesHtml: '<div style="padding: 20px;"><h1>' + newPageName.trim() + '</h1><p>這是新創建的頁面內容</p></div>',
            grapesCss: '',
            grapesComponents: {},
            grapesStyles: {},
            homeModules: []
          }
          
          const newPage = await grapesJSPageService.createPage(newPageParams)
          if (newPage) {
            await loadPages()
            setCurrentPageId(newPage._id!)
            setCurrentPage(newPage)
            await loadPageToEditor(newPage._id!, editor)
            updatePagesList(newPage._id!)
          }
        } catch (error) {
          console.error('創建新頁面失敗:', error)
          alert('創建頁面失敗，請稍後再試')
        }
      }
    }

    // 組裝側邊欄
    sidebar.appendChild(title)
    sidebar.appendChild(addPageButton)
    sidebar.appendChild(pagesList)

    // 添加到頁面
    document.body.appendChild(sidebar)

    // 添加漢堡按鈕
    addToggleButtonToHeader()

    // 初始化頁面列表
    updatePagesList()

    console.log('美觀的頁面選擇器創建完成')
  }

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
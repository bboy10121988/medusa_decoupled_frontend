'use client'

import { useEffect, useRef, useState } from 'react'
import 'grapesjs/dist/css/grapes.min.css'
import './grapes-editor.css'

interface GrapesEditorProps {
  onSave?: (content: string) => void
}

interface Page {
  id: string
  name: string
  html?: string
  css?: string
  components?: any
  styles?: any
  createdAt: string
  updatedAt: string
}

// API 函數
const pagesAPI = {
  // 獲取所有頁面
  async getAllPages(): Promise<Page[]> {
    try {
      const response = await fetch('/api/grapesjs-pages')
      const result = await response.json()
      if (result.success) {
        return result.pages || []
      }
      return []
    } catch (error) {
      console.error('獲取頁面列表失敗:', error)
      return []
    }
  },

  // 獲取特定頁面
  async getPage(pageId: string): Promise<Page | null> {
    try {
      const response = await fetch(`/api/grapesjs-pages?id=${pageId}`)
      const result = await response.json()
      if (result.success) {
        return result.page
      }
      return null
    } catch (error) {
      console.error('獲取頁面失敗:', error)
      return null
    }
  },

  // 保存頁面
  async savePage(pageId: string, name: string, html: string, css: string, components: any, styles: any): Promise<boolean> {
    try {
      const response = await fetch('/api/grapesjs-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          name,
          html,
          css,
          components,
          styles
        })
      })
      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('保存頁面失敗:', error)
      return false
    }
  },

  // 刪除頁面
  async deletePage(pageId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/grapesjs-pages?id=${pageId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('刪除頁面失敗:', error)
      return false
    }
  }
}

export default function GrapesEditor({ onSave }: GrapesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<any>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [currentPageId, setCurrentPageId] = useState<string>('home')
  const [isLoading, setIsLoading] = useState(true)

  // 載入頁面列表
  const loadPages = async () => {
    setIsLoading(true)
    const loadedPages = await pagesAPI.getAllPages()
    setPages(loadedPages)
    
    // 如果沒有頁面，創建一個默認首頁
    if (loadedPages.length === 0) {
      const defaultPage = {
        pageId: 'home',
        name: '首頁',
        html: '<div><h1>歡迎來到首頁</h1><p>這是使用 GrapesJS 編輯器創建的頁面。</p></div>',
        css: '',
        components: {},
        styles: {}
      }
      
      const success = await pagesAPI.savePage(
        defaultPage.pageId,
        defaultPage.name,
        defaultPage.html,
        defaultPage.css,
        defaultPage.components,
        defaultPage.styles
      )
      
      if (success) {
        const updatedPages = await pagesAPI.getAllPages()
        setPages(updatedPages)
      }
    }
    
    setIsLoading(false)
  }

  // 載入頁面內容到編輯器
  const loadPageToEditor = async (pageId: string, editor: any) => {
    const pageData = await pagesAPI.getPage(pageId)
    if (pageData) {
      editor.setComponents(pageData.html || '')
      editor.setStyle(pageData.css || '')
      
      // 如果有 components 和 styles 數據，則使用它們
      if (pageData.components) {
        editor.loadProjectData({
          assets: [],
          styles: pageData.styles || [],
          pages: [{
            frames: [{
              component: pageData.components
            }]
          }]
        })
      }
    }
  }

  // 保存當前頁面
  const saveCurrentPage = async (editor: any) => {
    if (!currentPageId) return false
    
    const currentPage = pages.find(p => p.id === currentPageId)
    if (!currentPage) return false

    const html = editor.getHtml()
    const css = editor.getCss()
    const components = editor.getComponents()
    const styles = editor.getStyles()

    const success = await pagesAPI.savePage(
      currentPageId,
      currentPage.name,
      html,
      css,
      components,
      styles
    )

    if (success) {
      // 重新載入頁面列表
      await loadPages()
      console.log('頁面保存成功')
    }

    return success
  }

  useEffect(() => {
    // 初始載入頁面列表
    loadPages()
  }, [])

  useEffect(() => {
    if (!editorRef.current || editorInstance.current || isLoading) return

    // 動態導入所有依賴
    const initEditor = async () => {
      const grapesjs = (await import('grapesjs')).default
      
      // Import all the plugins used in the official demo
      const pluginWebpage = (await import('grapesjs-preset-webpage')).default
      const pluginBlocksBasic = (await import('grapesjs-blocks-basic')).default
      const pluginForms = (await import('grapesjs-plugin-forms')).default
      const pluginCountdown = (await import('grapesjs-component-countdown')).default
      const pluginTabs = (await import('grapesjs-tabs')).default
      const pluginCustomCode = (await import('grapesjs-custom-code')).default
      const pluginTooltip = (await import('grapesjs-tooltip')).default
      const pluginTyped = (await import('grapesjs-typed')).default
      
      // Import our custom home modules plugin
      const enhancedHomeModulesPlugin = (await import('./plugins/enhanced-home-modules')).default
      
      // Import Bootstrap components (使用簡化版)
      const addBootstrapComponents = (await import('./bootstrap-components-simple')).default

      // Initialize GrapesJS editor exactly like the official demo
      const editor = grapesjs.init({
        // Indicate where to init the editor. You can also pass an HTMLElement
        container: editorRef.current!,
        // Get the content for the canvas directly from the element
        fromElement: true,
        // Size of the editor
        height: '100vh',
        width: 'auto',
        // Disable the storage manager for the demo
        storageManager: false,
        
        // Canvas 配置 - 添加 Bootstrap CSS
        canvas: {
          styles: [
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
          ],
          scripts: [
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js'
          ]
        },
        
        // Add all the plugins from the official demo
        plugins: [
          pluginWebpage,
          pluginBlocksBasic,
          pluginForms,
          pluginCountdown,
          pluginTabs,
          pluginCustomCode,
          pluginTooltip,
          pluginTyped,
          enhancedHomeModulesPlugin // 添加我們的首頁模組外掛
        ],
        
        // Plugin options exactly like the official demo
        pluginsOpts: {
          'grapesjs-preset-webpage': {
            modalImportTitle: 'Import Template',
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
            modalImportContent: function(editor: any) {
              return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
            }
          },
          'grapesjs-blocks-basic': { 
            flexGrid: true 
          },
          'grapesjs-plugin-forms': {
            // Official demo forms configuration
          },
          'grapesjs-component-countdown': {
            // Official demo countdown configuration
          },
          'grapesjs-tabs': {
            // Official demo tabs configuration
          },
          'grapesjs-custom-code': {
            // Official demo custom code configuration
          },
          'grapesjs-tooltip': {
            // Official demo tooltip configuration
          },
          'grapesjs-typed': {
            // Official demo typed configuration
          }
        }
      })

      // Add Bootstrap components to the editor
      addBootstrapComponents(editor)

      // Initialize Bootstrap components in canvas
      editor.on('component:add', (component: any) => {
        // 在畫布中初始化 Bootstrap JavaScript 元件
        setTimeout(() => {
          const canvas = editor.Canvas;
          const canvasDoc = canvas.getDocument();
          const canvasWindow = canvas.getWindow();
          
          if (canvasDoc && canvasWindow && (canvasWindow as any).bootstrap) {
            // 初始化新添加的 Bootstrap 元件
            try {
              const bootstrap = (canvasWindow as any).bootstrap;
              
              // 輪播圖
              const carousels = canvasDoc.querySelectorAll('.carousel:not([data-bs-initialized])');
              carousels.forEach((carousel: any) => {
                carousel.setAttribute('data-bs-initialized', 'true');
                new bootstrap.Carousel(carousel);
              });
              
              // 模態框
              const modals = canvasDoc.querySelectorAll('.modal:not([data-bs-initialized])');
              modals.forEach((modal: any) => {
                modal.setAttribute('data-bs-initialized', 'true');
                new bootstrap.Modal(modal);
              });
              
              // 下拉選單
              const dropdowns = canvasDoc.querySelectorAll('[data-bs-toggle="dropdown"]:not([data-bs-initialized])');
              dropdowns.forEach((dropdown: any) => {
                dropdown.setAttribute('data-bs-initialized', 'true');
                new bootstrap.Dropdown(dropdown);
              });
              
              // 手風琴/摺疊
              const collapses = canvasDoc.querySelectorAll('[data-bs-toggle="collapse"]:not([data-bs-initialized])');
              collapses.forEach((collapse: any) => {
                collapse.setAttribute('data-bs-initialized', 'true');
                new bootstrap.Collapse(collapse);
              });
              
              // 吐司通知
              const toasts = canvasDoc.querySelectorAll('.toast:not([data-bs-initialized])');
              toasts.forEach((toast: any) => {
                toast.setAttribute('data-bs-initialized', 'true');
                new bootstrap.Toast(toast);
              });
              
              // 側邊欄
              const offcanvases = canvasDoc.querySelectorAll('.offcanvas:not([data-bs-initialized])');
              offcanvases.forEach((offcanvas: any) => {
                offcanvas.setAttribute('data-bs-initialized', 'true');
                new bootstrap.Offcanvas(offcanvas);
              });
              
              console.log('✅ Bootstrap 元件已初始化');
            } catch (error) {
              console.warn('Bootstrap 元件初始化失敗:', error);
            }
          }
        }, 500);
      });

      // Add custom save command
      editor.Commands.add('save-content', {
        run: (editor: any) => {
          if (onSave) {
            const html = editor.getHtml()
            const css = editor.getCss()
            const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Generated Page</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`
            onSave(content)
          }
        }
      })

      // Add save button to the toolbar
      editor.Panels.addButton('options', [
        {
          id: 'save-content',
          className: 'btn-save',
          label: '💾',
          command: 'save-content',
          attributes: { title: 'Save Content (Ctrl+S)' }
        }
      ])

      // 添加頁面管理命令
      editor.Commands.add('page:add', {
        run: (editor: any) => {
          const pages = editor.Pages
          const newPageName = prompt('請輸入新頁面名稱:', `頁面 ${pages.getAll().length + 1}`)
          if (newPageName) {
            const newPage = pages.add({
              id: `page-${Date.now()}`,
              component: `<div><h1>${newPageName}</h1><p>這是新創建的頁面</p></div>`
            })
            pages.select(newPage)
          }
        }
      })

      editor.Commands.add('page:remove', {
        run: (editor: any) => {
          const pages = editor.Pages
          const currentPage = pages.getSelected()
          const allPages = pages.getAll()
          
          if (allPages.length > 1 && currentPage) {
            if (confirm('確定要刪除當前頁面嗎？此操作無法撤銷。')) {
              pages.remove(currentPage)
            }
          } else {
            alert('無法刪除：至少需要保留一個頁面')
          }
        }
      })

      // 創建可展開收合的左側欄，包含頁面選擇器
      editor.on('load', () => {
        console.log('編輯器載入完成，開始創建左側欄')
        
        setTimeout(() => {
          // 檢查是否已存在左側欄
          const existingSidebar = document.querySelector('.gjs-custom-sidebar')
          if (existingSidebar) {
            existingSidebar.remove()
            console.log('移除舊的左側欄')
          }

          // 檢查是否已存在控制按鈕
          const existingToggleBtn = document.querySelector('.gjs-sidebar-toggle-header')
          if (existingToggleBtn) {
            existingToggleBtn.remove()
            console.log('移除舊的控制按鈕')
          }

          // 動態獲取頁首工具列的高度
          const getHeaderHeight = () => {
            const header = document.querySelector('.gjs-pn-panel.gjs-pn-views') || 
                          document.querySelector('.gjs-pn-panel') ||
                          document.querySelector('[class*="gjs-pn"]')
            
            if (header) {
              const height = header.getBoundingClientRect().height
              console.log('檢測到頁首高度:', height)
              return Math.max(height, 40) // 最小40px
            }
            console.log('未檢測到頁首，使用預設高度40px')
            return 40 // 預設高度
          }

          const headerHeight = getHeaderHeight()

          // 創建左側欄容器
          const sidebar = document.createElement('div')
          sidebar.className = 'gjs-custom-sidebar'
          sidebar.style.cssText = `
            position: fixed;
            top: ${headerHeight}px;
            left: 0;
            width: 250px;
            height: calc(100vh - ${headerHeight}px);
            background: #2c2c2c;
            border-right: 1px solid #555;
            z-index: 1000;
            transform: translateX(-250px);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
            color: white;
            font-family: Arial, sans-serif;
            padding: 15px;
          `

          // 創建新增頁面按鈕 - 使用 FontAwesome 圖標
          const addPageButton = document.createElement('button')
          addPageButton.className = 'gjs-add-page-btn'
          addPageButton.innerHTML = '<i class="fa fa-plus"></i> 新增頁面'
          addPageButton.style.cssText = `
            width: 100%;
            padding: 12px 16px;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
          `
          addPageButton.onmouseenter = () => {
            addPageButton.style.background = 'linear-gradient(135deg, #0056b3 0%, #004085 100%)'
            addPageButton.style.transform = 'translateY(-1px)'
            addPageButton.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.4)'
          }
          addPageButton.onmouseleave = () => {
            addPageButton.style.background = 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
            addPageButton.style.transform = 'translateY(0)'
            addPageButton.style.boxShadow = '0 2px 4px rgba(0, 123, 255, 0.3)'
          }

          // 添加頁面標題
          const pagesTitle = document.createElement('div')
          pagesTitle.innerHTML = '<i class="fa fa-file-text"></i> 頁面管理'
          pagesTitle.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: #e0e0e0;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #555;
            display: flex;
            align-items: center;
            gap: 8px;
          `

          // 創建頁面列表容器
          const pagesList = document.createElement('div')
          pagesList.className = 'gjs-pages-list'
          pagesList.style.cssText = `
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding-right: 5px;
          `

          // 自定義滾動條樣式
          const scrollStyle = document.createElement('style')
          scrollStyle.textContent = `
            .gjs-pages-list::-webkit-scrollbar {
              width: 6px;
            }
            .gjs-pages-list::-webkit-scrollbar-track {
              background: #333;
              border-radius: 3px;
            }
            .gjs-pages-list::-webkit-scrollbar-thumb {
              background: #666;
              border-radius: 3px;
            }
            .gjs-pages-list::-webkit-scrollbar-thumb:hover {
              background: #888;
            }
          `
          document.head.appendChild(scrollStyle)

          // 側欄狀態
          let isExpanded = false

          // 切換側欄展開/收合
          const toggleSidebar = () => {
            isExpanded = !isExpanded
            sidebar.style.transform = isExpanded ? 'translateX(0)' : 'translateX(-250px)'
            
            // 更新按鈕樣式
            const toggleBtn = document.querySelector('.gjs-sidebar-toggle-header') as HTMLElement
            if (toggleBtn) {
              toggleBtn.style.backgroundColor = isExpanded ? '#463a3c' : 'transparent'
            }
            
            if (isExpanded) {
              updatePagesList()
            }
          }

          // 在頁首添加控制按鈕 - 使用 FontAwesome 漢堡圖標
          const addToggleButtonToHeader = () => {
            // 查找頁首中的按鈕容器
            const deviceButtons = document.querySelector('.gjs-pn-panel.gjs-pn-devices .gjs-pn-buttons') ||
                                document.querySelector('.gjs-pn-devices .gjs-pn-buttons') ||
                                document.querySelector('[class*="device"] .gjs-pn-buttons')

            if (deviceButtons) {
              // 創建漢堡選單按鈕
              const headerToggleBtn = document.createElement('span')
              headerToggleBtn.className = 'gjs-pn-btn gjs-sidebar-toggle-header'
              headerToggleBtn.innerHTML = '<i class="fa fa-bars"></i>' // FontAwesome 漢堡圖標
              headerToggleBtn.title = '頁面管理'
              headerToggleBtn.style.cssText = `
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                padding: 8px 10px;
                margin-right: 5px;
                border-radius: 4px;
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
              
              // 插入到設備按鈕的最前面
              deviceButtons.insertBefore(headerToggleBtn, deviceButtons.firstChild)
              console.log('頁首控制按鈕添加成功')
            } else {
              console.warn('未找到設備按鈕容器，嘗試備用方案')
              // 備用方案：查找任何按鈕容器
              const anyButtonContainer = document.querySelector('.gjs-pn-buttons')
              if (anyButtonContainer) {
                const headerToggleBtn = document.createElement('span')
                headerToggleBtn.className = 'gjs-pn-btn gjs-sidebar-toggle-header'
                headerToggleBtn.innerHTML = '<i class="fa fa-bars"></i>'
                headerToggleBtn.title = '頁面管理'
                headerToggleBtn.style.cssText = `
                  cursor: pointer;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  padding: 8px 10px;
                  margin-right: 5px;
                  border-radius: 4px;
                  transition: all 0.2s ease;
                  color: #999;
                `
                headerToggleBtn.onclick = toggleSidebar
                anyButtonContainer.insertBefore(headerToggleBtn, anyButtonContainer.firstChild)
                console.log('使用備用方案添加按鈕')
              } else {
                console.error('無法找到任何按鈕容器')
              }
            }
          }

          // 更新頁面列表
          const updatePagesList = () => {
            console.log('更新頁面列表')
            const pages = editor.Pages.getAll()
            const selectedPage = editor.Pages.getSelected()
            console.log('頁面數量:', pages.length, '選中頁面:', selectedPage?.get('name'))
            
            pagesList.innerHTML = ''

            pages.forEach((page: any, index: number) => {
              const isSelected = page === selectedPage
              const pageName = page.get('name') || `頁面 ${index + 1}`
              
              const pageItem = document.createElement('div')
              pageItem.className = 'gjs-page-item'
              pageItem.style.cssText = `
                padding: 14px 16px;
                background: ${isSelected ? '#463a3c' : 'linear-gradient(135deg, #444 0%, #3a3a3a 100%)'};
                border: ${isSelected ? '2px solid #b9a5a6' : '1px solid #555'};
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 14px;
                min-height: 48px;
                position: relative;
                overflow: hidden;
              `
              
              // 添加選中狀態的光暈效果
              if (isSelected) {
                pageItem.style.boxShadow = '0 0 12px rgba(185, 165, 166, 0.3)'
              }
              
              pageItem.onmouseenter = () => {
                if (!isSelected) {
                  pageItem.style.background = 'linear-gradient(135deg, #555 0%, #4a4a4a 100%)'
                  pageItem.style.transform = 'translateX(4px)'
                  pageItem.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
                }
              }
              pageItem.onmouseleave = () => {
                if (!isSelected) {
                  pageItem.style.background = 'linear-gradient(135deg, #444 0%, #3a3a3a 100%)'
                  pageItem.style.transform = 'translateX(0)'
                  pageItem.style.boxShadow = 'none'
                } else {
                  pageItem.style.boxShadow = '0 0 12px rgba(185, 165, 166, 0.3)'
                }
              }

              const pageNameContainer = document.createElement('div')
              pageNameContainer.style.cssText = `
                display: flex;
                align-items: center;
                flex: 1;
                gap: 10px;
                overflow: hidden;
              `

              const pageIcon = document.createElement('i')
              pageIcon.className = 'fa fa-file-o'
              pageIcon.style.cssText = `
                color: ${isSelected ? '#fff' : '#b9a5a6'};
                font-size: 16px;
                min-width: 16px;
              `

              const pageNameSpan = document.createElement('span')
              pageNameSpan.style.cssText = `
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: ${isSelected ? '#fff' : '#e0e0e0'};
                font-weight: ${isSelected ? '600' : '400'};
              `
              pageNameSpan.textContent = pageName

              // 選中標識
              if (isSelected) {
                const selectedIcon = document.createElement('i')
                selectedIcon.className = 'fa fa-check-circle'
                selectedIcon.style.cssText = `
                  color: #b9a5a6;
                  font-size: 14px;
                  margin-left: 8px;
                `
                pageNameContainer.appendChild(pageIcon)
                pageNameContainer.appendChild(pageNameSpan)
                pageNameContainer.appendChild(selectedIcon)
              } else {
                pageNameContainer.appendChild(pageIcon)
                pageNameContainer.appendChild(pageNameSpan)
              }

              const actionsContainer = document.createElement('div')
              actionsContainer.style.cssText = `
                display: flex;
                gap: 6px;
                margin-left: 12px;
                opacity: 0;
                transition: opacity 0.2s ease;
              `
              
              // 滑鼠懸停時顯示操作按鈕
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
                border-radius: 6px;
                padding: 6px 8px;
                cursor: pointer;
                font-size: 12px;
                min-width: 28px;
                height: 28px;
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
              renameBtn.onclick = (e) => {
                e.stopPropagation()
                const newName = prompt('請輸入新的頁面名稱:', pageName)
                if (newName && newName.trim()) {
                  page.set('name', newName.trim())
                  updatePagesList()
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
                  border-radius: 6px;
                  padding: 6px 8px;
                  cursor: pointer;
                  font-size: 12px;
                  min-width: 28px;
                  height: 28px;
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
                deleteBtn.onclick = (e) => {
                  e.stopPropagation()
                  if (confirm(`確定要刪除頁面 "${pageName}" 嗎？此操作無法撤銷。`)) {
                    editor.Pages.remove(page)
                    updatePagesList()
                  }
                }
                actionsContainer.appendChild(deleteBtn)
              }

              actionsContainer.appendChild(renameBtn)
              
              // 點擊頁面項目切換頁面
              pageItem.addEventListener('click', (e) => {
                if (e.target === pageItem || e.target === pageNameSpan) {
                  console.log('切換到頁面:', pageName)
                  editor.Pages.select(page)
                  updatePagesList()
                }
              })

              actionsContainer.appendChild(renameBtn)
                actionsContainer.appendChild(deleteBtn)
              }

              // 組裝頁面項目
              pageItem.appendChild(pageNameContainer)
              pageItem.appendChild(actionsContainer)
              
              // 點擊切換頁面
              pageItem.onclick = (e) => {
                if (e.target === pageItem || e.target === pageNameContainer || e.target === pageIcon || e.target === pageNameSpan) {
                  editor.Pages.select(page)
                  updatePagesList()
                }
              }

              pagesList.appendChild(pageItem)
            })
          }

          // 新增頁面事件
          addPageButton.onclick = async () => {
            console.log('點擊新增頁面')
            const newPageName = prompt('請輸入新頁面名稱:', `頁面 ${pages.length + 1}`)
            if (newPageName?.trim()) {
              const newPageId = `page-${Date.now()}`
              
              // 保存到 API
              const success = await pagesAPI.savePage(
                newPageId,
                newPageName.trim(),
                '<div style="padding: 20px;"><h1>' + newPageName.trim() + '</h1><p>這是新創建的頁面內容</p></div>',
                '',
                {},
                {}
              )
              
              if (success) {
                // 重新載入頁面列表並切換到新頁面
                await loadPages()
                setCurrentPageId(newPageId)
                await loadPageToEditor(newPageId, editor)
                updatePagesList()
              } else {
                alert('創建頁面失敗，請重試。')
              }
            }
          }

          // 組裝側欄
          sidebar.appendChild(pagesTitle)
          sidebar.appendChild(addPageButton)
          sidebar.appendChild(pagesList)

          // 添加到頁面
          document.body.appendChild(sidebar)

          // 在頁首添加控制按鈕
          addToggleButtonToHeader()

          // 監聽頁面變化事件
          editor.on('page:add page:remove page:select', () => {
            console.log('頁面變化事件觸發')
            if (isExpanded) {
              updatePagesList()
            }
          })

          // 初始化頁面列表
          updatePagesList()
          
          console.log('左側欄創建完成')
        }, 500)
      })

      // Add keyboard shortcuts
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
    }

    initEditor()

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy()
        editorInstance.current = null
      }
    }
  }, [onSave])

  return (
    <div style={{ 
      height: '100vh'
    }}>
      <div ref={editorRef}>
        <h1>Hello World Component!</h1>
        <p>This is a simple text paragraph.</p>
      </div>
    </div>
  )
}
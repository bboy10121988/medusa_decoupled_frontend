'use client'

import { useEffect, useRef, useState } from 'react'
import { grapesJSPageService, type GrapesJSPageData, type SavePageParams, type UpdatePageParams } from '@/lib/services/grapesjs-page-service'
import 'grapesjs/dist/css/grapes.min.css'
import './grapes-editor.css'

interface GrapesEditorWithSanityProps {
  pageId?: string // 如果提供則編輯現有頁面，否則創建新頁面
  onSave?: (pageData: GrapesJSPageData) => void
  onPageChange?: (pageId: string) => void
}

export default function GrapesEditorWithSanity({ 
  pageId, 
  onSave, 
  onPageChange 
}: GrapesEditorWithSanityProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<any>(null)
  const [pages, setPages] = useState<GrapesJSPageData[]>([])
  const [currentPage, setCurrentPage] = useState<GrapesJSPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 輔助函數
  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'preview':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'published':
        return '已發布'
      case 'preview':
        return '預覽'
      default:
        return '草稿'
    }
  }

  const getSaveStatus = () => {
    if (isSaving) {
      return (
        <span className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          儲存中...
        </span>
      )
    }
    
    if (hasUnsavedChanges) {
      return <span className="text-orange-600">有未儲存的變更</span>
    }
    
    if (lastSavedAt) {
      return <span>已儲存於 {lastSavedAt.toLocaleTimeString()}</span>
    }
    
    return null
  }

  // 載入頁面列表
  const loadPages = async () => {
    try {
      setIsLoading(true)
      const loadedPages = await grapesJSPageService.getAllPages()
      setPages(loadedPages)
      
      // 如果指定了 pageId，載入該頁面
      if (pageId) {
        const page = await grapesJSPageService.getPageById(pageId)
        if (page) {
          setCurrentPage(page)
        }
      } else if (loadedPages.length > 0) {
        // 如果沒有指定頁面，載入第一個頁面
        setCurrentPage(loadedPages[0])
      }
    } catch (error) {
      console.error('載入頁面失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化 GrapesJS 編輯器
  const initEditor = async () => {
    if (!editorRef.current || editorInstance.current) return

    // 動態載入 GrapesJS
    const grapesjs = (await import('grapesjs')).default
    const enhancedHomeModulesPlugin = (await import('./plugins/enhanced-home-modules')).default

    const editor = grapesjs.init({
      container: editorRef.current,
      width: '100%',
      height: '100vh',
      fromElement: true,
      showOffsets: true,
      noticeOnUnload: false,
      storageManager: false, // 停用預設儲存，我們用 Sanity
      
      blockManager: {
        appendTo: '#blocks-container',
      },
      
      layerManager: {
        appendTo: '#layers-container',
      },
      
      traitManager: {
        appendTo: '#traits-container',
      },
      
      selectorManager: {
        appendTo: '#styles-container',
      },
      
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: '<i class="fa fa-clone"></i>',
                command: 'sw-visibility',
              },
              {
                id: 'export',
                className: 'btn-open-export',
                label: '<i class="fa fa-code"></i>',
                command: 'export-template',
                context: 'export-template',
              },
              {
                id: 'show-json',
                className: 'btn-show-json',
                label: '<i class="fa fa-download"></i>',
                context: 'show-json',
                command: 'show-json',
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [
              {
                id: 'device-desktop',
                label: '<i class="fa fa-television"></i>',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
              },
              {
                id: 'device-tablet',
                label: '<i class="fa fa-tablet"></i>',
                command: 'set-device-tablet',
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: '<i class="fa fa-mobile"></i>',
                command: 'set-device-mobile',
                togglable: false,
              },
            ],
          },
          {
            id: 'panel-sanity',
            el: '.panel__sanity',
            buttons: [
              {
                id: 'save-to-sanity',
                className: 'btn-save-sanity',
                label: '<i class="fa fa-save"></i> 儲存到 Sanity',
                command: 'save-to-sanity',
              },
              {
                id: 'load-from-sanity',
                className: 'btn-load-sanity',
                label: '<i class="fa fa-upload"></i> 從 Sanity 載入',
                command: 'load-from-sanity',
              },
              {
                id: 'new-page',
                className: 'btn-new-page',
                label: '<i class="fa fa-plus"></i> 新頁面',
                command: 'create-new-page',
              },
            ],
          }
        ],
      },
      
      deviceManager: {
        devices: [
          {
            name: 'Desktop',
            width: '',
          },
          {
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          },
          {
            name: 'Mobile',
            width: '320px',
            widthMedia: '768px',
          },
        ]
      },
      
      plugins: [enhancedHomeModulesPlugin],
    })

    // 添加自訂命令
    editor.Commands.add('show-json', {
      run: (editor: any) => {
        editor.Modal.setTitle('Components JSON')
          .setContent(`<textarea style="width:100%; height: 250px;">
            ${JSON.stringify(editor.getComponents(), null, 2)}
          </textarea>`)
          .open()
      }
    })

    editor.Commands.add('save-to-sanity', {
      run: () => saveCurrentPage()
    })

    editor.Commands.add('load-from-sanity', {
      run: () => showPageSelector()
    })

    editor.Commands.add('create-new-page', {
      run: () => showNewPageDialog()
    })

    editor.Commands.add('set-device-desktop', {
      run: (editor: any) => editor.setDevice('Desktop')
    })
    
    editor.Commands.add('set-device-tablet', {
      run: (editor: any) => editor.setDevice('Tablet')
    })
    
    editor.Commands.add('set-device-mobile', {
      run: (editor: any) => editor.setDevice('Mobile')
    })

    // 監聽編輯器變更
    editor.on('component:add component:remove component:update style:update', () => {
      setHasUnsavedChanges(true)
    })

    editorInstance.current = editor

    // 如果有當前頁面，載入到編輯器
    if (currentPage) {
      loadPageToEditor(currentPage, editor)
    }
  }

  // 載入頁面內容到編輯器
  const loadPageToEditor = (page: GrapesJSPageData, editor: any) => {
    try {
      // 載入 HTML 和 CSS
      editor.setComponents(page.grapesHtml || '')
      editor.setStyle(page.grapesCss || '')
      
      // 如果有組件和樣式數據，使用 ProjectData 格式載入
      if (page.grapesComponents || page.grapesStyles) {
        const projectData: any = {
          assets: [],
          styles: [],
          pages: []
        }

        if (page.grapesStyles) {
          try {
            projectData.styles = JSON.parse(page.grapesStyles)
          } catch (e) {
            console.warn('Failed to parse grapesStyles:', e)
          }
        }

        if (page.grapesComponents) {
          try {
            const components = JSON.parse(page.grapesComponents)
            projectData.pages = [{
              frames: [{
                component: components
              }]
            }]
          } catch (e) {
            console.warn('Failed to parse grapesComponents:', e)
          }
        }

        editor.loadProjectData(projectData)
      }

      setHasUnsavedChanges(false)
      console.log('頁面載入成功:', page.title)
    } catch (error) {
      console.error('載入頁面到編輯器失敗:', error)
    }
  }

  // 儲存當前頁面
  const saveCurrentPage = async () => {
    if (!editorInstance.current || !currentPage) return

    try {
      setIsSaving(true)
      const editor = editorInstance.current
      
      // 獲取編輯器數據
      const html = editor.getHtml()
      const css = editor.getCss()
      const components = editor.getComponents()
      const styles = editor.getStyles()
      
      // 提取首頁模組數據（如果適用）
      const homeModules = extractHomeModulesFromComponents(components)

      const updateParams: UpdatePageParams = {
        _id: currentPage._id!,
        grapesHtml: html,
        grapesCss: css,
        grapesComponents: components,
        grapesStyles: styles,
        homeModules
      }

      const updatedPage = await grapesJSPageService.updatePage(updateParams)
      setCurrentPage(updatedPage)
      setLastSavedAt(new Date())
      setHasUnsavedChanges(false)
      
      // 更新頁面列表
      await loadPages()
      
      if (onSave) {
        onSave(updatedPage)
      }

      console.log('頁面儲存成功')
    } catch (error) {
      console.error('儲存頁面失敗:', error)
      alert('儲存失敗，請稍後再試')
    } finally {
      setIsSaving(false)
    }
  }

  // 創建新頁面
  const createNewPage = async (title: string, slug: string) => {
    if (!editorInstance.current) return

    try {
      setIsSaving(true)
      
      // 檢查 slug 是否可用
      const isSlugAvailable = await grapesJSPageService.isSlugAvailable(slug)
      if (!isSlugAvailable) {
        alert('此網址別名已被使用，請選擇其他名稱')
        return
      }

      const editor = editorInstance.current
      
      const saveParams: SavePageParams = {
        title,
        slug,
        description: `使用 GrapesJS 編輯器創建的 ${title}`,
        status: 'draft',
        grapesHtml: '<div><h1>新頁面</h1><p>開始編輯您的內容...</p></div>',
        grapesCss: '',
        grapesComponents: {},
        grapesStyles: {},
        homeModules: []
      }

      const newPage = await grapesJSPageService.createPage(saveParams)
      setCurrentPage(newPage)
      setHasUnsavedChanges(false)
      
      // 載入新頁面到編輯器
      loadPageToEditor(newPage, editor)
      
      // 更新頁面列表
      await loadPages()
      
      if (onPageChange) {
        onPageChange(newPage._id!)
      }

      console.log('新頁面創建成功:', newPage.title)
    } catch (error) {
      console.error('創建新頁面失敗:', error)
      alert('創建頁面失敗，請稍後再試')
    } finally {
      setIsSaving(false)
    }
  }

  // 顯示頁面選擇器
  const showPageSelector = () => {
    if (!editorInstance.current) return

    const editor = editorInstance.current
    const pageOptions = pages.map(page => 
      `<option value="${page._id}">${page.title} (${page.status})</option>`
    ).join('')

    editor.Modal.setTitle('選擇要載入的頁面')
      .setContent(`
        <div style="padding: 20px;">
          <label for="page-select">選擇頁面:</label>
          <select id="page-select" style="width: 100%; padding: 8px; margin: 10px 0;">
            ${pageOptions}
          </select>
          <div style="text-align: right; margin-top: 20px;">
            <button id="load-page-btn" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
              載入頁面
            </button>
          </div>
        </div>
      `)
      .open()

    // 綁定載入按鈕事件
    setTimeout(() => {
      const loadBtn = document.getElementById('load-page-btn')
      const selectEl = document.getElementById('page-select') as HTMLSelectElement
      
      if (loadBtn && selectEl) {
        loadBtn.onclick = async () => {
          const selectedPageId = selectEl.value
          if (selectedPageId) {
            const page = await grapesJSPageService.getPageById(selectedPageId)
            if (page) {
              setCurrentPage(page)
              loadPageToEditor(page, editor)
              if (onPageChange) {
                onPageChange(page._id!)
              }
            }
          }
          editor.Modal.close()
        }
      }
    }, 100)
  }

  // 顯示新頁面對話框
  const showNewPageDialog = () => {
    if (!editorInstance.current) return

    const editor = editorInstance.current
    
    editor.Modal.setTitle('創建新頁面')
      .setContent(`
        <div style="padding: 20px;">
          <div style="margin-bottom: 15px;">
            <label for="page-title">頁面標題:</label>
            <input id="page-title" type="text" style="width: 100%; padding: 8px; margin: 5px 0;" placeholder="輸入頁面標題">
          </div>
          <div style="margin-bottom: 15px;">
            <label for="page-slug">網址別名:</label>
            <input id="page-slug" type="text" style="width: 100%; padding: 8px; margin: 5px 0;" placeholder="輸入網址別名 (例: about-us)">
          </div>
          <div style="text-align: right; margin-top: 20px;">
            <button id="create-page-btn" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
              創建頁面
            </button>
          </div>
        </div>
      `)
      .open()

    // 綁定創建按鈕事件
    setTimeout(() => {
      const createBtn = document.getElementById('create-page-btn')
      const titleInput = document.getElementById('page-title') as HTMLInputElement
      const slugInput = document.getElementById('page-slug') as HTMLInputElement
      
      if (createBtn && titleInput && slugInput) {
        // 自動生成 slug
        titleInput.oninput = () => {
          const slug = titleInput.value
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
            .replace(/-+/g, '-')
            .replace(/(^-)|(-$)/g, '')
          slugInput.value = slug
        }

        createBtn.onclick = async () => {
          const title = titleInput.value.trim()
          const slug = slugInput.value.trim()
          
          if (!title || !slug) {
            alert('請填寫完整的頁面資訊')
            return
          }
          
          await createNewPage(title, slug)
          editor.Modal.close()
        }
      }
    }, 100)
  }

  // 從組件中提取首頁模組數據
  const extractHomeModulesFromComponents = (components: any): any[] => {
    const modules: any[] = []
    
    // 這裡可以實現邏輯來掃描組件樹並提取首頁模組的配置
    // 暫時返回空陣列，可以根據需要實現
    
    return modules
  }

  // 自動儲存功能
  useEffect(() => {
    if (!hasUnsavedChanges || !currentPage) return

    const autoSaveTimer = setTimeout(() => {
      saveCurrentPage()
    }, 30000) // 30秒後自動儲存

    return () => clearTimeout(autoSaveTimer)
  }, [hasUnsavedChanges, currentPage])

  // 頁面卸載前提醒儲存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '您有未儲存的變更，確定要離開嗎？'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // 組件初始化
  useEffect(() => {
    loadPages()
  }, [pageId])

  useEffect(() => {
    if (!isLoading) {
      initEditor()
    }
  }, [isLoading, currentPage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>載入編輯器中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="gjs-editor-wrapper">
      {/* 頂部工具列 */}
      <div className="gjs-toolbar bg-white border-b border-gray-200 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="panel__basic-actions flex space-x-2"></div>
          <div className="panel__devices flex space-x-2"></div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 頁面資訊 */}
          {currentPage && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{currentPage.title}</span>
              <span className="mx-2">•</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(currentPage.status)}`}>
                {getStatusText(currentPage.status)}
              </span>
            </div>
          )}
          
          {/* 儲存狀態 */}
          <div className="text-sm text-gray-500">
            {getSaveStatus()}
          </div>
          
          <div className="panel__sanity flex space-x-2"></div>
        </div>
      </div>

      {/* 編輯器主體 */}
      <div className="gjs-editor-container flex h-screen">
        {/* 左側面板 */}
        <div className="gjs-sidebar-left w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">區塊</h3>
          </div>
          <div id="blocks-container" className="flex-1 overflow-y-auto"></div>
        </div>

        {/* 中央畫布 */}
        <div className="flex-1 bg-gray-100">
          <div ref={editorRef} className="h-full"></div>
        </div>

        {/* 右側面板 */}
        <div className="gjs-sidebar-right w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">屬性</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* 組件設定 */}
            <div className="border-b border-gray-200">
              <div className="p-3">
                <h4 className="font-medium text-gray-700 mb-2">組件設定</h4>
                <div id="traits-container"></div>
              </div>
            </div>
            
            {/* 樣式管理 */}
            <div className="border-b border-gray-200">
              <div className="p-3">
                <h4 className="font-medium text-gray-700 mb-2">樣式管理</h4>
                <div id="styles-container"></div>
              </div>
            </div>
            
            {/* 圖層管理 */}
            <div>
              <div className="p-3">
                <h4 className="font-medium text-gray-700 mb-2">圖層</h4>
                <div id="layers-container"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useRef, useState } from 'react'
import { grapesJSPageService, type GrapesJSPageData, type SavePageParams, type UpdatePageParams } from '@/lib/services/grapesjs-page-service'
import 'grapesjs/dist/css/grapes.min.css'
import './grapes-editor.css'

interface GrapesEditorProps {
  onSave?: (content: string) => void
}

export default function GrapesEditor({ onSave }: GrapesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<any>(null)
  const [pages, setPages] = useState<GrapesJSPageData[]>([])
  const [currentPageId, setCurrentPageId] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<GrapesJSPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 載入頁面列表
  const loadPages = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 開始載入 Sanity 頁面...')
      
      const loadedPages = await grapesJSPageService.getAllPages()
      console.log('📄 載入的頁面數量:', loadedPages.length)
      
      setPages(loadedPages)
      
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
          if (createError.message?.includes('需要 Sanity 寫入權限') || 
              createError.message?.includes('Sanity 寫入權限不足')) {
            alert('⚠️ 需要設定 Sanity Token\n\n' + createError.message)
          } else {
            alert('創建默認頁面失敗: ' + createError.message)
          }
        }
      } else {
        const firstPage = loadedPages[0]
        setCurrentPage(firstPage)
        setCurrentPageId(firstPage._id!)
      }
    } catch (error) {
      console.error('載入頁面失敗:', error)
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

        if (!editorRef.current) {
          console.error('編輯器容器不存在')
          return
        }

        const container = editorRef.current
        container.setAttribute('data-grapesjs-managed', 'true')
        
        try {
          container.textContent = ''
          await new Promise<void>(resolve => queueMicrotask(() => resolve()))
        } catch (error) {
          console.warn('清理容器時出現錯誤:', error)
          container.innerHTML = ''
        }

        const editor = grapesjs.init({
          container: editorRef.current!,
          fromElement: false,
          height: '100vh',
          width: 'auto',
          
          avoidInlineStyle: false,
          
          storageManager: {
            type: 'none'
          },

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

          canvas: {
            styles: [
              'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
              'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
            ],
            scripts: [
              'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js'
            ]
          },
          
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

        // 添加工具列按鈕
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
            
            const success = await saveCurrentPage(editor)
            if (success) {
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
              await saveCurrentPage(editor)
              
              const updateParams = {
                _id: currentPage._id!,
                status: 'published' as const
              }
              
              const updatedPage = await grapesJSPageService.updatePage(updateParams)
              setCurrentPage(updatedPage)
              
              alert('頁面已發布成功！')
              
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

        // 載入當前頁面
        editor.on('load', () => {
          setTimeout(() => {
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

        ;(window as any).grapesEditor = editor
        editorInstance.current = editor

      } catch (error) {
        console.error('初始化編輯器時出現錯誤:', error)
      }
    }

    initEditor()

    return () => {
      if (editorInstance.current) {
        try {
          editorInstance.current.off()
          
          const container = editorRef.current
          if (container) {
            requestAnimationFrame(() => {
              try {
                container.innerHTML = ''
              } catch (error) {
                console.warn('清理容器時出現錯誤:', error)
              }
            })
          }
          
          editorInstance.current.destroy()
        } catch (error) {
          console.warn('銷毀編輯器時出現錯誤:', error)
        } finally {
          editorInstance.current = null
          ;(window as any).grapesEditor = null
        }
      }
    }
  }, [onSave, isLoading, pages.length])

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
        {/* GrapesJS 會在這裡渲染編輯器 */}
      </div>
    </div>
  )
}
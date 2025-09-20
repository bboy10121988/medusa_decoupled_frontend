'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { grapesJSPageService, type GrapesJSPageData } from '@/lib/services/grapesjs-page-service'
import 'grapesjs/dist/css/grapes.min.css'

interface GrapesEditorProps {
  readonly pageId?: string
  readonly onSave?: (pageData: GrapesJSPageData) => void
}

export default function GrapesEditor({ pageId, onSave }: GrapesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState<GrapesJSPageData | null>(null)

  // 保存頁面函數
  const handleSave = useCallback(async () => {
    if (!editor || !currentPage?._id) {
      console.warn('編輯器或當前頁面未準備好')
      return
    }

    try {
      console.log('🔄 開始保存頁面:', currentPage.title)
      
      const html = editor.getHtml()
      const css = editor.getCss()
      
      // 清理 HTML 內容
      let finalHtml = html
        .replace(/<\/?body[^>]*>/gi, '')
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<\/?head[^>]*>/gi, '')
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        .trim()

      // 更新頁面數據
      const updatedPage = await grapesJSPageService.updatePage({
        _id: currentPage._id,
        grapesHtml: finalHtml,
        grapesCss: css,
        status: currentPage.status || 'draft'
      })

      if (updatedPage) {
        console.log('✅ 頁面保存成功!')
        setCurrentPage({ ...currentPage, ...updatedPage })
        if (onSave) {
          onSave(updatedPage)
        }
      }
    } catch (error) {
      console.error('❌ 保存頁面時發生錯誤:', error)
    }
  }, [editor, currentPage, onSave])

  // 註冊保存命令和快捷鍵
  useEffect(() => {
    if (!editor) return

    editor.Commands.add('custom-save', {
      run: () => {
        handleSave()
      }
    })

    editor.Keymaps.add('custom-save', 'ctrl+s', 'custom-save')
    editor.Keymaps.add('custom-save-mac', 'cmd+s', 'custom-save')

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, handleSave])

  useEffect(() => {
    const initEditor = async () => {
      if (!editorRef.current) {
        setTimeout(initEditor, 50)
        return
      }

      if (!document.contains(editorRef.current)) {
        setTimeout(initEditor, 50)
        return
      }

      try {
        console.log('🚀 初始化 GrapesJS 編輯器（官方 demo 配置）...')
        
        const grapesjs = (await import('grapesjs')).default
        const pluginWebpage = (await import('grapesjs-preset-webpage')).default

        const editorInstance = grapesjs.init({
          // 容器
          container: editorRef.current,
          
          // 基本設置（類似官方 demo）
          height: '100vh',
          width: 'auto',
          storageManager: false,
          
          // 插件配置（官方 demo 使用的插件）
          plugins: [pluginWebpage],
          pluginsOpts: {
            [pluginWebpage]: {
              blocks: ['link-block', 'quote', 'text-basic'],
              modalImportTitle: '導入模板',
              modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">貼上您的 HTML/CSS 並點擊導入</div>',
              modalImportContent: function(editor: any) {
                return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
              },
            }
          },

          // 區塊管理器設置
          blockManager: {
            appendTo: '#blocks',
            blocks: [
              // 基本區塊
              {
                id: '1-column',
                label: '1 Column',
                category: 'Basic',
                content: '<div class="row"><div class="col-12" data-gjs-highlightable="1" data-gjs-type="column"><div data-gjs-type="text">Insert your text here</div></div></div>'
              },
              {
                id: '2-columns',
                label: '2 Columns', 
                category: 'Basic',
                content: '<div class="row"><div class="col-6" data-gjs-highlightable="1" data-gjs-type="column"><div data-gjs-type="text">Insert your text here</div></div><div class="col-6" data-gjs-highlightable="1" data-gjs-type="column"><div data-gjs-type="text">Insert your text here</div></div></div>'
              },
              {
                id: '3-columns',
                label: '3 Columns',
                category: 'Basic',
                content: '<div class="row"><div class="col-4" data-gjs-highlightable="1" data-gjs-type="column"><div data-gjs-type="text">Insert your text here</div></div><div class="col-4" data-gjs-highlightable="1" data-gjs-type="column"><div data-gjs-type="text">Insert your text here</div></div><div class="col-4" data-gjs-highlightable="1" data-gjs-type="column"><div data-gjs-type="text">Insert your text here</div></div></div>'
              },
              {
                id: 'text',
                label: 'Text',
                category: 'Basic',
                content: '<div data-gjs-type="text">Insert your text here</div>'
              },
              {
                id: 'image',
                label: 'Image',
                category: 'Basic',
                content: { type: 'image' }
              },
              {
                id: 'video',
                label: 'Video',
                category: 'Basic',
                content: { type: 'video' }
              }
            ]
          },

          // Canvas 設置
          canvas: {
            styles: [
              'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
            ],
            scripts: [
              'https://code.jquery.com/jquery-3.3.1.slim.min.js',
              'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js',
              'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js'
            ],
          },

          // 層級管理器設置
          layerManager: {
            appendTo: '#panels'
          },

          // 樣式管理器設置  
          styleManager: {
            appendTo: '#panels',
            sectors: [{
              name: 'Dimension',
              open: false,
              buildProps: ['width', 'min-height', 'padding']
            }, {
              name: 'Extra',
              open: false,
              buildProps: ['background-color', 'box-shadow']
            }]
          },

          // 默認內容
          components: '<div class="txt-red">Hello World Component!</div>',
          style: '.txt-red{color: red}',
        })

        console.log('✅ 編輯器初始化完成')
        setEditor(editorInstance)

        // 載入頁面
        if (pageId) {
          setTimeout(() => {
            loadPageWithEditor(editorInstance, pageId)
          }, 100)
        }
        
      } catch (error) {
        console.error('❌ 編輯器初始化失敗:', error)
      }
    }

    const timer = setTimeout(initEditor, 0)
    return () => {
      clearTimeout(timer)
    }
  }, [pageId])

  // 載入頁面的輔助函數
  const loadPageWithEditor = async (editorInstance: any, pageIdToLoad: string) => {
    try {
      console.log('🔄 載入頁面:', pageIdToLoad)
      const pageData = await grapesJSPageService.getPageById(pageIdToLoad)
      
      if (!pageData) {
        console.warn('⚠️ 找不到頁面數據')
        return
      }

      console.log('📄 找到頁面數據:', pageData.title)
      
      // 載入頁面內容
      if (pageData.grapesHtml) {
        editorInstance.setComponents(pageData.grapesHtml)
      }
      
      if (pageData.grapesCss) {
        editorInstance.setStyle(pageData.grapesCss)
      }
      
      setCurrentPage(pageData)
      console.log('✅ 頁面載入完成')
    } catch (error) {
      console.error('❌ 載入頁面失敗:', error)
    }
  }

  // 當 pageId 改變時載入對應頁面
  useEffect(() => {
    if (pageId && editor) {
      loadPageWithEditor(editor, pageId)
    }
  }, [pageId, editor])

  return (
    <div className="w-full h-full">
      {/* 工具欄 */}
      <div className="bg-gray-800 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            {currentPage ? `編輯頁面: ${currentPage.title}` : 'GrapesJS 編輯器'}
          </h2>
          <div className="text-sm text-gray-300">
            狀態: {currentPage?.status || '未載入'}
          </div>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          title="Ctrl+S / Cmd+S"
        >
          💾 保存
        </button>
      </div>

      {/* 編輯器容器 - 配置面板和區塊管理器的佈局 */}
      <div className="w-full h-[calc(100vh-60px)] flex">
        {/* 左側面板 - 區塊管理器 */}
        <div id="blocks" className="gjs-blocks-c w-64 border-r border-gray-200 overflow-y-auto bg-white"></div>
        
        {/* 中央編輯區 */}
        <div className="flex-1 relative">
          <div ref={editorRef} className="w-full h-full" />
        </div>
        
        {/* 右側面板 - 圖層和樣式管理器 */}
        <div id="panels" className="gjs-pn-views-container w-64 border-l border-gray-200 overflow-y-auto bg-white"></div>
      </div>
    </div>
  )
}
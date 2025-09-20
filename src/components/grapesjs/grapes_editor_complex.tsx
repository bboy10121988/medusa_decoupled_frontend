'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { grapesJSPageService, type GrapesJSPageData } from '@/lib/services/grapesjs-page-service'
import loadCustomPlugins from './plugins'
import 'grapesjs/dist/css/grapes.min.css'
import './grapes-editor-panels.css'

interface GrapesEditorProps {
  readonly pageId?: string
  readonly onSave?: (pageData: GrapesJSPageData) => void
}

export default function GrapesEditor({ pageId, onSave }: GrapesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState<GrapesJSPageData | null>(null)

  // 保存頁面函數 - 使用 useCallback 確保引用穩定
  const handleSave = useCallback(async () => {
    if (!editor || !currentPage?._id) {
      console.warn('編輯器或當前頁面未準備好', { 
        hasEditor: !!editor, 
        hasPage: !!currentPage,
        pageId: currentPage?._id 
      })
      return
    }

    try {
      console.log('🔄 開始保存頁面:', currentPage.title)
      
      // 獲取基本編輯器內容
      const html = editor.getHtml()
      const css = editor.getCss()
      
      // 清理 HTML 內容，移除可能導致 hydration 問題的標籤
      let finalHtml = html
        .replace(/<\/?body[^>]*>/gi, '')
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<\/?head[^>]*>/gi, '')
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        .trim()
      
      const finalCss = css
      
      console.log('📊 最終內容統計:', {
        originalHtmlLength: html.length,
        finalHtmlLength: finalHtml.length,
        originalCssLength: css.length,
        finalCssLength: finalCss.length,
        currentPageId: currentPage._id
      })

      // 更新頁面數據
      const updatedPage = await grapesJSPageService.updatePage({
        _id: currentPage._id,
        grapesHtml: finalHtml,
        grapesCss: finalCss,
        status: currentPage.status || 'draft'
      })

      if (updatedPage) {
        console.log('✅ 頁面保存成功!')
        
        // 更新當前頁面狀態
        setCurrentPage({ ...currentPage, ...updatedPage })
        
        // 調用外部回調
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

    // 添加保存命令
    editor.Commands.add('custom-save', {
      run: (editor: any) => {
        console.log('執行自定義保存命令')
        handleSave()
      }
    })

    // 註冊 Ctrl+S 快捷鍵
    editor.Keymaps.add('custom-save', 'ctrl+s', 'custom-save')
    editor.Keymaps.add('custom-save-mac', 'cmd+s', 'custom-save')

    // 防止瀏覽器默認的 Ctrl+S 行為
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
    // 確保 DOM 已準備好
    const initEditor = async () => {
      // 檢查容器是否存在
      if (!editorRef.current) {
        console.warn('編輯器容器未準備好，等待 DOM...')
        setTimeout(initEditor, 50)
        return
      }

      // 確保容器已經掛載到 DOM
      if (!document.contains(editorRef.current)) {
        console.warn('容器尚未掛載到 DOM，稍後重試...')
        setTimeout(initEditor, 50)
        return
      }

      try {
        console.log('🚀 開始初始化 GrapesJS 編輯器...')
        console.log('📋 容器元素:', editorRef.current)
        
        const grapesjs = (await import('grapesjs')).default
        const pluginWebpage = (await import('grapesjs-preset-webpage')).default
        
        // 只載入必要的插件
        const pluginBasicBlocks = (await import('grapesjs-blocks-basic')).default

        console.log('📦 基本插件載入完成')
        
        // 確保容器仍然存在且有效
        if (!editorRef.current) {
          console.error('❌ 容器在初始化過程中消失了')
          return
        }
        
        console.log('✅ 容器確認存在，開始初始化 GrapesJS...')
        
        const editorInstance = grapesjs.init({
          container: editorRef.current,
          height: '100vh',
          width: 'auto',
          storageManager: false, // 暫時禁用存儲管理器
          // 加載基本插件
          plugins: [
            pluginWebpage,
            pluginBasicBlocks
          ],
          pluginsOpts: {
            [pluginWebpage]: {
              blocks: ['link-block', 'quote', 'text-basic'],
              modalImportTitle: '導入模板',
              modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">貼上您的 HTML/CSS，然後點擊導入</div>',
              modalImportContent: function(editor: any) {
                return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
              },
            },
            [pluginBasicBlocks]: {
              blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image'],
              flexGrid: true,
            }
          },
        // 設備管理器配置
        deviceManager: {
          devices: [
            {
              name: '桌面',
              width: '',
            },
            {
              name: '平板',
              width: '768px',
              widthMedia: '992px',
            },
            {
              name: '手機',
              width: '320px',
              widthMedia: '768px',
            }
          ]
        },
        // 移除自定義面板配置，使用默認配置
        // blockManager: {
        //   appendTo: '.blocks-container',
        // },
        // layerManager: {
        //   appendTo: '.layers-container'
        // },
        // styleManager: {
        //   appendTo: '.styles-container',
        //   sectors: [{
        //     name: '一般',
        //     open: false,
        //     buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
        //   },{
        //     name: '尺寸',
        //     open: false,
        //     buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
        //   },{
        //     name: '文字',
        //     open: false,
        //     buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'],
        //   },{
        //     name: '裝飾',
        //     open: false,
        //     buildProps: ['opacity', 'border-radius', 'border', 'box-shadow', 'background'],
        //   }]
        // }
      })

        console.log('✅ 編輯器初始化完成')
        
        setEditor(editorInstance)

        // 確保面板正確顯示
        console.log('📋 設置面板可見性...')
        
        // 配置面板顯示
        const setupPanels = () => {
          const commands = editorInstance.Commands
          
          // 列出所有可用命令
          const allCommands = commands.getAll()
          const commandIds = Object.keys(allCommands)
          console.log('🎛️ 可用命令:', commandIds.filter(cmd => cmd.includes('blocks') || cmd.includes('layers') || cmd.includes('open')))
          
          // 嘗試不同的面板打開命令
          const panelCommands = [
            'open-blocks',
            'show-blocks', 
            'open-layers',
            'show-layers',
            'open-sm',
            'open-tm'
          ]
          
          panelCommands.forEach(cmd => {
            if (commands.has(cmd)) {
              commands.run(cmd)
              console.log(`✅ 執行命令: ${cmd}`)
            }
          })
          
          // 檢查組件庫
          const blockManager = editorInstance.BlockManager
          if (blockManager) {
            const blocks = blockManager.getAll()
            console.log('📦 組件庫載入完成，共', blocks.length, '個組件')
          }
          
          // 檢查圖層管理器
          const layerManager = editorInstance.LayerManager  
          if (layerManager) {
            console.log('📋 圖層管理器載入完成')
          }
        }
        
        // 延遲執行面板設置
        setTimeout(setupPanels, 500)

        console.log('📋 面板配置完成')

        // 等待編輯器完全初始化後再載入頁面
        setTimeout(() => {
          if (pageId) {
            loadPageWithEditor(editorInstance, pageId)
          }
        }, 100)
        
      } catch (error) {
        console.error('❌ 編輯器初始化失敗:', error)
      }
    }

    // 使用 setTimeout 確保組件掛載完成後再初始化
    const timer = setTimeout(initEditor, 0)
    
    return () => {
      clearTimeout(timer)
    }
  }, [pageId]) // 添加 pageId 作為依賴項

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
      loadPageContent(editorInstance, pageData)
      
      setCurrentPage(pageData)
      console.log('✅ 頁面載入完成')
    } catch (error) {
      console.error('❌ 載入頁面失敗:', error)
    }
  }

  // 載入頁面內容的輔助函數
  const loadPageContent = (editorInstance: any, pageData: any) => {
    if (pageData.grapesHtml) {
      console.log('載入 HTML 內容')
      editorInstance.setComponents(pageData.grapesHtml)
    }
    
    if (pageData.grapesCss) {
      console.log('載入 CSS 樣式')
      editorInstance.setStyle(pageData.grapesCss)
    }
    
    loadComponentsData(editorInstance, pageData)
    loadStylesData(pageData)
  }

  // 載入組件數據
  const loadComponentsData = (editorInstance: any, pageData: any) => {
    if (!pageData.grapesComponents) return
    
    try {
      const components = JSON.parse(pageData.grapesComponents)
      console.log('載入組件數據:', components.length, '個組件')
      editorInstance.loadProjectData({ components })
    } catch (e) {
      console.warn('無法解析組件數據:', e)
    }
  }

  // 載入樣式數據
  const loadStylesData = (pageData: any) => {
    if (!pageData.grapesStyles) return
    
    try {
      const styles = JSON.parse(pageData.grapesStyles)
      console.log('載入樣式數據:', styles.length, '個樣式')
      // 注意：GrapesJS 的樣式載入可能需要特殊處理
      // 這裡先跳過，主要依靠 CSS 和組件數據
    } catch (e) {
      console.warn('無法解析樣式數據:', e)
    }
  }

  // 當 pageId 改變時載入對應頁面
  useEffect(() => {
    if (pageId && editor) {
      loadPageWithEditor(editor, pageId)
    }
  }, [pageId, editor])

  return <div ref={editorRef} style={{ height: '100vh' }} />
}
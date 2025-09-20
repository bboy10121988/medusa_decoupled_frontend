'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { grapesJSPageService, type GrapesJSPageData } from '@/lib/services/grapesjs-page-service'
import loadCustomPlugins from './plugins'
import 'grapesjs/dist/css/grapes.min.css'

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
    if (!editor || !currentPage) {
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
      const components = editor.getComponents()
      
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
        hasComponents: components.length > 0
      })
      
      // 獲取樣式 - 使用正確的 API 並處理可能的 undefined
      const stylesManager = editor.StyleManager
      const styles = stylesManager?.getAll()?.models || []

      // 轉換為字符串格式
      const componentsJson = JSON.stringify(components)
      const stylesJson = JSON.stringify(styles)

      console.log('📄 頁面內容準備保存:', {
        htmlLength: finalHtml.length,
        cssLength: finalCss.length,
        hasComponents: components.length > 0,
        hasStyles: styles.length > 0
      })

      // 更新頁面數據 - 使用增強的內容
      const updatedPage = await grapesJSPageService.updatePage({
        _id: currentPage._id!,
        grapesHtml: finalHtml,
        grapesCss: finalCss,
        grapesComponents: componentsJson,
        grapesStyles: stylesJson
      })

      console.log('✅ 頁面保存成功:', updatedPage._id)
      
      // 更新當前頁面狀態
      setCurrentPage(updatedPage)
      
      // 調用外部回調
      onSave?.(updatedPage)
      
      // 在編輯器中顯示成功提示
      const saveButton = editor.Panels?.getButton?.('options', 'save-page')
      if (saveButton) {
        const originalIcon = saveButton.get('attributes')?.className || 'fa fa-save'
        saveButton.set('attributes', { ...saveButton.get('attributes'), className: 'fa fa-check', title: '已保存' })
        
        // 3秒後恢復原圖標
        setTimeout(() => {
          saveButton.set('attributes', { ...saveButton.get('attributes'), className: originalIcon, title: '保存頁面' })
        }, 3000)
      }
      
    } catch (error) {
      console.error('❌ 保存頁面失敗:', error)
      
      // 在編輯器中顯示錯誤提示
      const saveButton = editor.Panels?.getButton?.('options', 'save-page')
      if (saveButton) {
        const originalIcon = saveButton.get('attributes')?.className || 'fa fa-save'
        saveButton.set('attributes', { ...saveButton.get('attributes'), className: 'fa fa-times', title: '保存失敗' })
        
        // 5秒後恢復原圖標
        setTimeout(() => {
          saveButton.set('attributes', { ...saveButton.get('attributes'), className: originalIcon, title: '保存頁面' })
        }, 5000)
      }
      
      // 拋出錯誤以便外部處理
      throw error
    }
  }, [editor, currentPage, onSave])

  // 當編輯器和保存函數都準備好後，註冊命令和快捷鍵
  useEffect(() => {
    if (!editor) return

    // 添加自定義命令
    editor.Commands.add('save-page', {
      run: handleSave
    })

    // 添加快捷鍵 Ctrl+S 或 Cmd+S
    editor.Keymaps.add('save-page', 'ctrl+s, cmd+s', 'save-page')

    // 添加工具欄按鈕（如果還沒有的話）
    const existingButton = editor.Panels.getButton('options', 'save-page')
    if (!existingButton) {
      editor.Panels.addButton('options', [
        {
          id: 'save-page',
          className: 'fa fa-save',
          command: 'save-page',
          attributes: { title: '保存頁面 (Ctrl+S)' }
        }
      ])
    }

    // 添加測試按鈕來查看完整輸出
    editor.Panels.addButton('options', [
      {
        id: 'test-output',
        className: 'fa fa-eye',
        command: 'test-output',
        attributes: { title: '查看完整 HTML 輸出' }
      }
    ])

    editor.Commands.add('test-output', {
      run: () => {
        const html = editor.getHtml()
        const css = editor.getCss()
        const components = editor.getComponents()
        
        // 獲取完整的組件樹內容，包括內聯樣式和腳本
        const getFullContent = (comps: any[]) => {
          let fullHtml = ''
          let inlineCss = ''
          let inlineJs = ''
          
          comps.forEach((comp: any) => {
            const compHtml = comp.toHTML ? comp.toHTML() : comp.get('content') || ''
            fullHtml += compHtml
            
            // 檢查組件的樣式和腳本
            const style = comp.get('style') || comp.getStyle?.() || ''
            const script = comp.get('script') || comp.getScript?.() || ''
            
            if (style) inlineCss += `\n/* Component ${comp.get('tagName')} styles */\n${style}`
            if (script) inlineJs += `\n/* Component ${comp.get('tagName')} script */\n${script}`
            
            // 遞歸處理子組件
            const children = comp.get('components') || comp.components?.models || []
            if (children.length > 0) {
              const childContent = getFullContent(children)
              fullHtml += childContent.html
              inlineCss += childContent.css
              inlineJs += childContent.js
            }
          })
          
          return { html: fullHtml, css: inlineCss, js: inlineJs }
        }
        
        const fullContent = getFullContent(components)
        const allCss = css + fullContent.css
        const allJs = fullContent.js
        
        console.log('=== 基本 HTML ===')
        console.log(html)
        console.log('=== 完整 HTML（含組件內容）===')
        console.log(fullContent.html)
        console.log('=== 基本 CSS ===')
        console.log(css)
        console.log('=== 完整 CSS（含內聯樣式）===')
        console.log(allCss)
        console.log('=== JavaScript ===')
        console.log(allJs)
        
        const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
${allCss}
  </style>
</head>
<body>
${html}
${allJs ? `<script>${allJs}</script>` : ''}
</body>
</html>`
        
        // 在新視窗中打開完整 HTML
        const newWindow = window.open()
        if (newWindow) {
          newWindow.document.write(fullHtml)
          newWindow.document.close()
        } else {
          // 如果彈出視窗被阻擋，顯示在控制台
          console.log('完整 HTML 輸出:')
          console.log(fullHtml)
          alert('完整 HTML 已輸出到控制台 (F12)')
        }
      }
    })

    console.log('✅ 保存命令、快捷鍵和測試功能已註冊')
  }, [editor, handleSave])

  useEffect(() => {
    // 確保 DOM 已準備好
    const initEditor = async () => {
      // 首先檢查是否已經初始化過
      if (editor) {
        console.log('📋 編輯器已存在，跳過初始化')
        return
      }

      // 等待 DOM 完全準備好
      if (typeof window === 'undefined') {
        console.log('⏳ 服務器端渲染環境，等待客戶端...')
        return
      }

      // 使用更強健的容器檢查
      const checkContainer = () => {
        if (!editorRef.current) {
          console.log('⏳ 編輯器 ref 尚未設置')
          return false
        }

        if (!editorRef.current.isConnected) {
          console.log('⏳ 編輯器容器尚未連接到 DOM')
          return false
        }

        // 檢查容器是否真的在頁面上
        const containerInDOM = document.contains(editorRef.current)
        if (!containerInDOM) {
          console.log('⏳ 編輯器容器不在 DOM 中')
          return false
        }

        // 檢查容器尺寸
        const rect = editorRef.current.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) {
          console.log('⏳ 編輯器容器尺寸為 0，等待布局完成...', { width: rect.width, height: rect.height })
          return false
        }

        return true
      }

      // 容器檢查和重試邏輯
      const retryCount = (initEditor as any).retryCount || 0
      if (!checkContainer()) {
        console.log(`⏳ 編輯器容器尚未準備好，等待中... (嘗試 ${retryCount + 1}/30)`)
        
        if (retryCount < 30) { // 增加重試次數到 30 次
          ;(initEditor as any).retryCount = retryCount + 1
          setTimeout(initEditor, 200) // 增加等待時間到 200ms
        } else {
          console.error('❌ 編輯器初始化失敗：容器在 30 次嘗試後仍未準備好')
          // 嘗試強制初始化
          if (editorRef.current) {
            console.warn('⚠️ 嘗試強制初始化編輯器...')
          } else {
            return
          }
        }
        
        if (retryCount < 30) {
          return
        }
      }

      // 重置重試計數器
      ;(initEditor as any).retryCount = 0

      try {
        console.log('🚀 開始初始化 GrapesJS 編輯器...')
        console.log('✅ 編輯器容器已準備好:', {
          container: editorRef.current,
          isConnected: editorRef.current?.isConnected,
          rect: editorRef.current?.getBoundingClientRect(),
          id: editorRef.current?.id
        })
        
        const grapesjs = (await import('grapesjs')).default
        const pluginWebpage = (await import('grapesjs-preset-webpage')).default
        
        // 動態導入額外的插件
        const pluginBasicBlocks = (await import('grapesjs-blocks-basic')).default
        const pluginForms = (await import('grapesjs-plugin-forms')).default
        const pluginTabs = (await import('grapesjs-tabs')).default
        const pluginTyped = (await import('grapesjs-typed')).default
        const pluginCountdown = (await import('grapesjs-component-countdown')).default
        const pluginTooltip = (await import('grapesjs-tooltip')).default
        const pluginScriptEditor = (await import('grapesjs-script-editor')).default
        
        // 導入代碼編輯器插件
        const pluginCodeEditor = (await import('grapesjs-component-code-editor')).default
        
        // 導入 Carousel 插件
        const pluginCarousel = (await import('grapesjs-carousel-component')).default
        
        // 導入修復 carousel slide 的插件
        const fixCarouselSlide = (await import('./plugins/fix-carousel-slide')).default
        
        // 導入修復 HTML 代碼組件的插件
        const fixHtmlCodeComponent = (await import('./plugins/fix-html-code-component')).default
        
        console.log('📦 所有插件模組載入完成，包含代碼編輯器和 Carousel 插件')
        
        // 獲取自定義插件
        const customPlugins = loadCustomPlugins()
        console.log('🎯 已載入自定義插件:', customPlugins)

        const editorInstance = grapesjs.init({
          container: editorRef.current!,
          height: '100vh',
          width: 'auto',
          // 加載插件 - 移除內聯的自定義組件定義
          plugins: [
            pluginWebpage,
            pluginBasicBlocks,
            pluginForms, 
            pluginTabs,
            pluginTyped,
            pluginCountdown,
            pluginTooltip,
            pluginScriptEditor,
            pluginCodeEditor,
            pluginCarousel,
            fixCarouselSlide, // 修復插件
            fixHtmlCodeComponent, // 修復 HTML 代碼組件
            (await import('./plugins/safe-tailwind-components')).default, // 安全 Tailwind 組件
            // 添加自定義插件
            ...customPlugins.map(p => p.plugin)
          ],
        pluginsOpts: {
          [pluginWebpage]: {
            // 基本配置，確保面板顯示
            blocksBasicOpts: {
              flexGrid: true,
            }
          },
          [pluginBasicBlocks]: {
            // 自定義基本塊配置
            flexGrid: true,
            blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video', 'map'],
          },
          [pluginForms]: {
            // 表單插件配置
            blocks: ['form', 'input', 'textarea', 'select', 'button', 'label', 'checkbox', 'radio'],
          },
          [pluginTabs]: {
            // 標籤頁插件配置
            tabsBlock: {
              category: 'Extra'
            }
          },
          [pluginTyped]: {
            // 打字動畫插件配置
            block: {
              category: 'Extra',
              content: {
                type: 'typed',
                strings: ['輸入您的文字...', '編輯此動畫文字'],
                typeSpeed: 40,
                backSpeed: 40,
                loop: true
              }
            }
          },
          [pluginCountdown]: {
            // 倒數計時器插件配置
            block: {
              category: 'Extra',
              label: '倒數計時器',
              content: {
                type: 'countdown',
                endTime: '2025-12-31 23:59:59'
              }
            }
          },
          [pluginTooltip]: {
            // 工具提示插件配置
            labelTooltip: '工具提示',
            blockTooltip: {
              label: '工具提示',
              category: 'Extra'
            },
            attrTooltip: 'data-tooltip',
            classTooltip: 'tooltip-component'
          },
          'grapesjs-script-editor': {
            // 腳本編輯器插件配置 - 為組件添加 JavaScript 腳本
            starter: 'let el = this; // 選中的元素\n// 在此編寫您的 JavaScript 代碼',
            toolbarIcon: '<i class="fa fa-code"></i>',
            modalTitle: '編輯組件腳本',
            buttonLabel: '保存腳本',
            onRun: () => console.log('✅ 腳本語法正確'),
            onError: (err: any) => console.error('❌ 腳本錯誤:', err),
            codeViewOptions: {
              theme: 'hopscotch',
              lineNumbers: true,
              styleActiveLine: true,
              autoCloseBrackets: true
            }
          },
          'gjs-component-code-editor': {
            // 代碼編輯器插件配置
            modalTitle: '程式碼編輯器',
            codeViewOptions: {
              theme: 'hopscotch',
              lineNumbers: true,
              styleActiveLine: true,
              autoCloseBrackets: true,
              matchBrackets: true,
              mode: 'htmlmixed'  // 支持 HTML、CSS、JS 混合模式
            },
            // 編輯器面板配置
            panelTitle: '程式碼',
            commandName: 'open-code-editor',
            // 組件選擇器，決定哪些組件可以使用代碼編輯器
            editJs: true,    // 允許編輯 JavaScript
            editCss: true,   // 允許編輯 CSS  
            editHtml: true   // 允許編輯 HTML
          },
          'grapesjs-carousel-component': {
            // Carousel 插件配置
            blockName: 'carousel',
            blockCategory: 'Media',
            blockLabel: '輪播組件',
            // Splide.js 預設配置
            splideOptions: {
              type: 'loop',
              perPage: 1,
              autoplay: true,
              interval: 3000
            }
          },
          // 為自定義插件添加配置
          ...customPlugins.reduce((opts: any, plugin) => {
            opts[plugin.name] = plugin.options || {}
            return opts
          }, {})
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
              name: '手機直向',
              width: '320px',
              widthMedia: '768px',
            },
          ],
        },
        // Canvas 配置 - 載入 Carousel 相關資源到編輯器畫布
        canvas: {
          styles: [
            'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css'
          ],
          scripts: [
            'https://cdn.jsdelivr.net/npm/@redoc_a2k/splide@4.1.4/dist/js/splide.min.js'
          ]
        },
        // 存儲管理器配置
        storageManager: false, // 我們使用自己的保存邏輯
      })

        console.log('✅ 編輯器初始化完成')
        
        setEditor(editorInstance)

        // 確保面板正確顯示
        console.log('📋 設置面板可見性...')
        
        // 等一下讓編輯器完全加載後再配置面板
        setTimeout(() => {
          // 手動打開面板
          const commands = editorInstance.Commands
          
          // 打開組件庫面板
          if (commands.has('show-blocks')) {
            commands.run('show-blocks')
            console.log('✅ 組件庫面板已打開')
          }
          
          // 打開圖層面板
          if (commands.has('show-layers')) {
            commands.run('show-layers') 
            console.log('✅ 圖層面板已打開')
          }
          
                    // 確保組件庫面板可見
          const blockManager = editorInstance.BlockManager
          if (blockManager) {
            console.log('✅ 組件庫已載入，共', blockManager.getAll().length, '個組件')
          }
          
          // 確保圖層面板可見  
          const layerManager = editorInstance.LayerManager
          if (layerManager) {
            console.log('✅ 圖層管理器已載入')
          }
          
          // 添加 script-editor 工具欄按鈕
          if (editorInstance.Commands.has('edit-script')) {
            const panelManager = editorInstance.Panels
            panelManager.addButton('options', [
              {
                id: 'edit-script',
                className: 'fa fa-code',
                command: 'edit-script',
                attributes: { title: '編輯組件腳本' }
              }
            ])
            console.log('✅ 腳本編輯器按鈕已添加')
          }
          
          // 強制重新渲染面板
          editorInstance.trigger('change:canvasOffset')
        }, 200)

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
      // 清理編輯器實例
      if (editor) {
        editor.destroy?.()
      }
    }
  }, []) // 移除 pageId 依賴項，避免重複初始化

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

  return (
    <div 
      ref={editorRef} 
      id="grapesjs-editor-container"
      style={{ 
        height: '100vh', 
        width: '100%',
        minHeight: '500px',
        position: 'relative'
      }} 
    />
  )
}

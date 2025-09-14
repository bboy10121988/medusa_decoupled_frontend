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
  setIsLoading(true)
  try {
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
          setPages([newPage])
          setCurrentPage(newPage)
          setCurrentPageId(newPage._id!)
        }
      } catch (e: any) {
        console.error('創建默認頁面失敗:', e)
        alert('創建默認頁面失敗: ' + (e.message || e))
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
          }
          // {
          //   id: 'preview-btn',
          //   className: 'btn-preview',
          //   label: '👁️',
          //   command: 'preview-page',
          //   attributes: { title: 'Preview Page' }
          // },
          // {
          //   id: 'publish-btn',
          //   className: 'btn-publish',
          //   label: '🚀',
          //   command: 'publish-page',
          //   attributes: { title: 'Publish Page' }
          // }
        ])
        
        // 在 view 面板添加圖標按鈕
        editor.Panels.addButton('views', {
          id: 'toggle-customer-panel',
          label: '⠿',
          command: 'toggle-customer-panel',
          attributes: { title: '工作區' }
        })
        
        console.log('✅ 按鈕已添加到 views 面板')
        
        
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

        // 添加工作區面板切換命令
        editor.Commands.add('toggle-customer-panel', {
          run: (editor: any) => {
            console.log('🔍 正在切換工作區面板...')
            
            // 檢查工作區容器是否已存在
            let workspaceContainer = document.getElementById('workspace-container')
            
            if (workspaceContainer) {
              // 切換顯示/隱藏
              const isVisible = workspaceContainer.style.display !== 'none'
              workspaceContainer.style.display = isVisible ? 'none' : 'block'
              console.log(`工作區面板${isVisible ? '已隱藏' : '已顯示'}`)
              return
            }
            
            // 找到右側面板區域
            const rightPanelArea = document.querySelector('.gjs-pn-panel.gjs-pn-views-container')
            
            if (!rightPanelArea) {
              console.error('找不到右側面板區域')
              return
            }
            
            // 創建工作區容器
            workspaceContainer = document.createElement('div')
            workspaceContainer.id = 'workspace-container'
            workspaceContainer.className = 'workspace-panel-content'
            
            // 設置工作區容器樣式
            workspaceContainer.style.cssText = `
              background: #463a3c;
              color: #b9a5a6;
              padding: 15px;
              border-top: 1px solid #5a4e50;
              min-height: 200px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: block;
            `
            
            // 創建工作區內容
            workspaceContainer.innerHTML = `
              <div style="
                background: #2a2a2a;
                border: 1px solid #5a4e50;
                border-radius: 6px;
                padding: 15px;
                margin: 10px;
                color: #e8d5d6;
              ">
                <h3 style="
                  margin: 0 0 12px 0;
                  font-size: 14px;
                  color: #e8d5d6;
                  border-bottom: 1px solid #5a4e50;
                  padding-bottom: 8px;
                ">頁面管理</h3>
                
                <div id="page-list-container" style="margin-bottom: 12px;">
                  <!-- 頁面清單將在這裡動態生成 -->
                </div>
                
                <script>
                  // 動態載入頁面清單
                  function loadPageList() {
                    const container = document.getElementById('page-list-container');
                    if (!container) return;
                    
                    // 從 Sanity API 載入頁面列表
                    fetch('/api/pages/list')
                      .then(response => response.json())
                      .then(data => {
                        if (data.success && data.pages) {
                          let html = '';
                          
                          // 如果沒有頁面，顯示預設頁面
                          if (data.pages.length === 0) {
                            html = '<div class="no-pages" style="padding: 20px; text-align: center; color: #888; font-size: 12px;">尚無頁面，請點擊「新增」創建第一個頁面</div>';
                          } else {
                            // 顯示 Sanity 中的頁面
                            data.pages.forEach(page => {
                              const pageId = page.slug?.current || page._id;
                              const pageName = page.title || pageId;
                              html += '<div onclick="selectPage(\\'' + pageId + '\\', \\'' + pageName + '\\')" class="page-item" style="padding: 8px 10px; margin-bottom: 4px; border-radius: 4px; cursor: pointer; font-size: 12px; color: #b9a5a6; display: flex; align-items: center; transition: all 0.2s ease;" onmouseover="if (this.style.backgroundColor !== \\'rgb(90, 78, 80)\\') { this.style.backgroundColor = \\'rgba(90, 78, 80, 0.3)\\'; }" onmouseout="if (this.style.backgroundColor !== \\'rgb(90, 78, 80)\\') { this.style.backgroundColor = \\'transparent\\'; }"><span style="margin-right: 8px;">📄</span><span>' + pageName + '</span><span style="margin-left: auto; font-size: 10px; color: #666;">(' + page.status + ')</span></div>';
                            });
                          }
                          
                          container.innerHTML = html;
                          console.log('頁面清單已從 Sanity 載入:', data.pages.length + ' 個頁面');
                        } else {
                          throw new Error(data.error || '載入頁面列表失敗');
                        }
                      })
                      .catch(error => {
                        console.error('載入頁面清單失敗:', error);
                        // 如果 API 載入失敗，顯示錯誤訊息
                        container.innerHTML = '<div class="error" style="padding: 20px; text-align: center; color: #ff6b6b; font-size: 12px;">載入頁面列表失敗<br>請重新整理頁面</div>';
                      });
                  }
                  
                  // 選擇頁面函數
                  function selectPage(pageId, pageName) {
                    document.querySelectorAll('.page-item').forEach(item => {
                      item.style.backgroundColor = 'transparent';
                      item.style.fontWeight = 'normal';
                    });
                    event.target.closest('.page-item').style.backgroundColor = '#5a4e50';
                    event.target.closest('.page-item').style.fontWeight = 'bold';
                    window.selectedPageId = pageId;
                    console.log('選中頁面:', pageName);
                  }
                  
                  // 頁面載入後執行
                  setTimeout(loadPageList, 100);
                </script>
                
                <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                  <button onclick="
                    // 保存當前編輯器內容到 Sanity
                    const editor = window.grapesEditor;
                    if (editor && window.selectedPageId) {
                      const html = editor.getHtml();
                      const css = editor.getCss();
                      const components = editor.getComponents();
                      const styles = editor.getStyles();
                      
                      // 創建 Sanity 文檔數據
                      const pageData = {
                        _type: 'grapesJSPage',
                        title: window.selectedPageId === 'page_2' ? 'Page 2' : window.selectedPageId,
                        slug: {
                          current: window.selectedPageId.toLowerCase().replace(/[^a-z0-9]/g, '-')
                        },
                        status: 'draft',
                        grapesHtml: html,
                        grapesCss: css,
                        grapesComponents: JSON.stringify(components),
                        grapesStyles: JSON.stringify(styles)
                      };
                      
                      // 發送到 Sanity API
                      fetch('/api/pages/save', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          pageId: window.selectedPageId,
                          pageData: pageData
                        })
                      })
                      .then(response => response.json())
                      .then(data => {
                        if (data.success) {
                          console.log('頁面已保存到 Sanity:', data);
                          alert('✅ 頁面已成功保存到資料庫: ' + window.selectedPageId);
                        } else {
                          throw new Error(data.error || '保存失敗');
                        }
                      })
                      .catch(error => {
                        console.error('保存到 Sanity 失敗:', error);
                        alert('❌ 保存失敗: ' + error.message);
                      });
                    } else if (!window.selectedPageId) {
                      alert('請先選擇要保存的頁面');
                    } else {
                      alert('編輯器未初始化');
                    }
                  " style="
                    flex: 1;
                    background: #4a5c3a;
                    border: 1px solid #6a7c5a;
                    color: #e8f5e8;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                  " onmouseover="this.style.background='#5a6c4a'; this.style.color='#ffffff';" onmouseout="this.style.background='#4a5c3a'; this.style.color='#e8f5e8';">
                    💾 保存
                  </button>
                </div>
                
                <div style="display: flex; gap: 8px;">
                  <button onclick="
                    if (window.selectedPageId) {
                      console.log('編輯頁面:', window.selectedPageId);
                      
                      // 從 Sanity 載入選中頁面的內容到編輯器
                      const editor = window.grapesEditor;
                      if (editor) {
                        // 從 Sanity API 載入頁面數據
                        fetch('/api/pages/load?pageId=' + encodeURIComponent(window.selectedPageId))
                          .then(response => response.json())
                          .then(data => {
                            if (data.success && data.page) {
                              const page = data.page;
                              
                              // 載入 HTML 和 CSS
                              if (page.grapesHtml) {
                                editor.setComponents(page.grapesHtml);
                              }
                              if (page.grapesCss) {
                                editor.setStyle(page.grapesCss);
                              }
                              
                              console.log('頁面內容已從 Sanity 載入:', window.selectedPageId);
                              alert('✅ 頁面已從資料庫載入: ' + page.title);
                            } else if (data.success && !data.page) {
                              // 如果沒有找到頁面，載入空白內容
                              editor.setComponents('<div><h1>新頁面</h1><p>開始編輯您的頁面內容...</p></div>');
                              editor.setStyle('body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }');
                              alert('ℹ️ 載入空白頁面: ' + window.selectedPageId);
                            } else {
                              throw new Error(data.error || '載入失敗');
                            }
                          })
                          .catch(error => {
                            console.error('從 Sanity 載入頁面失敗:', error);
                            alert('❌ 載入頁面失敗: ' + error.message);
                            
                            // 如果 API 載入失敗，載入預設內容
                            editor.setComponents('<div><h1>新頁面</h1><p>開始編輯您的頁面內容...</p></div>');
                            editor.setStyle('body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }');
                          });
                      } else {
                        alert('編輯器未準備好');
                      }
                    } else {
                      alert('請先選擇一個頁面');
                    }
                  " style="
                    flex: 1;
                    background: transparent;
                    border: 1px solid #5a4e50;
                    color: #b9a5a6;
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                  " onmouseover="this.style.background='#5a4e50'" onmouseout="this.style.background='transparent'">
                    � 編輯
                  </button>
                  
                  <button onclick="
                    const name = prompt('新頁面名稱:');
                    if (name && name.trim()) {
                      const pageId = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
                      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
                      
                      // 創建新頁面數據
                      const newPageData = {
                        _type: 'grapesJSPage',
                        title: name.trim(),
                        slug: {
                          current: slug
                        },
                        status: 'draft',
                        grapesHtml: '<div><h1>' + name.trim() + '</h1><p>開始編輯您的頁面內容...</p></div>',
                        grapesCss: 'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }',
                        grapesComponents: '',
                        grapesStyles: ''
                      };
                      
                      // 發送到 Sanity API
                      fetch('/api/pages/save', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          pageId: pageId,
                          pageData: newPageData
                        })
                      })
                      .then(response => response.json())
                      .then(data => {
                        if (data.success) {
                          console.log('新頁面已在 Sanity 中創建:', data);
                          alert('✅ 新頁面已創建: ' + name.trim());
                          
                          // 重新載入頁面清單
                          if (typeof loadPageList === 'function') {
                            loadPageList();
                          } else {
                            window.location.reload();
                          }
                        } else {
                          throw new Error(data.error || '創建失敗');
                        }
                      })
                      .catch(error => {
                        console.error('在 Sanity 中創建頁面失敗:', error);
                        alert('❌ 創建頁面失敗: ' + error.message);
                      });
                    }
                  " style="
                    flex: 1;
                    background: transparent;
                    border: 1px solid #5a4e50;
                    color: #b9a5a6;
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                  " onmouseover="this.style.background='#5a4e50'; this.style.color='#e8d5d6';" onmouseout="this.style.background='transparent'; this.style.color='#b9a5a6';">
                    新增
                  </button>
                </div>
              </div>
            `
            
            // 將容器添加到右側面板
            rightPanelArea.appendChild(workspaceContainer)
            
            console.log('✅ 工作區容器已創建並添加到面板')
          }
        })


        // // 載入當前頁面
        // editor.on('load', () => {
        //   setTimeout(() => {
        //     if (currentPageId && pages.length > 0) {
        //       loadPageToEditor(currentPageId, editor)
        //     }
        //   }, 500)
        // })

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
        style={{ height: '100%' }}
      >
        {/* GrapesJS 會在這裡渲染編輯器 */}
      </div>
    </div>
  )
}
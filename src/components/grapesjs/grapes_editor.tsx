'use client'

import { useEffect, useRef, useState } from 'react'
import { grapesJSPageService, type GrapesJSPageData, type SavePageParams, type UpdatePageParams } from '@/lib/services/grapesjs-page-service'
import { registerCustomComponents } from './custom-components'
import 'grapesjs/dist/css/grapes.min.css'
import './grapes-editor.css'

// 全域變數來追蹤工作區選中的頁面
let currentWorkspacePageId: string | null = null
let currentWorkspacePageName: string | null = null

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

  // 保存當前頁面 - 改進版，支持工作區
  const saveCurrentPage = async (editor: any) => {
    try {
      console.log('開始保存當前頁面...')
      
      // 獲取當前編輯器中的內容
      const html = editor.getHtml()
      const css = editor.getCss() 
      const components = editor.getComponents()
      
      // 使用正確的 GrapesJS API 獲取樣式
      const styleManager = editor.StyleManager
      const styles = styleManager ? styleManager.getAll().map((style: any) => style.toJSON()) : []
      
      console.log('準備保存的數據:', {
        html: html.length + ' 字符',
        css: css.length + ' 字符', 
        components: components.length + ' 個組件',
        styles: styles.length + ' 個樣式'
      })

      // 檢查是否有當前頁面狀態
      let targetPageId = currentPageId
      
      // 如果沒有當前頁面狀態，從工作區獲取選中的頁面
      if (!targetPageId && currentWorkspacePageId) {
        targetPageId = currentWorkspacePageId
        console.log('使用工作區選中的頁面:', currentWorkspacePageName)
      }
      
      if (!targetPageId) {
        // 如果仍然沒有目標頁面，提示用戶先選擇頁面
        alert('請先在工作區選擇要保存的頁面')
        return false
      }

      // 使用 API 正確的參數格式保存
      const savePayload = {
        pageId: targetPageId,
        pageData: {
          _type: "grapesJSPageV2",
          slug: {
            _type: "slug",
            current: targetPageId
          },
          pageName: currentWorkspacePageName || `頁面-${targetPageId}`,
          grapesHtml: html,
          grapesCss: css,
          grapesComponents: JSON.stringify(components),
          grapesStyles: JSON.stringify(styles)
        }
      }
      
      console.log('正在保存到 API...', savePayload)
      
      const response = await fetch('/api/pages/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savePayload)
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ 頁面保存成功!')
        
        // 重新載入頁面列表
        await loadPages()
        
        if (onSave) {
          onSave(html)
        }
        
        return true
      } else {
        throw new Error(result.error || '保存失敗')
      }
      
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

        console.log('基本插件載入完成')

        // 添加 carousel 插件
        let pluginCarousel
        try {
          pluginCarousel = (await import('grapesjs-carousel-component')).default
          console.log('✅ grapesjs-carousel-component 載入成功')
        } catch (e) {
          console.warn('❌ 無法載入 grapesjs-carousel-component:', e)
        }

        // 暫時移除其他可能有問題的插件
        // 我們稍後會重新添加它們

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
              'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
              'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css'
            ],
            scripts: [
              'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js',
              'https://cdn.jsdelivr.net/npm/@redoc_a2k/splide@4.1.4/dist/js/splide.min.js'
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
            // 添加 Carousel 插件（如果載入成功）
            ...(pluginCarousel ? [pluginCarousel] : [])
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
            },
            'grapesjs-carousel-component': {
              // 輪播組件配置選項
            }
          }
        })

        // 註冊自定義組件
        registerCustomComponents(editor)

        // 確保工具欄功能啟用
        editor.on('load', () => {
          console.log('GrapesJS 載入完成，工具欄功能應該已啟用')
        })

        // 監聽組件選擇事件以調試工具欄
        editor.on('component:selected', (model: any) => {
          console.log('組件被選中:', {
            type: model.get('type'),
            tagName: model.get('tagName'),
            toolbar: model.get('toolbar'),
            attributes: model.get('attributes')
          })
        })

        // 自定義資源管理器 - 整合 Sanity
        editor.Storage.add('sanity-assets', {
          load() {
            return Promise.resolve({})
          },
          store() {
            return Promise.resolve({})
          }
        })

        // 自定義圖片選擇命令
        editor.Commands.add('open-sanity-image-picker', {
          run: async (editor: any, sender: any, options: any = {}) => {
            const { showSanityImagePicker } = await import('./sanity-image-picker')
            
            showSanityImagePicker({
              onSelect: (imageUrl: string) => {
                if (options.target) {
                  // 如果有指定目標組件，直接設置圖片
                  options.target.set('src', imageUrl)
                } else if (options.callback) {
                  // 如果有回調函數，執行回調
                  options.callback(imageUrl)
                }
              },
              onClose: () => {
                // 關閉時的處理
              },
              allowUpload: true
            })
          }
        })

        // 覆蓋默認的圖片管理器
        editor.on('run:open-assets', () => {
          editor.runCommand('open-sanity-image-picker')
        })

        // 為圖片組件添加雙擊事件來打開圖片選擇器
        editor.on('component:selected', (model: any) => {
          if (model.get('type') === 'image') {
            console.log('圖片組件被選中:', {
              src: model.get('attributes')?.src,
              type: model.get('type')
            })
          }
        })

        // 監聽畫布上的雙擊事件
        editor.on('canvas:ready', () => {
          const canvas = editor.Canvas.getFrameEl()
          if (canvas) {
            canvas.addEventListener('dblclick', async (e: any) => {
              const target = e.target
              if (target && target.tagName === 'IMG') {
                console.log('圖片被雙擊:', target.src)
                
                // 找到對應的 GrapesJS 組件
                const wrapper = editor.DomComponents.getWrapper()
                if (wrapper) {
                  const imageComponents = wrapper.find('image')
                  const component = imageComponents.filter((comp: any) => {
                    const compEl = comp.getEl && comp.getEl()
                    return compEl === target
                  })[0]
                  
                  if (component) {
                    // 打開 Sanity 圖片選擇器
                    const { showSanityImagePicker } = await import('./sanity-image-picker')
                    
                    showSanityImagePicker({
                      onSelect: (imageUrl: string) => {
                        // 更新組件的屬性
                        component.set('attributes', {
                          ...component.get('attributes'),
                          src: imageUrl
                        })
                        
                        console.log('圖片已更新為:', imageUrl)
                      },
                      onClose: () => {
                        console.log('圖片選擇器已關閉')
                      },
                      allowUpload: true
                    })
                  } else {
                    console.warn('找不到對應的 GrapesJS 組件')
                  }
                } else {
                  console.warn('找不到 GrapesJS wrapper')
                }
              }
            })
          }
        })

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
        
        // 在 views 面板添加工作區按鈕
        editor.Panels.addButton('views', {
          id: 'show-workspace',
          label: '⠿',
          command: 'show-workspace',
          attributes: { title: '工作區' }
        })
        
        console.log('✅ 按鈕已添加到 views 面板')
        
        // 添加工作區面板顯示命令 - 作為第四個按鈕的專屬面板
        editor.Commands.add('show-workspace', {
          run: (editor: any) => {
            console.log('🔍 正在切換到工作區面板...')
            
            // 等待 DOM 準備就緒
            setTimeout(() => {
              // 移除其他按鈕的 active 狀態
              const allViewButtons = document.querySelectorAll('.gjs-pn-views .gjs-pn-btn')
              allViewButtons.forEach(btn => {
                btn.classList.remove('gjs-pn-active')
              })
              
              // 設置工作區按鈕為 active
              const workspaceBtn = document.querySelector('[data-tooltip="工作區"], [title="工作區"]')
              if (workspaceBtn) {
                workspaceBtn.classList.add('gjs-pn-active')
              }
              
              // 隱藏所有現有的面板內容
              const viewsContainer = document.querySelector('.gjs-pn-panel.gjs-pn-views-container')
              if (viewsContainer) {
                const existingContents = viewsContainer.querySelectorAll('.gjs-blocks-c, .gjs-layers-c, .gjs-sm-c, .workspace-button-content')
                existingContents.forEach(content => {
                  ;(content as HTMLElement).style.display = 'none'
                })
              }
              
              // 查找或創建工作區內容容器
              let workspaceContainer = document.querySelector('.workspace-button-content') as HTMLElement
              
              if (!workspaceContainer) {
                // 創建工作區按鈕專屬的內容容器
                workspaceContainer = document.createElement('div')
                workspaceContainer.className = 'workspace-button-content'
                workspaceContainer.style.cssText = `
                  display: block;
                  height: 100%;
                  overflow: auto;
                  background: transparent;
                `
                
                if (viewsContainer) {
                  viewsContainer.appendChild(workspaceContainer)
                }
              } else {
                // 顯示工作區內容並重新載入
                workspaceContainer.style.display = 'block'
                workspaceContainer.innerHTML = ''
              }
              
              // 創建工作區內容
              const workspaceContent = createWorkspaceContent(editor)
              workspaceContainer.appendChild(workspaceContent)
              
              console.log('✅ 工作區已作為第四個按鈕的專屬面板顯示')
            }, 100)
          },
          
          stop: (editor: any) => {
            // 當切換到其他按鈕時隱藏工作區
            const workspaceContainer = document.querySelector('.workspace-button-content') as HTMLElement
            if (workspaceContainer) {
              workspaceContainer.style.display = 'none'
            }
          }
        })
        
        // 監聽其他面板按鈕的點擊事件，當切換到其他面板時隱藏工作區
        editor.on('run:open-sm', () => {
          const workspaceContainer = document.querySelector('.workspace-button-content') as HTMLElement
          if (workspaceContainer) {
            workspaceContainer.style.display = 'none'
          }
        })
        
        editor.on('run:open-layers', () => {
          const workspaceContainer = document.querySelector('.workspace-button-content') as HTMLElement
          if (workspaceContainer) {
            workspaceContainer.style.display = 'none'
          }
        })
        
        editor.on('run:open-blocks', () => {
          const workspaceContainer = document.querySelector('.workspace-button-content') as HTMLElement
          if (workspaceContainer) {
            workspaceContainer.style.display = 'none'
          }
        })
        
        // 工作區內容創建函數
        function createWorkspaceContent(editor: any) {
          // 創建工作區 DOM 結構
          const workspaceDiv = document.createElement('div')
          workspaceDiv.className = 'workspace-content'
          workspaceDiv.style.cssText = `
            background: #2a2a2a;
            border: 1px solid #5a4e50;
            border-radius: 6px;
            padding: 15px;
            margin: 10px;
            color: #e8d5d6;
            height: calc(100% - 20px);
            overflow-y: auto;
          `
          
          // 標題
          const header = document.createElement('h3')
          header.textContent = '頁面管理'
          header.style.cssText = `
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #e8d5d6;
            border-bottom: 1px solid #5a4e50;
            padding-bottom: 8px;
          `
          
          // 頁面列表容器
          const pageListContainer = document.createElement('div')
          pageListContainer.id = 'workspace-page-list'
          pageListContainer.style.marginBottom = '12px'
          
          workspaceDiv.appendChild(header)
          workspaceDiv.appendChild(pageListContainer)
          
          // 載入頁面數據
          loadWorkspacePages(pageListContainer, editor)
          
          return workspaceDiv
        }
        
        // 載入工作區頁面函數
        async function loadWorkspacePages(container: HTMLElement, editor: any) {
          try {
            const response = await fetch('/api/pages/list')
            const data = await response.json()
            
            if (data.success && data.pages) {
              container.innerHTML = ''
              
              if (data.pages.length === 0) {
                const emptyState = document.createElement('div')
                emptyState.textContent = '尚無頁面，請點擊「新增」創建第一個頁面'
                emptyState.style.cssText = `
                  padding: 20px;
                  text-align: center;
                  color: #888;
                  font-size: 12px;
                `
                container.appendChild(emptyState)
              } else {
                // 渲染頁面列表
                data.pages.forEach((page: any) => {
                  const pageItem = createPageItem(page, editor)
                  container.appendChild(pageItem)
                })
              }
              
              console.log('工作區頁面列表已載入:', data.pages.length, '個頁面')
            } else {
              throw new Error(data.error || '載入頁面列表失敗')
            }
          } catch (error) {
            console.error('載入工作區頁面失敗:', error)
            container.innerHTML = `
              <div style="color: #ff6b6b; text-align: center; padding: 10px; font-size: 12px;">
                載入頁面列表失敗: ${(error as Error).message}
              </div>
            `
          }
        }
        
        // 頁面設定對話框函數
        function openPageSettingsDialog(page: any, editor: any) {
          // 創建對話框背景
          const overlay = document.createElement('div')
          overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
          `
          
          // 創建對話框主體
          const dialog = document.createElement('div')
          dialog.style.cssText = `
            background: #2a2a2a;
            border-radius: 8px;
            padding: 24px;
            width: 400px;
            max-width: 90vw;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            color: #fff;
          `
          
          dialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #fff; font-size: 18px;">頁面設定</h3>
            <form id="page-settings-form">
              <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #ddd; font-size: 14px;">頁面標題</label>
                <input type="text" id="page-title" value="${page.title || ''}" style="
                  width: 100%;
                  padding: 8px 12px;
                  border: 1px solid #555;
                  border-radius: 4px;
                  background: #3a3a3a;
                  color: #fff;
                  font-size: 14px;
                ">
              </div>
              
              <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: #ddd; font-size: 14px;">
                  頁面路徑 (slug)
                  <span style="color: #888; font-size: 12px;">例如: home, about, contact</span>
                </label>
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                  <span style="color: #888; font-size: 12px;">localhost:8000/tw/</span>
                  <input type="text" id="page-slug" value="${page.slug?.current || ''}" style="
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #555;
                    border-radius: 4px;
                    background: #3a3a3a;
                    color: #fff;
                    font-size: 14px;
                  " pattern="[a-z0-9-]+" placeholder="頁面路徑">
                </div>
                <small style="color: #666; font-size: 11px;">只能包含小寫字母、數字和連字符</small>
              </div>
              
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #ddd; font-size: 14px;">頁面狀態</label>
                <select id="page-status" style="
                  width: 100%;
                  padding: 8px 12px;
                  border: 1px solid #555;
                  border-radius: 4px;
                  background: #3a3a3a;
                  color: #fff;
                  font-size: 14px;
                ">
                  <option value="draft" ${page.status === 'draft' ? 'selected' : ''}>草稿</option>
                  <option value="preview" ${page.status === 'preview' ? 'selected' : ''}>預覽</option>
                  <option value="published" ${page.status === 'published' ? 'selected' : ''}>已發布</option>
                  <option value="archived" ${page.status === 'archived' ? 'selected' : ''}>已封存</option>
                </select>
              </div>
              
              <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" id="cancel-btn" style="
                  padding: 8px 16px;
                  border: 1px solid #666;
                  border-radius: 4px;
                  background: transparent;
                  color: #ddd;
                  cursor: pointer;
                  font-size: 14px;
                ">取消</button>
                <button type="submit" id="save-btn" style="
                  padding: 8px 16px;
                  border: none;
                  border-radius: 4px;
                  background: #007bff;
                  color: #fff;
                  cursor: pointer;
                  font-size: 14px;
                ">保存</button>
              </div>
            </form>
          `
          
          overlay.appendChild(dialog)
          document.body.appendChild(overlay)
          
          // 綁定事件
          const form = dialog.querySelector('#page-settings-form') as HTMLFormElement
          const titleInput = dialog.querySelector('#page-title') as HTMLInputElement
          const slugInput = dialog.querySelector('#page-slug') as HTMLInputElement
          const statusSelect = dialog.querySelector('#page-status') as HTMLSelectElement
          const cancelBtn = dialog.querySelector('#cancel-btn') as HTMLButtonElement
          const saveBtn = dialog.querySelector('#save-btn') as HTMLButtonElement
          
          // slug 輸入驗證
          slugInput.addEventListener('input', () => {
            let value = slugInput.value
            value = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
            slugInput.value = value
          })
          
          // 取消按鈕
          cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay)
          })
          
          // 點擊背景關閉
          overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
              document.body.removeChild(overlay)
            }
          })
          
          // 表單提交
          form.addEventListener('submit', async (e) => {
            e.preventDefault()
            
            const newTitle = titleInput.value.trim()
            const newSlug = slugInput.value.trim()
            const newStatus = statusSelect.value
            
            if (!newTitle) {
              alert('請輸入頁面標題')
              return
            }
            
            if (!newSlug) {
              alert('請輸入頁面路徑')
              return
            }
            
            try {
              saveBtn.disabled = true
              saveBtn.textContent = '保存中...'
              
              // 調用 API 更新頁面設定
              await updatePageSettings(page._id, {
                title: newTitle,
                slug: newSlug,
                status: newStatus
              })
              
              // 重新載入工作區
              const workspaceContainer = document.querySelector('#workspace-page-list') as HTMLElement
              if (workspaceContainer) {
                await loadWorkspacePages(workspaceContainer, editor)
              }
              
              document.body.removeChild(overlay)
            } catch (error) {
              alert('保存失敗: ' + (error as Error).message)
            } finally {
              saveBtn.disabled = false
              saveBtn.textContent = '保存'
            }
          })
        }
        
        // 確認刪除頁面對話框
        function confirmDeletePage(page: any, editor: any) {
          const confirmed = confirm(`確定要刪除頁面「${page.title || page.slug?.current || 'Untitled'}」嗎？\n\n此操作無法復原。`)
          
          if (confirmed) {
            deletePage(page._id, editor)
          }
        }
        
        // 刪除頁面函數
        async function deletePage(pageId: string, editor: any) {
          try {
            console.log('正在刪除頁面:', pageId)
            
            const response = await fetch(`/api/pages/delete`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ pageId })
            })
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            const result = await response.json()
            
            if (result.success) {
              console.log('頁面已刪除:', pageId)
              // 重新載入工作區
              const workspaceContainer = document.querySelector('#workspace-page-list') as HTMLElement
              if (workspaceContainer) {
                await loadWorkspacePages(workspaceContainer, editor)
              }
            } else {
              alert('刪除失敗: ' + (result.error || '未知錯誤'))
            }
          } catch (error) {
            console.error('刪除頁面失敗:', error)
            alert('刪除失敗: ' + (error as Error).message)
          }
        }
        
        // 更新頁面設定函數
        async function updatePageSettings(pageId: string, settings: any) {
          const response = await fetch('/api/pages/update-settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pageId, settings })
          })
          
          const result = await response.json()
          
          if (!result.success) {
            throw new Error(result.error || '更新失敗')
          }
          
          return result
        }
        
        // 創建頁面項目函數
        function createPageItem(page: any, editor: any) {
          const pageItem = document.createElement('div')
          // 使用與 API 匹配的 pageId - 直接使用 slug.current
          const pageId = page.slug?.current || page._id
          const pageName = page.title || page.slug?.current || 'Untitled Page'
          
          // 調試信息
          console.log('創建頁面項目:', {
            pageId,
            pageName,
            slug: page.slug,
            _id: page._id,
            title: page.title
          })
          
          pageItem.style.cssText = `
            padding: 8px 10px;
            margin-bottom: 4px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            color: #b9a5a6;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
          `
          
          pageItem.innerHTML = `
            <span style="margin-right: 8px;">📄</span>
            <span class="page-name" style="flex: 1;">${pageName}</span>
            <span style="font-size: 10px; color: #666; margin-right: 8px;">(${page.status})</span>
            <div class="page-actions" style="display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s;">
              <button class="settings-btn" style="
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                color: #888;
                padding: 2px 4px;
                border-radius: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
              " title="頁面設定">⚙️</button>
              <button class="delete-btn" style="
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                color: #888;
                padding: 2px 4px;
                border-radius: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
              " title="刪除頁面">🗑️</button>
            </div>
          `
          
          // 互動效果
          pageItem.addEventListener('mouseover', () => {
            if (!pageItem.classList.contains('selected')) {
              pageItem.style.backgroundColor = 'rgba(90, 78, 80, 0.3)'
            }
            // 顯示管理按鈕
            const actions = pageItem.querySelector('.page-actions') as HTMLElement
            if (actions) {
              actions.style.opacity = '1'
            }
          })
          
          pageItem.addEventListener('mouseout', () => {
            if (!pageItem.classList.contains('selected')) {
              pageItem.style.backgroundColor = 'transparent'
            }
            // 隱藏管理按鈕
            const actions = pageItem.querySelector('.page-actions') as HTMLElement
            if (actions) {
              actions.style.opacity = '0'
            }
          })
          
          // 設定按鈕事件
          const settingsBtn = pageItem.querySelector('.settings-btn') as HTMLButtonElement
          const deleteBtn = pageItem.querySelector('.delete-btn') as HTMLButtonElement
          
          settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation() // 防止觸發頁面選擇
            openPageSettingsDialog(page, editor)
          })
          
          settingsBtn.addEventListener('mouseover', () => {
            settingsBtn.style.backgroundColor = 'rgba(255,255,255,0.1)'
          })
          
          settingsBtn.addEventListener('mouseout', () => {
            settingsBtn.style.backgroundColor = 'transparent'
          })
          
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation() // 防止觸發頁面選擇
            confirmDeletePage(page, editor)
          })
          
          deleteBtn.addEventListener('mouseover', () => {
            deleteBtn.style.backgroundColor = 'rgba(255,0,0,0.1)'
            deleteBtn.style.color = '#ff6b6b'
          })
          
          deleteBtn.addEventListener('mouseout', () => {
            deleteBtn.style.backgroundColor = 'transparent'
            deleteBtn.style.color = '#888'
          })
          
          // 點擊切換頁面 - 防止重複觸發
          let isLoading = false
          pageItem.addEventListener('click', () => {
            if (!isLoading) {
              isLoading = true
              selectWorkspacePage(pageId, pageName, pageItem, editor)
                .finally(() => {
                  isLoading = false
                })
            }
          })
          
          return pageItem
        }
        
        // 工作區全局變數
        let isWorkspaceLoading = false
        let currentWorkspacePageId: string | null = null
        let currentWorkspacePageName: string | null = null
        
        // 選擇工作區頁面函數
        async function selectWorkspacePage(pageId: string, pageName: string, clickedElement: HTMLElement, editor: any) {
          // 防止重複載入
          if (isWorkspaceLoading) {
            console.log('正在載入其他頁面，請稍候...')
            return
          }
          
          console.log('工作區選擇頁面:', pageName, '(ID:', pageId, ')')
          
          // 檢查 pageId 是否有效
          if (!pageId || pageId.trim() === '') {
            console.error('pageId 無效:', pageId)
            alert('頁面 ID 無效，無法載入頁面')
            return
          }
          
          isWorkspaceLoading = true
          
          // 更新選中狀態
          const allPageItems = document.querySelectorAll('#workspace-page-list > div')
          allPageItems.forEach(item => {
            item.classList.remove('selected')
            ;(item as HTMLElement).style.backgroundColor = 'transparent'
          })
          
          clickedElement.classList.add('selected')
          clickedElement.style.backgroundColor = 'rgb(90, 78, 80)'
          
          try {
            // 構建 API URL，使用 pageId 參數
            const apiUrl = `/api/pages/load?pageId=${encodeURIComponent(pageId)}`
            console.log('正在調用 API:', apiUrl)
            console.log('載入頁面信息:', { pageId, pageName })
            
            // 載入頁面內容
            const response = await fetch(apiUrl)
            const data = await response.json()
            
            console.log('API 響應:', data)
            
            if (data.success && data.page) {
              // 從 page 對象中提取 GrapesJS 組件數據
              let grapesComponents = data.page.grapesComponents || data.page.grapesHtml || ''
              console.log('工作區頁面內容已載入:', String(grapesComponents).length, '字符')
              console.log('原始組件數據:', grapesComponents)
              
              // 使用 GrapesJS API 設置內容
              if (grapesComponents) {
                try {
                  // 如果是字符串，嘗試解析為 JSON
                  if (typeof grapesComponents === 'string') {
                    try {
                      const parsedComponents = JSON.parse(grapesComponents)
                      console.log('解析後的組件數據:', parsedComponents)
                      
                      // 檢查是否是數組格式
                      if (Array.isArray(parsedComponents)) {
                        editor.setComponents(parsedComponents)
                      } else {
                        // 如果不是數組，直接使用字符串
                        editor.setComponents(grapesComponents)
                      }
                    } catch (parseError) {
                      console.log('JSON 解析失敗，作為 HTML 處理:', parseError)
                      // 如果 JSON 解析失敗，作為 HTML 字符串處理
                      editor.setComponents(grapesComponents)
                    }
                  } else if (Array.isArray(grapesComponents)) {
                    // 如果已經是數組，直接使用
                    console.log('直接使用數組格式')
                    editor.setComponents(grapesComponents)
                  } else {
                    // 其他情況，使用 loadProjectData
                    console.log('使用 loadProjectData 格式')
                    editor.loadProjectData({
                      assets: [],
                      styles: data.page.grapesStyles || [],
                      pages: [{
                        frames: [{
                          component: grapesComponents
                        }]
                      }]
                    })
                  }
                  
                  // 設置當前工作區頁面信息，供保存功能使用
                  currentWorkspacePageId = pageId
                  currentWorkspacePageName = pageName
                  
                  console.log('✅ 工作區已切換至頁面:', pageName)
                } catch (loadError) {
                  console.error('載入組件數據失敗:', loadError)
                  // 如果所有方法都失敗，設置一個簡單的默認內容
                  editor.setComponents('<div>載入內容時出現問題，請檢查頁面數據</div>')
                }
              } else {
                editor.setComponents('<div>此頁面沒有內容</div>')
              }
            } else {
              throw new Error(data.error || data.message || '載入頁面失敗')
            }
          } catch (error) {
            console.error('工作區載入頁面失敗:', error)
            alert('載入頁面失敗: ' + (error as Error).message)
          } finally {
            isWorkspaceLoading = false
          }
        }
        
        
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
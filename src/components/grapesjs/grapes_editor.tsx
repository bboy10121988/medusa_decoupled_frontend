'use client'

import { useEffect, useRef, useState } from 'react'
import { grapesJSPageService, type GrapesJSPageData, type SavePageParams } from '@/lib/services/grapesjs-page-service'
import { registerCustomComponents } from './custom-components'
import { compressImagesInHtml, compressImage } from '@/lib/image-compression'
import { buildSanityImageUrl, getSanityImages, type SanityImage } from '@/lib/services/sanity-media-service'
import { applyAllPluginCustomizations, getThirdPartyBlocks, modifyPluginBlock } from './plugins/third-party-customization'
import { getPluginsOptions } from './config/plugins-config'
// import { addCarouselConverter } from './utils/carousel-fullwidth-converter'
import { applyZhTW } from './i18n/zh-TW'
import 'grapesjs/dist/css/grapes.min.css'
import './grapes-editor.flat.css'
import './third-party-plugins-custom.css'
import './upload-error-modal.css'
import { PluginControlPanel } from './PluginControlPanel'

// 全域變數來追蹤工作區選中的頁面
let currentWorkspacePageId: string | null = null
let currentWorkspacePageName: string | null = null

// 全局 CSS 樣式內容 - 從 CSS 文件讀取
const globalCSS = `
  /* 確保所有圖片都填滿其容器 */
  img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  /* 圖片容器樣式 */
  [data-gjs-type="image"] {
    height: auto;
    max-width: 100%;
  }
  
  /* 響應式圖片 */
  .responsive-image {
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    object-fit: cover;
    display: block;
  }

  /* 列布局中的圖片自適應 */
  .gjs-row img, 
  .gjs-column img {
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    object-fit: cover;
    display: block;
  }

  /* 列布局基本樣式 - 強化版本 */
  .gjs-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    width: 100% !important;
    min-height: 50px !important;
    box-sizing: border-box !important;
    gap: 15px !important;
  }

  .gjs-column {
    flex-grow: 1;
    flex-shrink: 0;
    flex-basis: 0;
    box-sizing: border-box;
    padding: 10px;
    min-height: 50px;
    position: relative;
  }

  /* ========================================= */
  /* 🎨 編輯器面板和工具列樣式優化 */
  /* ========================================= */
  
  /* 工具列按鈕樣式增強 */
  .gjs-pn-panel .gjs-pn-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border: none !important;
    color: white !important;
    padding: 8px 12px !important;
    margin: 2px !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  }
  
  .gjs-pn-panel .gjs-pn-btn:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
  }
  
  .gjs-pn-panel .gjs-pn-btn.gjs-pn-active {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2) !important;
  }
  
  /* 特定按鈕顏色 */
  .btn-save {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
  }
  
  .btn-save:hover {
    background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%) !important;
  }
  
  .btn-clear {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%) !important;
  }
  
  .btn-clear:hover {
    background: linear-gradient(135deg, #ee5a24 0%, #ff6b6b 100%) !important;
  }
  
  .btn-third-party {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
    color: #333 !important;
  }
  
  .btn-third-party:hover {
    background: linear-gradient(135deg, #fed6e3 0%, #a8edea 100%) !important;
  }
  
  /* 左側面板優化 */
  .gjs-pn-panel.gjs-pn-views {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(10px) !important;
    border-right: 1px solid #e1e5e9 !important;
    box-shadow: 2px 0 10px rgba(0,0,0,0.1) !important;
  }
  
  .gjs-pn-panel.gjs-pn-views .gjs-pn-btn {
    background: transparent !important;
    color: #495057 !important;
    border-radius: 8px !important;
    margin: 4px !important;
    padding: 12px !important;
    transition: all 0.3s ease !important;
  }
  
  .gjs-pn-panel.gjs-pn-views .gjs-pn-btn:hover {
    background: rgba(102, 126, 234, 0.1) !important;
    color: #667eea !important;
  }
  
  .gjs-pn-panel.gjs-pn-views .gjs-pn-btn.gjs-pn-active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3) !important;
  }
  
  /* AssetManager 圖片庫樣式優化 */
  .gjs-am-assets-cont {
    background: #f8f9fa !important;
    border-radius: 8px !important;
    padding: 10px !important;
  }
  
  .gjs-am-asset {
    border-radius: 8px !important;
    transition: all 0.3s ease !important;
    margin: 4px !important;
    overflow: hidden !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  }
  
  .gjs-am-asset:hover {
    transform: scale(1.05) !important;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
  }
  
  .gjs-am-asset img {
    border-radius: 6px !important;
  }
  
  /* 區塊面板樣式優化 */
  .gjs-blocks-c .gjs-block {
    border-radius: 8px !important;
    transition: all 0.3s ease !important;
    margin: 6px 3px !important;
    background: white !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    border: 1px solid #e1e5e9 !important;
  }
  
  .gjs-blocks-c .gjs-block:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 12px rgba(0,0,0,0.15) !important;
    border-color: #667eea !important;
  }
  
  .gjs-block-label {
    font-size: 11px !important;
    font-weight: 500 !important;
    color: #495057 !important;
    padding: 4px !important;
  }

  /* grapesjs-blocks-basic 插件的 cell 樣式 */
  .gjs-cell {
    flex-grow: 1;
    flex-shrink: 0;
    flex-basis: 0;
    box-sizing: border-box;
    padding: 10px;
    min-height: 50px;
    position: relative;
    display: block;
    width: auto;
  }

  /* 兩列布局樣式 */
  .gjs-row.two-columns {
    display: flex !important;
    flex-direction: row !important;
  }
  .gjs-row.two-columns .gjs-column {
    flex: 1 1 calc(50% - 7.5px) !important;
    width: calc(50% - 7.5px) !important;
  }
  .gjs-row.two-columns .gjs-cell {
    flex: 1 1 calc(50% - 7.5px) !important;
    width: calc(50% - 7.5px) !important;
  }

  /* 三列布局樣式 */
  .gjs-row.three-columns {
    display: flex !important;
    flex-direction: row !important;
  }
  .gjs-row.three-columns .gjs-column {
    flex: 1 1 calc(33.333% - 10px) !important;
    width: calc(33.333% - 10px) !important;
  }
  .gjs-row.three-columns .gjs-cell {
    flex: 1 1 calc(33.333% - 10px) !important;
    width: calc(33.333% - 10px) !important;
  }

  /* 手機響應式 */
  @media (max-width: 768px) {
    .gjs-row {
      flex-direction: column !important;
    }
    .gjs-column {
      flex: 1 1 100% !important;
      min-width: 100% !important;
    }
    .gjs-cell {
      flex: 1 1 100% !important;
      min-width: 100% !important;
    }
  }

  .container { 
    max-width: 100% !important; 
    width: 100% !important; 
    padding: 0 !important; 
    margin: 0 !important; 
  }
  .row { 
    margin: 0 !important; 
    padding: 0 !important; 
  }
  [class*="col-"] { 
    padding: 0 !important; 
    margin: 0 !important; 
  }
  .d-flex { 
    display: flex !important; 
  }
  .flex-column { 
    flex-direction: column !important; 
  }
  .flex-row { 
    flex-direction: row !important; 
  }
`

// 重新應用全局樣式的函數
const reapplyGlobalStyles = (editor: any) => {
  console.log('🔄 重新應用全局樣式...')
  
  // 添加到 CSS Composer
  editor.CssComposer.add(globalCSS)
  
  // 添加到 canvas iframe
  const canvas = editor.Canvas
  const canvasDoc = canvas.getDocument()
  if (canvasDoc) {
    // 移除舊樣式（避免重複）
    const oldStyle = canvasDoc.querySelector('[data-grapes-global="true"]')
    if (oldStyle) {
      oldStyle.remove()
    }
    
    const canvasHead = canvasDoc.head || canvasDoc.getElementsByTagName('head')[0]
    const canvasStyle = canvasDoc.createElement('style')
    canvasStyle.setAttribute('data-grapes-global', 'true')
    canvasStyle.appendChild(canvasDoc.createTextNode(globalCSS))
    canvasHead.appendChild(canvasStyle)
    console.log('✅ 全局 CSS 已重新添加到 canvas')
  }
}

// 通用錯誤提示函數
const showUploadError = (title: string, message: string) => {
  // 移除現有的錯誤提示
  const existing = document.querySelector('.upload-error-modal')
  if (existing) existing.remove()

  const errorModal = document.createElement('div')
  errorModal.className = 'upload-error-modal'
  errorModal.innerHTML = `
    <div class="upload-error-overlay">
      <div class="upload-error-content">
        <div class="upload-error-icon">🚫</div>
        <h3 class="upload-error-title">${title}</h3>
        <p class="upload-error-message">${message}</p>
        <button class="upload-error-btn" onclick="this.closest('.upload-error-modal').remove()">
          確定
        </button>
      </div>
    </div>
  `

  document.body.appendChild(errorModal)
  
  // 點擊遮罩關閉
  errorModal.querySelector('.upload-error-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) errorModal.remove()
  })

  // 自動關閉
  setTimeout(() => {
    if (document.body.contains(errorModal)) errorModal.remove()
  }, 8000)
}

// 顯示保存載入提示的函數
const showSaveLoading = () => {
  // 移除既有的載入提示
  const existingModal = document.getElementById('save-loading-modal')
  if (existingModal) {
    existingModal.remove()
  }

  const loadingModal = document.createElement('div')
  loadingModal.id = 'save-loading-modal'
  loadingModal.innerHTML = `
    <div class="save-loading-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    ">
      <div class="save-loading-content" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 32px 48px;
        border-radius: 16px;
        text-align: center;
        color: white;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        min-width: 320px;
        animation: saveLoadingPulse 2s infinite;
      ">
        <div class="save-loading-spinner" style="
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px;">正在保存頁面</h3>
        <p style="margin: 0; opacity: 0.9; font-size: 14px;">
          <span id="save-status-text">正在壓縮和優化數據...</span>
        </p>
        <div class="save-progress-bar" style="
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          margin-top: 16px;
          overflow: hidden;
        ">
          <div class="save-progress-fill" style="
            height: 100%;
            background: white;
            border-radius: 2px;
            width: 0%;
            animation: saveProgress 3s ease-in-out infinite;
          "></div>
        </div>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes saveLoadingPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      @keyframes saveProgress {
        0% { width: 0%; }
        50% { width: 70%; }
        100% { width: 100%; }
      }
    </style>
  `

  document.body.appendChild(loadingModal)
  return loadingModal
}

// 更新保存狀態文字
const updateSaveStatus = (message: string) => {
  const statusElement = document.getElementById('save-status-text')
  if (statusElement) {
    statusElement.textContent = message
  }
}

// 隱藏保存載入提示
const hideSaveLoading = () => {
  const loadingModal = document.getElementById('save-loading-modal')
  if (loadingModal) {
    // 添加淡出效果
    loadingModal.style.opacity = '0'
    loadingModal.style.transform = 'scale(0.9)'
    loadingModal.style.transition = 'all 0.3s ease'
    
    setTimeout(() => {
      if (loadingModal.parentNode) {
        loadingModal.remove()
      }
    }, 300)
  }
}

// 顯示保存成功提示
const showSaveSuccess = (message: string = '頁面保存成功！', duration: number = 3000) => {
  const successToast = document.createElement('div')
  successToast.innerHTML = `
    <div class="save-success-toast" style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(17, 153, 142, 0.3);
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      animation: slideInRight 0.3s ease;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>${message}</span>
    </div>
    <style>
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    </style>
  `

  document.body.appendChild(successToast)
  
  // 自動移除
  setTimeout(() => {
    successToast.style.animation = 'slideInRight 0.3s ease reverse'
    setTimeout(() => {
      if (successToast.parentNode) {
        successToast.remove()
      }
    }, 300)
  }, duration)
}

// 顯示保存錯誤提示
const showSaveError = (message: string) => {
  const errorToast = document.createElement('div')
  errorToast.innerHTML = `
    <div class="save-error-toast" style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      max-width: 400px;
      animation: slideInRight 0.3s ease;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>${message}</span>
    </div>
  `

  document.body.appendChild(errorToast)
  
  // 自動移除
  setTimeout(() => {
    errorToast.style.animation = 'slideInRight 0.3s ease reverse'
    setTimeout(() => {
      if (errorToast.parentNode) {
        errorToast.remove()
      }
    }, 300)
  }, 6000)
}

interface GrapesEditorProps {
  onSave?: (content: string) => void
}

export default function GrapesEditor({ onSave }: Readonly<GrapesEditorProps>) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<any>(null)
  const isPageLoadedRef = useRef<boolean>(false)
  const [pages, setPages] = useState<GrapesJSPageData[]>([])
  const [currentPageId, setCurrentPageId] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<GrapesJSPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPluginPanel, setShowPluginPanel] = useState(false)

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
          
          // 設置全域變數以支援儲存功能
          currentWorkspacePageId = newPage._id!
          currentWorkspacePageName = newPage.title
          
          // 延遲更新工作區頁面列表選中狀態
          setTimeout(() => {
            updateWorkspacePageSelection(newPage._id!, newPage.title)
          }, 100)
        }
      } catch (e: any) {
        console.error('創建默認頁面失敗:', e)
        alert('創建默認頁面失敗: ' + (e.message || e))
      }
    } else {
      // 優先查找標題為"首頁"的頁面
      let homePage = loadedPages.find(page => 
        page.title === '首頁' || 
        page.slug.current === 'home' || 
        page.title?.toLowerCase().includes('home') ||
        page.title?.includes('首頁')
      )
      
      // 如果沒有找到首頁，則使用第一個頁面
      if (!homePage) {
        homePage = loadedPages[0]
        console.log('未找到首頁，使用第一個頁面:', homePage.title)
      } else {
        console.log('找到首頁，載入頁面:', homePage.title)
      }
      
      setCurrentPage(homePage)
      setCurrentPageId(homePage._id!)
      
      // 設置全域變數以支援儲存功能
      currentWorkspacePageId = homePage._id!
      currentWorkspacePageName = homePage.title
      
      // 延遲更新工作區頁面列表選中狀態
      setTimeout(() => {
        updateWorkspacePageSelection(homePage._id!, homePage.title)
      }, 100)
    }
  } catch (error) {
    console.error('載入頁面失敗:', error)
  } finally {
    setIsLoading(false)
  }
}

// 更新工作區頁面列表選中狀態的函數
const updateWorkspacePageSelection = (pageId: string, pageTitle: string) => {
  try {
    const allPageItems = document.querySelectorAll('#workspace-page-list > div')
    allPageItems.forEach(item => {
      item.classList.remove('selected')
      ;(item as HTMLElement).style.backgroundColor = 'transparent'
    })
    
    // 找到對應的頁面項目並設為選中
    const targetPageItem = Array.from(allPageItems).find(item => {
      const onclick = (item as HTMLElement).getAttribute('onclick')
      return onclick && onclick.includes(pageId)
    })
    
    if (targetPageItem) {
      targetPageItem.classList.add('selected')
      ;(targetPageItem as HTMLElement).style.backgroundColor = 'rgb(90, 78, 80)'
      console.log('工作區頁面列表已同步選中:', pageTitle)
    }
  } catch (error) {
    console.warn('更新工作區頁面選中狀態失敗:', error)
  }
}

  // 載入頁面內容到編輯器
  const loadPageToEditor = async (pageId: string, editor: any) => {
    try {
      const pageData = await grapesJSPageService.getPageById(pageId)
      if (pageData) {
        console.log('🔄 載入頁面數據:', {
          title: pageData.title,
          htmlLength: pageData.grapesHtml?.length || 0,
          cssLength: pageData.grapesCss?.length || 0,
          hasComponents: !!pageData.grapesComponents,
          hasStyles: !!pageData.grapesStyles
        })
        
        // 清空編輯器內容防止累積
        editor.setComponents('')
        editor.setStyle('')
        
        // 如果有結構化的組件和樣式數據，優先使用
        if (pageData.grapesComponents || pageData.grapesStyles) {
          const projectData: any = {
            assets: [],
            styles: [],
            pages: [{
              frames: [{
                component: []
              }]
            }]
          }

          // 載入樣式
          if (pageData.grapesStyles) {
            try {
              projectData.styles = typeof pageData.grapesStyles === 'string' 
                ? JSON.parse(pageData.grapesStyles) 
                : pageData.grapesStyles
            } catch (e) {
              console.warn('Failed to parse grapesStyles:', e)
            }
          }

          // 載入組件
          if (pageData.grapesComponents) {
            try {
              const components = typeof pageData.grapesComponents === 'string'
                ? JSON.parse(pageData.grapesComponents)
                : pageData.grapesComponents
              
              projectData.pages[0].frames[0].component = components
            } catch (e) {
              console.warn('Failed to parse grapesComponents:', e)
            }
          }

          editor.loadProjectData(projectData)
        } else {
          // 如果沒有結構化數據，使用 HTML/CSS
          editor.setComponents(pageData.grapesHtml || '')
          editor.setStyle(pageData.grapesCss || '')
        }
        
        // 重要：重新應用全局樣式（在頁面載入後）
        setTimeout(() => {
          reapplyGlobalStyles(editor)
        }, 100)
        
        console.log('✅ 頁面載入成功:', pageData.title)
      }
    } catch (error) {
      console.error('❌ 載入頁面到編輯器失敗:', error)
    }
  }

  // 保存當前頁面 - 改進版，支持工作區和載入提示
  const saveCurrentPage = async (editor: any) => {
    // 顯示載入提示
    const loadingModal = showSaveLoading()
    
    try {
      console.log('💾 開始保存當前頁面...')
      
      // 更新狀態：準備數據
      updateSaveStatus('正在準備頁面數據...')
      
      // 獲取當前編輯器中的內容
      const html = editor.getHtml()
      const css = editor.getCss() 
      const components = editor.getComponents()
      
      // 更新狀態：處理樣式
      updateSaveStatus('正在處理樣式和組件...')
      
      // 使用正確的 GrapesJS API 獲取樣式
      const styleManager = editor.StyleManager
      const styles = styleManager ? styleManager.getAll().map((style: any) => style.toJSON()) : []
      
      // 更新狀態：優化數據
      updateSaveStatus('正在優化和壓縮數據...')
      
      // 清理和優化數據 - 異步處理以不阻塞 UI
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const cleanedComponents = JSON.stringify(components, null, 0) // 移除格式化空格
      const cleanedStyles = JSON.stringify(styles, null, 0)
      
      // 移除 HTML 中的多餘空格和換行 - 優化版本
      let cleanedHtml = html.replace(/\s+/g, ' ').trim()
      const cleanedCss = css.replace(/\s+/g, ' ').trim()
      
      // 檢測是否含有 base64 內嵌圖片，若有則阻止保存並提示使用者改用資產管理器
      const hasEmbeddedImages = /<img[^>]+src=["']data:/i.test(cleanedHtml)
      if (hasEmbeddedImages) {
        hideSaveLoading()
        showSaveError('偵測到以 data URI 方式內嵌的圖片。請改用圖片上傳/資產管理器，系統會自動產生 Sanity CDN 圖片連結以提升效能與可靠性。')
        return false
      }
      
      // 更新狀態：驗證頁面
      updateSaveStatus('正在驗證頁面狀態...')
      
      console.log('準備保存的數據:', {
        html: `${cleanedHtml.length} 字符 (原: ${html.length})`,
        css: `${cleanedCss.length} 字符 (原: ${css.length})`, 
        components: `${cleanedComponents.length} 字符`,
        styles: `${cleanedStyles.length} 字符`
      })

      // 檢查是否有當前頁面狀態
      let targetPageId = currentPageId
      
      // 如果沒有當前頁面狀態，從工作區獲取選中的頁面（包括全域變數）
      if (!targetPageId) {
        const workspacePageId = (window as any).currentWorkspacePageId || currentWorkspacePageId
        if (workspacePageId) {
          targetPageId = workspacePageId
          const workspacePageName = (window as any).currentWorkspacePageName || currentWorkspacePageName
          console.log('使用工作區選中的頁面:', workspacePageName, 'ID:', workspacePageId)
        }
      }
      
      if (!targetPageId) {
        // 如果仍然沒有目標頁面，提示用戶先選擇頁面
        console.error('❌ 沒有找到要保存的頁面 ID')
        hideSaveLoading()
        showSaveError('請先在工作區選擇要保存的頁面')
        return false
      }

      // 獲取正確的 slug
      let pageSlug = 'home' // 預設值
      if (currentPage?.slug?.current) {
        pageSlug = currentPage.slug.current
      } else {
        const workspacePageName = (window as any).currentWorkspacePageName || currentWorkspacePageName
        if (workspacePageName) {
          // 如果有工作區頁面名稱，將其轉換為 slug 格式
          pageSlug = workspacePageName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        }
      }

      // 更新狀態：檢查數據大小
      updateSaveStatus('正在檢查數據大小...')

      // 使用 API 正確的參數格式保存
      const savePayload = {
        pageId: targetPageId,
        pageData: {
          _type: 'grapesJSPageV2',
          title: currentPage?.title || (window as any).currentWorkspacePageName || currentWorkspacePageName || '未命名頁面',
          slug: {
            current: pageSlug,
            _type: 'slug'
          },
          status: 'draft',
          grapesHtml: cleanedHtml,
          grapesCss: cleanedCss,
          grapesComponents: cleanedComponents,
          grapesStyles: cleanedStyles
        }
      }
      
      // 檢查數據大小，防止超過 Sanity 限制（4MB）
      const jsonString = JSON.stringify(savePayload)
      const dataSizeInBytes = new Blob([jsonString]).size
      const dataSizeInMB = dataSizeInBytes / (1024 * 1024)
      
      console.log(`📊 數據大小: ${dataSizeInMB.toFixed(2)} MB`)
      
      if (dataSizeInMB > 3.8) { // 留點緩衝空間
        const error = `數據太大無法保存 (${dataSizeInMB.toFixed(2)} MB)，Sanity 限制為 4MB`
        console.error('❌', error)
        
        hideSaveLoading()
        
        // 提供用戶友好的建議
        const suggestions = [
          '• 刪除一些不必要的圖片',
          '• 減少頁面內容的複雜度', 
          '• 刪除未使用的組件或樣式',
          '• 將大圖片分離到外部存儲'
        ].join('\\n')
        
        showSaveError(`頁面數據過大，無法保存！\\n\\n當前大小: ${dataSizeInMB.toFixed(2)} MB\\nSanity 限制: 4 MB\\n\\n建議解決方案:\\n${suggestions}`)
        return false
      }
      
      // 更新狀態：上傳到服務器
      updateSaveStatus('正在上傳到 Sanity CMS...')
      
      console.log('正在保存到 API...', {
        pageId: targetPageId,
        slug: pageSlug,
        htmlLength: html.length,
        cssLength: css.length,
        dataSizeMB: dataSizeInMB.toFixed(2)
      })

      // 添加更詳細的錯誤處理和重試邏輯
      let response: Response | undefined
      let result: any
      let retryCount = 0
      const maxRetries = 2
      
      while (retryCount <= maxRetries) {
        try {
          // 添加超時控制
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超時
          
          response = await fetch('/api/pages/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(savePayload),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          result = await response.json()
          break // 成功則跳出重試循環
          
        } catch (fetchError: any) {
          retryCount++
          console.warn(`⚠️ 保存嘗試 ${retryCount} 失敗:`, fetchError)
          
          if (retryCount <= maxRetries) {
            updateSaveStatus(`保存失敗，正在重試 (${retryCount}/${maxRetries})...`)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // 漸進式延遲
          } else {
            throw fetchError
          }
        }
      }
      
      // 更新狀態：處理響應
      updateSaveStatus('正在處理服務器響應...')
      
      console.log('✅ API 響應成功:', result)
      
      if (response && response.ok && result.success) {
        console.log('✅ 頁面保存成功!', result.message || '')
        
        // 隱藏載入提示並顯示成功消息
        hideSaveLoading()
        showSaveSuccess(`頁面「${currentPage?.title || currentWorkspacePageName || '未命名頁面'}」保存成功！`)
        
        // 不要重新載入頁面列表，避免重置編輯器內容
        // await loadPages()
        
        // 僅更新工作區頁面列表顯示（如果需要的話）
        const workspaceContainer = document.querySelector('#workspace-page-list')
        if (workspaceContainer) {
          // 可以在這裡更新特定頁面的狀態指示器，而不是重新載入整個列表
          console.log('頁面列表更新已跳過，保持編輯器狀態')
        }
        
        if (onSave) {
          const html = editor.getHtml()
          onSave(html)
        }
        
        return true
      } else {
        const errorMsg = result?.error || (response ? `HTTP ${response.status}: ${response.statusText}` : '未知響應錯誤')
        throw new Error(errorMsg)
      }
      
    } catch (error: any) {
      console.error('❌ 保存頁面失敗:', error)
      
      // 隱藏載入提示並顯示錯誤消息
      hideSaveLoading()
      showSaveError(`保存失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
      
      return false
    }
  }

  useEffect(() => {
    loadPages()
  }, [])

  // 監聽工作區頁面變更事件
  useEffect(() => {
    const handleWorkspacePageChange = (event: any) => {
      const { pageId, pageName } = event.detail
      console.log('🔄 工作區頁面已變更:', pageName, 'ID:', pageId)
      
      // 重置頁面載入標記，允許載入新頁面
      isPageLoadedRef.current = false
      
      // 更新當前頁面信息，用於自動保存
      currentWorkspacePageId = pageId
      currentWorkspacePageName = pageName
      
      // 根據頁面 ID 找到對應的頁面數據
      const foundPage = pages.find(p => 
        p._id === pageId || 
        p.slug?.current === pageId || 
        p.title === pageName
      )
      
      if (foundPage) {
        setCurrentPage(foundPage)
        setCurrentPageId(foundPage._id!)
        console.log('📄 更新當前頁面狀態:', foundPage.title)
      }
      
    }

    window.addEventListener('workspacePageChange', handleWorkspacePageChange)
    
    return () => {
      window.removeEventListener('workspacePageChange', handleWorkspacePageChange)
    }
  }, [pages]) // 依賴 pages 以確保能找到正確的頁面數據

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
          
          // 編輯器優化配置
          avoidInlineStyle: false, // 允許內聯樣式，提升性能
          undoManager: {},
          
          // 禁用預設存儲，我們使用自定義的 Sanity 存儲
          storageManager: {
            type: 'none',
            autoload: false, // 禁用自動載入
            autosave: false, // 禁用自動儲存，我們手動控制
          },

          // 選擇管理器優化
          selectorManager: {
            componentFirst: true, // 組件優先選擇
            custom: true, // 啟用自定義選擇器
          },

          // AssetManager 整合 Sanity
          assetManager: {
            assets: [], // 預先載入 Sanity 圖片庫，稍後動態載入
            upload: '/api/sanity/upload', // 修正為正確的 Sanity 上傳 API 端點
            uploadName: 'file', // 上傳檔案的參數名稱
            multiUpload: true, // 啟用多檔案上傳
            embedAsBase64: false, // 不使用 base64，直接使用 URL
            // AssetManager 整合 Sanity 圖片上傳功能
            // 完全整合 Sanity 的上傳功能，包含圖片壓縮和錯誤處理
            uploadFile: async function(e: any) {
              const files = e.dataTransfer ? e.dataTransfer.files : e.target.files
              const uploadedImages: any[] = []
              
              // 檢查是否有檔案
              if (!files || files.length === 0) {
                showUploadError('無檔案', '請選擇要上傳的圖片檔案。')
                return []
              }
              
              console.log(`📁 開始處理 ${files.length} 個檔案上傳到 Sanity`)
              
              for (let i = 0; i < files.length; i++) {
                const file = files[i]
                
                // 檔案類型驗證
                if (!file.type.startsWith('image/')) {
                  console.warn(`⚠️ 跳過非圖片檔案: ${file.name}`)
                  showUploadError(
                    '檔案類型錯誤', 
                    `「${file.name}」不是圖片檔案，請選擇 JPG、PNG 或 WebP 格式的圖片。`
                  )
                  continue
                }
                
                // 檔案大小驗證（最大 10MB）
                const maxSizeBytes = 10 * 1024 * 1024
                if (file.size > maxSizeBytes) {
                  console.warn(`⚠️ 檔案太大: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`)
                  showUploadError(
                    '檔案太大', 
                    `圖片「${file.name}」超過 10MB 限制，請選擇較小的檔案。`
                  )
                  continue
                }
                
                try {
                  console.log(`🖼️ Sanity AssetManager 處理上傳圖片: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`)
                  
                  // 圖片壓縮處理
                  const compressedDataUrl = await compressImage(file, {
                    maxWidth: 1920, // 提高最大寬度到 1920px
                    maxHeight: 1080, // 提高最大高度到 1080px
                    quality: 0.85, // 提高壓縮品質
                    maxSizeKB: 800 // 提高最大檔案大小到 800KB
                  })
                  
                  // 將壓縮後的 base64 轉換回 File 對象
                  const response = await fetch(compressedDataUrl)
                  const blob = await response.blob()
                  const compressedFile = new File([blob], file.name, { 
                    type: file.type.startsWith('image/png') ? 'image/png' : 'image/jpeg',
                    lastModified: file.lastModified
                  })
                  
                  const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
                  console.log(`✅ 圖片壓縮完成: ${file.name} (${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB, 縮減 ${compressionRatio}%)`)
                  
                  // 上傳到 Sanity（透過伺服器端 API，避免在前端使用寫入憑證）
                  const formData = new FormData()
                  formData.append('file', compressedFile)
                  
                  const uploadRes = await fetch('/api/sanity/upload', {
                    method: 'POST',
                    body: formData,
                  })
                  
                  if (!uploadRes.ok) {
                    const errText = await uploadRes.text()
                    throw new Error(`Upload failed: ${uploadRes.status} ${errText}`)
                  }
                  
                  const uploadJson = await uploadRes.json()
                  if (!uploadJson?.success || !uploadJson?.image) {
                    throw new Error(uploadJson?.error || 'Upload response invalid')
                  }
                  
                  const uploadedImage = uploadJson.image
                  
                  if (uploadedImage && uploadedImage._id) {
                    const imageUrl = buildSanityImageUrl(uploadedImage, 1920, 1080, 85)
                    const sanityAsset = {
                      type: 'image',
                      src: imageUrl,
                      height: uploadedImage.metadata?.dimensions?.height || 800,
                      width: uploadedImage.metadata?.dimensions?.width || 600,
                      name: uploadedImage.originalFilename || file.name,
                      sanityId: uploadedImage._id, // 保存 Sanity ID 方便後續管理
                      alt: uploadedImage.originalFilename || file.name
                    }
                    
                    uploadedImages.push(sanityAsset)
                    console.log(`✅ 圖片已成功上傳到 Sanity: ${file.name} -> ${uploadedImage._id}`)
                    
                    // 立即添加到 AssetManager 中
                    const assetManager = (this as any).em?.get('AssetManager')
                    if (assetManager) {
                      assetManager.add(sanityAsset)
                      console.log('📁 新圖片已添加到 AssetManager 並可立即使用')
                    }
                  } else {
                    throw new Error('Invalid upload response: missing image data')
                  }
                  
                } catch (error) {
                  console.error(`❌ Sanity 圖片上傳處理失敗: ${file.name}`, error)
                  
                  let errorMessage = `處理圖片「${file.name}」時發生錯誤。`
                  let errorTitle = 'Sanity 上傳錯誤'
                  
                  if (error instanceof Error) {
                    const errorMsg = error.message.toLowerCase()
                    if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
                      errorTitle = '網絡連接錯誤'
                      errorMessage = `網絡連接失敗，無法上傳圖片「${file.name}」到 Sanity。請檢查網絡連接後重試。`
                    } else if (errorMsg.includes('size') || errorMsg.includes('large') || errorMsg.includes('413')) {
                      errorTitle = '檔案太大'
                      errorMessage = `圖片「${file.name}」太大，請選擇較小的檔案或降低圖片解析度。`
                    } else if (errorMsg.includes('format') || errorMsg.includes('type') || errorMsg.includes('415')) {
                      errorTitle = '格式不支援'
                      errorMessage = `圖片「${file.name}」格式不支援，請使用 JPG、PNG 或 WebP 格式。`
                    } else if (errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
                      errorTitle = '權限錯誤'
                      errorMessage = `沒有權限上傳圖片到 Sanity，請聯系管理員檢查設定。`
                    }
                  }
                  
                  showUploadError(errorTitle, errorMessage)
                }
              }
              
              console.log(`📋 Sanity 上傳完成: ${uploadedImages.length}/${files.length} 個檔案成功上傳`)
              return uploadedImages
            }
          },

          // 設備管理器：響應式設計預設值
          deviceManager: {
            devices: [
              { 
                name: '大螢幕', 
                width: '', 
                widthMedia: '1400px',
                height: ''
              },
              { 
                name: '桌機', 
                width: '', 
                widthMedia: '1200px',
                height: ''
              },
              { 
                name: '筆電', 
                width: '1024px', 
                widthMedia: '1024px',
                height: '768px'
              },
              { 
                name: '平板橫向', 
                width: '992px', 
                widthMedia: '992px',
                height: '744px'
              },
              { 
                name: '平板直向', 
                width: '768px', 
                widthMedia: '768px',
                height: '1024px'
              },
              { 
                name: '大手機', 
                width: '480px', 
                widthMedia: '480px',
                height: '854px'
              },
              { 
                name: '手機', 
                width: '375px', 
                widthMedia: '375px',
                height: '667px'
              },
              { 
                name: '小手機', 
                width: '320px', 
                widthMedia: '320px',
                height: '568px'
              },
            ]
          },

          // Canvas 配置：編輯器畫布設置
          canvas: {
            styles: [
              // Bootstrap CSS - 提供基礎樣式框架
              'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
              // FontAwesome - 圖標庫
              'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
              // Splide CSS - 輪播組件樣式
              'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css'
            ],
            scripts: [
              // Bootstrap JavaScript - 互動功能
              'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js',
              // Splide JavaScript - 輪播組件功能
              'https://cdn.jsdelivr.net/npm/@redoc_a2k/splide@4.1.4/dist/js/splide.min.js'
            ],
            customBadgeLabel: () => '拖拽編輯',
            autoscrollLimit: 50,
            notTextable: ['button', 'a', 'input[type=checkbox]', 'input[type=radio]']
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

          // 使用外部配置文件管理插件選項
          pluginsOpts: getPluginsOptions()
        })

        // 設定 GrapesJS 介面為繁體中文
        try { 
          applyZhTW(editor)
          editor.on('load', () => applyZhTW(editor))
        } catch (e) { 
          console.warn('設定繁體中文介面失敗:', e) 
        }

        // 註冊自定義組件
        registerCustomComponents(editor)

        // 🎯 應用第三方插件客製化並監控效能
        try {
          console.log('⚡ 開始應用第三方插件客製化')
          const startTime = performance.now()
          
          applyAllPluginCustomizations(editor)
          
          const endTime = performance.now()
          console.log(`⏱️ 插件客製化完成，耗時: ${(endTime - startTime).toFixed(2)}ms`)
          
          // 列出所有第三方插件區塊以供調試
          const thirdPartyBlocks = getThirdPartyBlocks(editor)
          console.log('🔌 第三方插件區塊列表:', thirdPartyBlocks)
          console.log(`📊 載入的插件區塊數量: ${thirdPartyBlocks.length}`)
          
          // 驗證插件功能
          const blockManager = editor.BlockManager
          const allBlocks = blockManager.getAll()
          console.log('🧩 所有區塊管理器中的區塊數量:', allBlocks.length)
          
          // 按類別統計區塊
          const blocksByCategory = allBlocks.reduce((acc: any, block: any) => {
            const category = block.get('category') || '其他'
            acc[category] = (acc[category] || 0) + 1
            return acc
          }, {})
          console.log('📈 區塊按類別統計:', blocksByCategory)
          
          // 插件客製化示例已移除
          
          // 增強輪播組件 - 不再添加全寬工具欄按鈕
          setTimeout(() => {
            try {
              console.log('✅ 輪播組件已準備就緒（已移除全寬功能）')
            } catch (error) {
              console.warn('⚠️ 輪播組件配置警告:', error)
            }
          }, 1000)
          
        } catch (error) {
          console.warn('⚠️ 第三方插件客製化出現錯誤:', error)
        }

        // 自訂 Trait：image-url，可直接開啟 Sanity 選圖並回填 URL
        try {
          const tm = editor.TraitManager
          const textType = tm.getType('text') as any
          tm.addType('image-url', {
            model: textType.model.extend({}, {
              defaults: {
                ...(textType.model.prototype.defaults || {}),
                type: 'image-url',
                placeholder: '選擇或貼上圖片網址',
              }
            }),
            view: textType.view.extend({
              events: {
                ...(textType.view.prototype.events || {}),
                'click .gjs-trt-btn-image': 'openPicker',
              },
              onRender() {
                textType.view.prototype.onRender.apply(this, arguments as any)
                const el = this.el
                const btn = document.createElement('button')
                btn.type = 'button'
                btn.className = 'gjs-trt-btn gjs-trt-btn-image'
                btn.style.marginLeft = '6px'
                btn.style.padding = '4px 8px'
                btn.style.backgroundColor = '#007bff'
                btn.style.color = 'white'
                btn.style.border = 'none'
                btn.style.borderRadius = '4px'
                btn.style.cursor = 'pointer'
                btn.textContent = '選圖'

                // 縮圖預覽
                const preview = document.createElement('img')
                preview.style.maxWidth = '36px'
                preview.style.maxHeight = '24px'
                preview.style.marginLeft = '6px'
                preview.style.objectFit = 'cover'
                preview.style.borderRadius = '3px'
                preview.style.border = '1px solid rgba(0,0,0,0.08)'

                const input = el.querySelector('input') as HTMLInputElement | null
                if (input) {
                  const updatePreview = () => {
                    const val = input.value || ''
                    if (val.startsWith('http')) {
                      preview.src = val
                      preview.style.display = 'inline-block'
                    } else {
                      preview.style.display = 'none'
                    }
                  }
                  input.addEventListener('input', updatePreview)
                  updatePreview()

                  // 綁定點擊事件到按鈕
                  const self = this
                  btn.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🖱️ Hero區塊圖片選擇按鈕被點擊')
                    
                    editor.runCommand('open-sanity-image-picker', {
                      callback: (url: string) => {
                        console.log('📷 選中圖片URL:', url)
                        input.value = url
                        // 觸發 GrapesJS 的變更流
                        self.model.set('value', url)
                        self.model.trigger('change:value')
                        const evt = new Event('input', { bubbles: true })
                        input.dispatchEvent(evt)
                        updatePreview()
                      }
                    })
                  })
                }

                const cnt = el.querySelector('.gjs-trt-trait') || el
                cnt.appendChild(btn)
                cnt.appendChild(preview)
              },
              openPicker(e: MouseEvent) {
                e.preventDefault()
                console.log('🎯 openPicker 方法被調用')
                const input = this.el.querySelector('input') as HTMLInputElement | null
                const self = this
                editor.runCommand('open-sanity-image-picker', {
                  callback(url: string) {
                    if (input) {
                      input.value = url
                      // 觸發 GrapesJS 的變更流
                      self.model.set('value', url)
                      self.model.trigger('change:value')
                      const evt = new Event('input', { bubbles: true })
                      input.dispatchEvent(evt)
                    }
                  }
                })
              }
            })
          })
          console.log('✅ image-url trait 註冊成功')
          
          // 測試 image-url trait 是否正常工作
          setTimeout(() => {
            const imageUrlTraits = document.querySelectorAll('.gjs-trt-btn-image')
            console.log('🔍 找到的圖片選擇按鈕數量:', imageUrlTraits.length)
            imageUrlTraits.forEach((btn, index) => {
              console.log(`📷 按鈕 ${index + 1}:`, btn.textContent, btn.className)
            })
          }, 2000)
          
        } catch (e) {
          console.warn('❌ 註冊 image-url trait 失敗:', e)
        }

        // 載入 Sanity 圖片到 AssetManager 圖片管理器
        const loadSanityImages = async () => {
          try {
            console.log('🔄 載入 Sanity 圖片庫到 AssetManager...')
            
            // 添加載入狀態指示器
            const assetManager = editor.AssetManager
            const loadingAsset = {
              type: 'image',
              src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJ2NE0xOC4zNjQgNS42MzZsLTIuODI4IDIuODI4TTIyIDEyaC00TTUuNjM2IDE4LjM2NGwyLjgyOC0yLjgyOE0yIDEyaDRNNS42MzYgNS42MzZsLTIuODI4IDIuODI4TTEyIDIydi00TTE4LjM2NCAxOC4zNjRsLTIuODI4LTIuODI4IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+',
              name: '正在載入 Sanity 圖片庫...',
              category: 'loading'
            }
            assetManager.add([loadingAsset])
            
            // 環境變數檢查和日誌記錄
            console.log('🔧 Sanity 配置檢查:')
            const config = {
              projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
              dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
              tokenLength: process.env.NEXT_PUBLIC_SANITY_TOKEN?.length || 0,
              hasToken: !!process.env.NEXT_PUBLIC_SANITY_TOKEN
            }
            console.log(config)
            
            // 檢查 Sanity 配置完整性
            if (!config.projectId || !config.dataset) {
              throw new Error('Sanity 配置不完整：缺少 Project ID 或 Dataset')
            }
            
            if (!config.hasToken) {
              console.warn('⚠️ 警告：沒有 Sanity Token，可能影響圖片載入')
            }
            
            // 載入 Sanity 圖片
            const images = await getSanityImages()
            console.log(`📊 從 Sanity 獲取到 ${images.length} 張圖片`)
            
            // 移除載入指示器
            assetManager.getAll().reset()
            
            if (images.length === 0) {
              // 顯示空狀態
              const emptyAsset = {
                type: 'image',
                src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im04IDJoOGE0IDQgMCAwIDEgNCA0djhhNCA0IDAgMCAxLTQgNEg4YTQgNCAwIDAgMS00LTRWNmE0IDQgMCAwIDEgNC00eiIgZmlsbD0iI2U1ZTdlYiIvPgo8cGF0aCBkPSJtOSA5IDUgMTJMMjIgOSIgZmlsbD0iI2Q0ZWRkYSIvPgo8L3N2Zz4=',
                name: '圖片庫為空 - 請上傳圖片到 Sanity',
                category: 'empty'
              }
              assetManager.add([emptyAsset])
              console.log('📂 Sanity 圖片庫為空')
              return
            }
            
            // 限制初始載入數量以提升性能
            const maxInitialImages = 50
            const imagesToShow = images.slice(0, maxInitialImages)
            
            // 將 Sanity 圖片轉換為 GrapesJS AssetManager 格式
            const sanityAssets = imagesToShow.map((img: SanityImage) => {
              const dimensions = img.metadata?.dimensions || { width: 300, height: 200 }
              
              return {
                type: 'image',
                src: buildSanityImageUrl(img, 400, 300, 85), // 提升預覽品質
                height: Math.min(dimensions.height, 150),
                width: Math.min(dimensions.width, 150),
                name: img.originalFilename || `圖片-${img._id.slice(-6)}`,
                sanityId: img._id,
                category: 'sanity-images',
                // 添加額外的元數據
                fullSrc: buildSanityImageUrl(img, 1920, 1080, 90),
                originalDimensions: dimensions,
                createdAt: img._createdAt,
                size: dimensions.width > 1000 ? '高解析度' : '標準'
              }
            })
            
            // 載入圖片到 AssetManager
            assetManager.add(sanityAssets)
            console.log(`✅ 成功載入 ${sanityAssets.length} 張 Sanity 圖片到 AssetManager`)
            
            // 如果有更多圖片，添加載入更多的選項
            if (images.length > maxInitialImages) {
              const loadMoreAsset = {
                type: 'image',
                src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDV2MTRNNSAxMmgxNCIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
                name: `載入更多圖片 (還有 ${images.length - maxInitialImages} 張)`,
                category: 'load-more'
              }
              assetManager.add([loadMoreAsset])
            }
            
            console.log('📸 Sanity 圖片管理器已就緒')
            
            // 驗證 AssetManager 內容
            const currentAssets = assetManager.getAll()
            console.log('🔍 AssetManager 當前資產數量:', currentAssets.length)
            
          } catch (error) {
            console.error('❌ 載入 Sanity 圖片庫失敗:', error)
            console.error('❌ 錯誤詳情:', error instanceof Error ? error.stack : error)
            
            // 移除載入指示器並顯示錯誤狀態
            const assetManager = editor.AssetManager
            assetManager.getAll().reset()
            
            const errorAsset = {
              type: 'image',
              src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmZWY3ZjciLz4KPHBhdGggZD0ibTkgOSAzIDMgMy0zTTE1IDE1aC0uMDFNMTIgM3YyTTE4LjM2NCA1LjYzNmwtMS40MTQgMS40MTQiIHN0cm9rZT0iI2ZiNzE4NSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+',
              name: `載入失敗：${error instanceof Error ? error.message : '未知錯誤'}`,
              category: 'error'
            }
            assetManager.add([errorAsset])
          }
        }

        // AssetManager 選擇事件 - 處理用戶從 Sanity 圖片庫選擇圖片
        editor.on('asset:select', (asset: any) => {
          console.log('🎯 用戶從 Sanity 圖片管理器選擇了圖片:', asset)
          
          try {
            // 檢查是否是特殊類型的資產
            const assetCategory = asset.get ? asset.get('category') : asset.category
            
            if (assetCategory === 'load-more') {
              // 處理載入更多功能
              console.log('🔄 用戶點擊載入更多圖片')
              loadMoreImages()
              return
            }
            
            if (assetCategory === 'loading' || assetCategory === 'error' || assetCategory === 'empty') {
              // 忽略載入狀態、錯誤或空狀態的點擊
              console.log('⚠️ 忽略特殊狀態資產的選擇')
              return
            }
            
            // 獲取當前選中的組件
            const selected = editor.getSelected()
            const assetSrc = asset.get ? asset.get('src') : asset.src
            const fullSrc = asset.get ? asset.get('fullSrc') : asset.fullSrc
            const finalSrc = fullSrc || assetSrc // 優先使用高品質版本
            
            console.log('🖼️ 使用圖片 URL:', { preview: assetSrc, full: fullSrc, final: finalSrc })
            
            if (selected && selected.get('type') === 'image') {
              // 如果選中的是圖片組件，更新其 src 屬性
              console.log('� 更新現有圖片組件')
              
              selected.addAttributes({ src: finalSrc })
              selected.set('src', finalSrc)
              
              // 保存原始尺寸資訊
              const originalDimensions = asset.get ? asset.get('originalDimensions') : asset.originalDimensions
              if (originalDimensions) {
                selected.set('originalWidth', originalDimensions.width)
                selected.set('originalHeight', originalDimensions.height)
              }
              
              // 觸發重新渲染
              selected.trigger('change:attributes')
              editor.trigger('change:canvas')
              console.log('✅ 現有圖片組件已更新')
              
            } else {
              // 如果沒有選中圖片組件，創建新的圖片組件
              console.log('🆕 創建新的圖片組件')
              
              const imageComponent = {
                type: 'image',
                attributes: {
                  src: finalSrc,
                  alt: '從 Sanity 圖片庫載入的圖片',
                  loading: 'lazy' // 添加延遲載入
                },
                style: {
                  'max-width': '100%',
                  'height': 'auto',
                  'display': 'block'
                }
              }
              
              // 尋找合適的插入位置
              const wrapper = editor.getWrapper()
              
              if (!wrapper) {
                console.error('❌ 無法獲取頁面 wrapper')
                return
              }
              
              if (selected && selected.get('type') !== 'wrapper') {
                // 如果選中了其他組件，嘗試在其後面插入
                const parent = selected.parent()
                if (parent) {
                  const selectedIndex = parent.components().indexOf(selected)
                  parent.components().add(imageComponent, { at: selectedIndex + 1 })
                  console.log('📍 圖片已插入到選中組件後面')
                } else {
                  wrapper.components().add(imageComponent)
                  console.log('📍 圖片已插入到頁面根部')
                }
              } else {
                // 默認插入到頁面根部
                wrapper.components().add(imageComponent)
                console.log('📍 圖片已插入到頁面根部')
              }
              
              // 選中新添加的圖片
              setTimeout(() => {
                try {
                  const allComponents = wrapper.components()
                  if (allComponents.length > 0) {
                    // 尋找最後添加的圖片組件
                    for (let i = allComponents.length - 1; i >= 0; i--) {
                      const comp = allComponents.at(i)
                      if (comp && comp.get('type') === 'image' && comp.get('src') === finalSrc) {
                        editor.select(comp)
                        console.log('🎯 已選中新添加的圖片組件')
                        break
                      }
                    }
                  }
                } catch (selectError) {
                  console.warn('⚠️ 無法自動選中新圖片:', selectError)
                }
              }, 100)
              
              console.log('✅ 新圖片組件已創建')
            }
            
            // 關閉 AssetManager 面板
            const panels = editor.Panels
            const assetPanel = panels.getPanel('views-container')?.buttons?.find(btn => btn.id === 'open-assets')
            if (assetPanel && assetPanel.get('active')) {
              assetPanel.set('active', false)
              console.log('🔐 已關閉圖片管理器面板')
            }
            
            console.log('✅ Sanity 圖片已成功插入/更新到編輯器')
            
          } catch (error) {
            console.error('❌ 處理 Sanity 圖片選擇時發生錯誤:', error)
            alert(`圖片插入失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
          }
        })

        // 載入更多圖片的功能
        const loadMoreImages = async () => {
          try {
            console.log('🔄 載入更多 Sanity 圖片...')
            const assetManager = editor.AssetManager
            
            // 移除載入更多按鈕
            const currentAssets = assetManager.getAll()
            const filteredAssets = currentAssets.filter((asset: any) => {
              const category = asset.get ? asset.get('category') : asset.category
              return category !== 'load-more'
            })
            assetManager.getAll().reset(filteredAssets)
            
            // 載入剩餘圖片
            const images = await getSanityImages()
            const currentCount = filteredAssets.length
            const remainingImages = images.slice(currentCount)
            
            if (remainingImages.length > 0) {
              const additionalAssets = remainingImages.map((img: SanityImage) => {
                const dimensions = img.metadata?.dimensions || { width: 300, height: 200 }
                
                return {
                  type: 'image',
                  src: buildSanityImageUrl(img, 400, 300, 85),
                  height: Math.min(dimensions.height, 150),
                  width: Math.min(dimensions.width, 150),
                  name: img.originalFilename || `圖片-${img._id.slice(-6)}`,
                  sanityId: img._id,
                  category: 'sanity-images',
                  fullSrc: buildSanityImageUrl(img, 1920, 1080, 90),
                  originalDimensions: dimensions,
                  createdAt: img._createdAt,
                  size: dimensions.width > 1000 ? '高解析度' : '標準'
                }
              })
              
              assetManager.add(additionalAssets)
              console.log(`✅ 已載入額外 ${additionalAssets.length} 張圖片`)
            }
            
          } catch (error) {
            console.error('❌ 載入更多圖片失敗:', error)
          }
        }

        // 編輯器載入完成後自動載入 Sanity 圖片庫
        editor.on('load', loadSanityImages)

        // 修改默認 Image 組件設定 - 讓圖片填滿容器寬度並在列布局中自適應
        editor.DomComponents.addType('image', {
          isComponent: el => {
            if (el.tagName == 'IMG') {
              return {type: 'image'}
            }
          },
          model: {
            defaults: {
              tagName: 'img',
              draggable: '*',
              droppable: false,
              resizable: {
                ratioDefault: 1, // 保持比例
                minDim: 32, // 最小尺寸
                currentUnit: 1,
                step: 0.2,
                keyHeight: 'height',
                keyWidth: 'width',
                keepAutoHeight: 1,
                keepAutoWidth: 1,
              },
              style: {
                width: '100%', // 預設填滿容器寬度
                height: 'auto', // 自動高度保持比例
                'max-width': '100%', // 確保不會超出容器
                'object-fit': 'cover', // 填充方式
                display: 'block',
                'box-sizing': 'border-box' // 包含邊框和內邊距
              },
              attributes: {
                src: 'https://via.placeholder.com/400x300/cccccc/969696?text=Image',
                alt: 'Image'
              },
              traits: [
                {
                  type: 'text',
                  name: 'alt',
                  label: '替代文字'
                },
                {
                  type: 'text', 
                  name: 'title',
                  label: '標題'
                },
                {
                  type: 'select',
                  name: 'object-fit',
                  label: '填充方式',
                  options: [
                    {id: 'cover', value: 'cover', name: '覆蓋 (裁切填滿)'},
                    {id: 'contain', value: 'contain', name: '包含 (完整顯示)'},
                    {id: 'fill', value: 'fill', name: '拉伸填滿'},
                    {id: 'none', value: 'none', name: '原始尺寸'},
                    {id: 'scale-down', value: 'scale-down', name: '縮小顯示'}
                  ]
                },
                {
                  type: 'checkbox',
                  name: 'responsive',
                  label: '響應式圖片',
                  changeProp: true
                }
              ]
            },

            init() {
              // 監聽響應式設定變化
              this.on('change:responsive', this.toggleResponsive);
            },

            toggleResponsive() {
              const isResponsive = this.get('responsive');
              if (isResponsive) {
                this.addClass('responsive-image');
                this.setStyle({
                  width: '100%',
                  height: 'auto',
                  'max-width': '100%',
                  'object-fit': 'cover',
                  display: 'block'
                });
              } else {
                this.removeClass('responsive-image');
              }
            }
          },
          extend: 'image'
        })

        // 添加全局 CSS 規則來確保圖片填滿容器並在列布局中正確縮放
        // 添加到編輯器樣式管理器
        editor.on('load', () => {
          // 添加到 CSS Composer
          editor.CssComposer.add(globalCSS)
          
          // 添加到 canvas iframe
          const canvas = editor.Canvas
          const canvasDoc = canvas.getDocument()
          if (canvasDoc) {
            const canvasHead = canvasDoc.head || canvasDoc.getElementsByTagName('head')[0]
            const canvasStyle = canvasDoc.createElement('style')
            canvasStyle.setAttribute('data-grapes-global', 'true')
            canvasStyle.appendChild(canvasDoc.createTextNode(globalCSS))
            canvasHead.appendChild(canvasStyle)
            console.log('✅ 全局 CSS 已添加到 canvas')
          }
          
          console.log('✅ 全局樣式已應用到編輯器')
        })

        // Canvas 準備好時的備用樣式添加
        editor.on('canvas:ready', () => {
          const canvas = editor.Canvas
          const canvasDoc = canvas.getDocument()
          
          if (canvasDoc && !canvasDoc.querySelector('[data-grapes-global="true"]')) {
            const canvasHead = canvasDoc.head || canvasDoc.getElementsByTagName('head')[0]
            const canvasStyle = canvasDoc.createElement('style')
            canvasStyle.setAttribute('data-grapes-global', 'true')
            canvasStyle.appendChild(canvasDoc.createTextNode(globalCSS))
            canvasHead.appendChild(canvasStyle)
            console.log('✅ Canvas ready：備用全局 CSS 已添加')
          }
        })

        // 確保工具欄功能啟用
        editor.on('load', () => {
          console.log('GrapesJS 載入完成，工具欄功能應該已啟用')
          
          // 在編輯器載入完成後，自動加載 home 頁面（如果還沒載入過）
          if (currentPage && currentPageId && !isPageLoadedRef.current) {
            console.log('🏠 自動載入 home 頁面:', currentPage.title)
            loadPageToEditor(currentPageId, editor)
            isPageLoadedRef.current = true
          }
        })

        // 監聽組件選擇事件以調試工具欄和 traits
        editor.on('component:selected', (model: any) => {
          console.log('🎯 組件被選中:', {
            type: model.get('type'),
            tagName: model.get('tagName'),
            toolbar: model.get('toolbar'),
            attributes: model.get('attributes'),
            moduleType: model.get('attributes')?.['data-module-type']
          })
          
          // 檢查 traits
          const traits = model.get('traits')
          if (traits && traits.length > 0) {
            console.log('🎛️ 組件的 traits:', traits.map((trait: any) => ({
              type: trait.get('type'),
              name: trait.get('name'),
              label: trait.get('label')
            })))
            
            // 特別檢查 image-url 類型的 traits
            const imageUrlTraits = traits.filter((trait: any) => trait.get('type') === 'image-url')
            if (imageUrlTraits.length > 0) {
              console.log('📷 找到 image-url traits:', imageUrlTraits.length, '個')
              setTimeout(() => {
                const buttons = document.querySelectorAll('.gjs-trt-btn-image')
                console.log('🔍 DOM中的圖片選擇按鈕:', buttons.length, '個')
              }, 100)
            }
          }
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

        // 自定義圖片選擇命令已移除；使用全域圖片選擇器處理流程

        // 添加手動測試圖片選擇器的命令
        editor.Commands.add('test-image-picker', {
          run: async (editor: any) => {
            console.log('🧪 手動測試圖片選擇器')
            try {
              const { showSanityImagePicker } = await import('./sanity-image-picker')
              
              showSanityImagePicker({
                onSelect: (imageUrl: string) => {
                  console.log('✅ 測試成功 - 選中圖片:', imageUrl)
                  alert(`圖片選擇器工作正常！\n選中的圖片: ${imageUrl}`)
                },
                onClose: () => {
                  console.log('🚪 圖片選擇器已關閉')
                },
                allowUpload: true
              })
            } catch (error) {
              console.error('❌ 圖片選擇器測試失敗:', error)
              alert('圖片選擇器測試失敗，請檢查控制台')
            }
          }
        })

        // 測試圖片選擇器按鈕與 open-assets 覆蓋已移除（由全域圖片選擇器統一處理）

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

        // ===================================================
        // 🎨 優化編輯器面板布局和用戶介面
        // ===================================================
        
        console.log('🎨 開始配置編輯器面板和工具列')
        
        // 添加優化的工具列按鈕
        editor.Panels.addButton('options', [
          {
            id: 'save-btn',
            className: 'btn-save gjs-pn-btn',
            label: '<i class="fa fa-save"></i>',
            command: 'save-content',
            attributes: { 
              title: '保存頁面 (Ctrl+S)',
              'data-tooltip': '保存當前頁面到 Sanity CMS'
            }
          },
          {
            id: 'undo-btn',
            className: 'btn-undo gjs-pn-btn',
            label: '<i class="fa fa-undo"></i>',
            command: 'core:undo',
            attributes: {
              title: '撤銷 (Ctrl+Z)',
              'data-tooltip': '撤銷上一個操作'
            }
          },
          {
            id: 'redo-btn', 
            className: 'btn-redo gjs-pn-btn',
            label: '<i class="fa fa-redo"></i>',
            command: 'core:redo',
            attributes: {
              title: '重做 (Ctrl+Y)',
              'data-tooltip': '重做上一個撤銷的操作'
            }
          },
          {
            id: 'clear-btn',
            className: 'btn-clear gjs-pn-btn',
            label: '<i class="fa fa-trash"></i>',
            command: {
              run: (editor: any) => {
                if (confirm('確定要清空整個頁面嗎？此操作無法撤銷。')) {
                  editor.setComponents('')
                  editor.setStyle('')
                  console.log('🗑️ 頁面已清空')
                }
              }
            },
            attributes: {
              title: '清空頁面',
              'data-tooltip': '清除頁面所有內容'
            }
          },
          {
            id: 'third-party-panel',
            className: 'btn-third-party gjs-pn-btn',
            label: '<i class="fa fa-puzzle-piece"></i>',
            command: () => setShowPluginPanel(true),
            attributes: { 
              title: '第三方插件控制面板',
              'data-tooltip': '管理和配置第三方插件'
            }
          }
        ])
        
        // 優化 views 面板按鈕
        editor.Panels.addButton('views', [
          {
            id: 'show-workspace',
            className: 'gjs-pn-btn',
            label: '<i class="fa fa-th-large"></i>',
            command: 'show-workspace',
            attributes: { 
              title: '工作區管理',
              'data-tooltip': '切換和管理工作區'
            }
          },
          {
            id: 'show-assets-enhanced',
            className: 'gjs-pn-btn',
            label: '<i class="fa fa-image"></i>',
            command: 'show-assets-enhanced',
            attributes: {
              title: 'Sanity 圖片庫',
              'data-tooltip': '瀏覽和插入 Sanity 圖片資源'
            }
          }
        ])
        
        // 添加增強的圖片庫命令
        editor.Commands.add('show-assets-enhanced', {
          run: (editor: any) => {
            const assetManager = editor.AssetManager
            const assets = assetManager.getAll()
            
            console.log('🖼️ 打開增強的圖片庫')
            console.log(`📊 當前圖片數量: ${assets.length}`)
            
            // 觸發打開 AssetManager
            editor.runCommand('open-assets')
            
            // 如果沒有圖片，自動載入 Sanity 圖片
            if (assets.length === 0) {
              console.log('🔄 自動載入 Sanity 圖片庫...')
              // 觸發載入 Sanity 圖片的函數（已在上面定義）
              loadSanityImages()
            }
          }
        })
        
        // 添加快捷鍵支援
        editor.on('load', () => {
          const keymaps = editor.Keymaps
          
          // 自定義快捷鍵
          keymaps.add('core:save', 'ctrl+s', 'save-content')
          keymaps.add('core:save-alt', 'cmd+s', 'save-content')
          keymaps.add('core:assets', 'ctrl+alt+a', 'show-assets-enhanced')
          keymaps.add('core:workspace', 'ctrl+alt+w', 'show-workspace')
          
          console.log('⌨️ 快捷鍵已配置:')
          console.log('  - Ctrl+S / Cmd+S: 保存頁面')
          console.log('  - Ctrl+Alt+A: 打開圖片庫')
          console.log('  - Ctrl+Alt+W: 打開工作區')
        })
        
        // ===================================================
        // ⚡ 性能優化和監控設定
        // ===================================================
        
        console.log('⚡ 開始配置編輯器性能優化')
        const performanceStartTime = performance.now()
        
        // 性能監控事件
        editor.on('load', () => {
          const loadTime = performance.now() - performanceStartTime
          console.log(`🚀 編輯器載入完成，總耗時: ${loadTime.toFixed(2)}ms`)
          
          // 記錄性能指標
          const performanceMetrics = {
            loadTime: loadTime.toFixed(2),
            totalBlocks: editor.BlockManager.getAll().length,
            totalComponents: editor.Components.getAll().length,
            deviceCount: editor.DeviceManager.getDevices().length,
            memoryUsed: (performance as any).memory ? `${((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : '未知'
          }
          console.table(performanceMetrics)
          
          // 驗證關鍵功能
          console.log('🔍 驗證關鍵功能...')
          
          // 驗證 Sanity 整合
          const assetManager = editor.AssetManager
          const sanityAssets = assetManager.getAll().filter((asset: any) => {
            const category = asset.get ? asset.get('category') : asset.category
            return category === 'sanity-images'
          })
          console.log(`✅ Sanity 圖片整合: ${sanityAssets.length} 張圖片已載入`)
          
          // 驗證插件載入
          const allBlocks = editor.BlockManager.getAll()
          const pluginBlocks = allBlocks.filter((block: any) => {
            const category = block.get('category')
            return category && !['基本', 'Basic'].includes(category)
          })
          console.log(`✅ 第三方插件: ${pluginBlocks.length} 個插件區塊已載入`)
          
          // 驗證響應式設備
          const devices = editor.DeviceManager.getDevices()
          console.log(`✅ 響應式設備: ${devices.length} 個設備預設已配置`)
          
          console.log('🎯 編輯器已完全就緒，所有功能正常')
        })
        
        // 組件變更性能監控
        let componentChangeCount = 0
        editor.on('component:add component:remove component:update', () => {
          componentChangeCount++
          if (componentChangeCount % 10 === 0) {
            console.log(`📊 組件變更計數: ${componentChangeCount}`)
            
            // 檢查內存使用情況
            if ((performance as any).memory) {
              const memoryInfo = (performance as any).memory
              const memoryUsage = {
                used: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                total: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                limit: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
              }
              console.log('💾 內存使用狀況:', memoryUsage)
            }
          }
        })
        
        // 自動垃圾回收提醒
        setInterval(() => {
          if ((performance as any).memory) {
            const memoryInfo = (performance as any).memory
            const usagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
            
            if (usagePercent > 80) {
              console.warn(`⚠️ 內存使用率較高: ${usagePercent.toFixed(1)}%，建議保存頁面並重新整理`)
            }
          }
        }, 30000) // 每30秒檢查一次
        
        // 添加性能優化建議
        const optimizePerformance = () => {
          // 確保 editor 和其屬性已初始化
          if (!editor || !editor.Components || !editor.BlockManager) {
            console.warn('⚠️ 編輯器尚未完全初始化，跳過性能檢查')
            return
          }
          
          try {
            const allComponents = editor.Components.getAll()
            const imageComponents = allComponents.filter((comp: any) => comp.get('type') === 'image')
            
            if (imageComponents.length > 20) {
              console.warn(`🖼️ 頁面包含 ${imageComponents.length} 張圖片，建議優化圖片數量以提升性能`)
            }
            
            const allBlocks = editor.BlockManager.getAll()
            if (allBlocks.length > 100) {
              console.warn(`🧩 區塊管理器中有 ${allBlocks.length} 個區塊，考慮清理不必要的區塊`)
            }
          } catch (error) {
            console.warn('⚠️ 性能檢查時發生錯誤:', error)
          }
        }
        
        // 在編輯器完全加載後執行性能檢查
        editor.on('load', () => {
          setTimeout(optimizePerformance, 5000)
        })
        
        console.log('✅ 性能監控和優化配置完成')
        
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
        // 注意：currentWorkspacePageId 和 currentWorkspacePageName 已在組件頂部定義
        
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
                  
                  // 重新應用全局樣式（在頁面載入後）
                  setTimeout(() => {
                    reapplyGlobalStyles(editor)
                  }, 100)
                  
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
            console.log('💾 儲存命令被觸發')
            console.log('當前頁面狀態:', {
              currentPageId,
              currentWorkspacePageId,
              currentWorkspacePageName,
              currentPage: currentPage?.title
            })
            
            // 先檢查編輯器和頁面狀態
            if (!editor) {
              showSaveError('編輯器未初始化')
              return
            }
            
            if (!currentPageId && !currentWorkspacePageId && !(window as any).currentWorkspacePageId) {
              showSaveError('請先選擇要保存的頁面')
              return
            }
            
            try {
              const success = await saveCurrentPage(editor)
              if (!success) {
                // saveCurrentPage 函數內部已經處理了錯誤提示
                console.log('保存未成功，已由 saveCurrentPage 處理錯誤提示')
              }
            } catch (error) {
              console.error('保存過程中出現錯誤:', error)
              showSaveError(`保存失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
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
                              
                              const pageSlug = page.slug?.current || pageId;
                              
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
                    
                    // 設置當前工作區頁面信息，供保存功能使用
                    window.currentWorkspacePageId = pageId;
                    window.currentWorkspacePageName = pageName;
                    
                    // 通過自定義事件通知 React 組件更新狀態
                    const pageChangeEvent = new CustomEvent('workspacePageChange', {
                      detail: { pageId, pageName }
                    });
                    window.dispatchEvent(pageChangeEvent);
                    
                    console.log('選中頁面:', pageName, 'ID:', pageId);
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

  // 當currentPage和編輯器都準備好時，載入頁面內容
  useEffect(() => {
    if (editorInstance.current && currentPage && currentPageId && !isLoading && !isPageLoadedRef.current) {
      console.log('🔄 載入當前頁面到編輯器:', currentPage.title)
      loadPageToEditor(currentPageId, editorInstance.current)
      isPageLoadedRef.current = true
    }
  }, [currentPage, currentPageId, isLoading])

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
    <div style={{ height: '100vh', position: 'relative' }}>
      <div
        ref={editorRef}
        suppressHydrationWarning={true}
        key="grapesjs-editor-container"
        style={{ height: '100%' }}
      />
      {editorInstance.current && (
        <PluginControlPanel
          editor={editorInstance.current}
          isVisible={showPluginPanel}
          onClose={() => setShowPluginPanel(false)}
        />
      )}
    </div>
  )
}

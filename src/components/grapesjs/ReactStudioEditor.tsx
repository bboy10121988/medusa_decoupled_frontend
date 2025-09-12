'use client';

import React from 'react';

const ReactStudioEditor: React.FC = () => {
  const [StudioEditor, setStudioEditor] = React.useState<any>(null);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    const loadStudioEditor = async () => {
      try {
        // 動態導入 GrapesJS Studio SDK
        const StudioEditorModule = await import('@grapesjs/studio-sdk/react');
        const StudioEditorComponent = StudioEditorModule.default || StudioEditorModule.StudioEditor;
        
        // 動態載入樣式
        await import('@grapesjs/studio-sdk/style');
        
        setStudioEditor(() => StudioEditorComponent);
        console.log('GrapesJS Studio SDK 載入成功');
      } catch (error) {
        console.error('載入 GrapesJS Studio SDK 失敗:', error);
        setError(error instanceof Error ? error.message : '未知錯誤');
      }
    };

    loadStudioEditor();
  }, []);

  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#e74c3c',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e74c3c'
      }}>
        <h2>GrapesJS 編輯器載入失敗</h2>
        <p>錯誤: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          重新載入
        </button>
      </div>
    );
  }

  if (!StudioEditor) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ margin: '0 0 10px 0' }}>GrapesJS 頁面編輯器</h2>
          <p style={{ margin: 0, color: '#666' }}>正在載入編輯器...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const handleSave = async (editor: any) => {
    try {
      const currentPage = editor.Pages.getSelected()
      
      if (!currentPage) {
        alert('請選擇要儲存的頁面')
        return
      }
      
      const pageName = currentPage.get('name') || 'untitled'
      const pageId = pageName.toLowerCase().replace(/[^a-z0-9]/g, '_')
      
      // 獲取頁面的 HTML 和 CSS
      const html = editor.getHtml()
      const css = editor.getCss()
      const components = currentPage.getMainComponent().toJSON()
      const styles = editor.CssComposer.getAll().map((rule: any) => rule.toJSON())
      
      // 儲存到後端
      const response = await fetch('/api/grapesjs-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          name: pageName,
          html,
          css,
          components,
          styles,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 獲取當前的 countryCode (從 URL 或預設值)
        const currentPath = window.location.pathname
        const regex = /\/([^/]+)\/studio/
        const countryCodeMatch = regex.exec(currentPath)
        const countryCode = countryCodeMatch ? countryCodeMatch[1] : 'tw'
        
        const viewUrl = `${window.location.origin}/${countryCode}/${pageId}`
        alert(`頁面儲存成功！\n您可以在以下網址查看頁面：\n${viewUrl}`)
        
        // 可選：自動開啟新頁面預覽
        const openPreview = confirm('是否要開啟新分頁預覽頁面？')
        if (openPreview) {
          window.open(viewUrl, '_blank')
        }
      } else {
        alert('儲存失敗：' + result.message)
      }
    } catch (error) {
      console.error('儲存頁面時發生錯誤:', error)
      alert('儲存頁面時發生錯誤')
    }
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh',
      color: '#000',
      backgroundColor: '#fff',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    }}>
      <StudioEditor
        options={{
          licenseKey: 'demo',
          project: {
            type: 'web',
            // The default project to use for new projects
            default: {
              pages: [
                { name: 'Home', component: '<h1 style="color: #333;">歡迎使用頁面編輯器</h1><p>在這裡開始創建你的頁面內容</p>' },
                { name: 'About', component: '<h1 style="color: #333;">關於我們</h1><p>編輯關於頁面的內容</p>' },
                { name: 'Contact', component: '<h1 style="color: #333;">聯絡我們</h1><p>編輯聯絡頁面的內容</p>' },
              ]
            },
          },
          // 畫布和響應式配置
          canvas: {
            styles: [
              // 注入自定義 CSS 到畫布
              `
                body { margin: 0 !important; width: 100% !important; }
                * { box-sizing: border-box !important; }
                [data-gjs-type="wrapper"] { 
                  width: 100% !important; 
                  max-width: 100% !important; 
                  margin: 0 auto !important;
                }
              `
            ],
            scripts: [],
          },
          // 裝置管理器配置
          deviceManager: {
            devices: [
              { id: 'desktop', name: 'Desktop', width: '' },
              { id: 'tablet', name: 'Tablet', width: '768px', widthMedia: '992px' },
              { id: 'mobilePortrait', name: 'Mobile Portrait', width: '375px', widthMedia: '768px' },
            ]
          },
          // 樣式管理器配置
          styleManager: {
            appendTo: '.styles-container',
            sectors: [
              {
                name: '尺寸',
                open: true,
                buildProps: ['width', 'min-height', 'padding'],
                properties: [
                  {
                    type: 'integer',
                    name: 'The width',
                    property: 'width',
                    units: ['px', '%', 'rem', 'vh', 'vw'],
                    defaults: 'auto',
                    min: 0,
                  },
                ]
              },
              {
                name: '響應式',
                open: true,
                buildProps: ['max-width', 'min-width'],
              }
            ]
          }
        }}
        onReady={(editor: any) => {
          // === 終極方案：完全靜態響應式系統 ===
          console.log('GrapesJS 編輯器已準備就緒 - 啟動靜態響應式')
          
          const canvas = editor.Canvas
          
          // 1. 超級簡化的一次性設定
          const setupStaticResponsive = () => {
            try {
              const canvasFrame = canvas.getBody()?.parentNode
              if (canvasFrame) {
                // 直接設定 important 樣式，永不改變
                canvasFrame.setAttribute('style', `
                  width: 100% !important;
                  max-width: 100% !important;
                  min-width: 320px !important;
                  box-sizing: border-box !important;
                  border: 1px solid #ddd !important;
                  border-radius: 4px !important;
                  overflow-x: hidden !important;
                `)
                console.log('靜態響應式樣式已設定')
              }
              
              // 2. 注入超強 CSS - 覆蓋所有可能的情況
              const canvasDoc = canvas.getDocument()
              if (canvasDoc && !canvasDoc.getElementById('ultimate-responsive')) {
                const style = canvasDoc.createElement('style')
                style.id = 'ultimate-responsive'
                style.innerHTML = `
                  <style>
                    /* 精準響應式 CSS - 只針對頁面內容，排除特效 */
                    html, body {
                      margin: 0 !important;
                      padding: 0 !important;
                      width: 100% !important;
                      max-width: 100% !important;
                      overflow-x: hidden !important;
                      box-sizing: border-box !important;
                    }
                    
                    /* 移除所有懸停放大效果 */
                    * {
                      transform: none !important;
                      transition: none !important;
                      animation: none !important;
                    }
                    
                    *:hover {
                      transform: none !important;
                      scale: 1 !important;
                      zoom: 1 !important;
                    }
                    
                    /* 只針對 GrapesJS 的頁面結構元素 */
                    [data-gjs-type="wrapper"] {
                      width: 100% !important;
                      max-width: 100% !important;
                      margin: 0 auto !important;
                      overflow-x: hidden !important;
                      transform: none !important;
                    }
                    
                    [data-gjs-type="row"] {
                      width: 100% !important;
                      max-width: 100% !important;
                      display: flex !important;
                      flex-wrap: wrap !important;
                      margin: 0 !important;
                      transform: none !important;
                    }
                    
                    [data-gjs-type="column"] {
                      flex: 1 1 auto !important;
                      min-width: 0 !important;
                      max-width: 100% !important;
                      overflow: hidden !important;
                      transform: none !important;
                    }
                    
                    [data-gjs-type="section"] {
                      width: 100% !important;
                      max-width: 100% !important;
                      transform: none !important;
                    }
                    
                    [data-gjs-type="container"] {
                      width: 100% !important;
                      max-width: 1200px !important;
                      margin: 0 auto !important;
                      padding: 0 15px !important;
                      transform: none !important;
                    }
                    
                    /* 內容元素響應式 - 排除特效類別 */
                    [data-gjs-type="text"],
                    [data-gjs-type="image"],
                    [data-gjs-type="video"],
                    [data-gjs-type="link"] {
                      max-width: 100% !important;
                      word-wrap: break-word !important;
                      word-break: break-word !important;
                      transform: none !important;
                    }
                    
                    /* 媒體元素 - 移除懸停效果 */
                    [data-gjs-type="image"] img,
                    [data-gjs-type="video"] video,
                    [data-gjs-type="video"] iframe {
                      max-width: 100% !important;
                      height: auto !important;
                      width: auto !important;
                      transform: none !important;
                      transition: none !important;
                    }
                    
                    [data-gjs-type="image"] img:hover,
                    [data-gjs-type="video"] video:hover,
                    [data-gjs-type="video"] iframe:hover {
                      transform: none !important;
                      scale: 1 !important;
                      zoom: 1 !important;
                    }
                    
                    /* 文字內容 */
                    [data-gjs-type="text"] p,
                    [data-gjs-type="text"] h1,
                    [data-gjs-type="text"] h2,
                    [data-gjs-type="text"] h3,
                    [data-gjs-type="text"] h4,
                    [data-gjs-type="text"] h5,
                    [data-gjs-type="text"] h6 {
                      max-width: 100% !important;
                      word-wrap: break-word !important;
                      word-break: break-word !important;
                      transform: none !important;
                    }
                    
                    /* 表格響應式 - 只針對內容表格 */
                    [data-gjs-type="table"] table,
                    [data-gjs-type="table"] {
                      width: 100% !important;
                      max-width: 100% !important;
                      table-layout: fixed !important;
                      word-wrap: break-word !important;
                      transform: none !important;
                    }
                    
                    /* 強制移除所有可能的懸停放大效果 */
                    img:hover,
                    div:hover,
                    section:hover,
                    article:hover {
                      transform: none !important;
                      scale: 1 !important;
                      zoom: 1 !important;
                      filter: none !important;
                    }
                    
                    /* 排除特效和動畫元素 - 但也移除懸停放大 */
                    [class*="animate"]:hover,
                    [class*="animation"]:hover,
                    [class*="effect"]:hover,
                    [class*="transition"]:hover,
                    [class*="hover"]:hover,
                    [class*="parallax"]:hover,
                    [class*="fade"]:hover,
                    [class*="slide"]:hover,
                    [class*="zoom"]:hover,
                    [class*="rotate"]:hover,
                    [class*="scale"]:hover {
                      transform: none !important;
                      scale: 1 !important;
                      zoom: 1 !important;
                    }
                  </style>
                `
                canvasDoc.head.appendChild(style)
                console.log('終極響應式 CSS 已注入')
              }
              
              // 3. 設定外部容器 - 一次性
              setTimeout(() => {
                const containers = [
                  '.gjs-cv-canvas',
                  '.gjs-cv-canvas__frames',
                  '.gjs-frame-wrapper'
                ]
                
                containers.forEach(selector => {
                  const el = document.querySelector(selector) as HTMLElement
                  if (el) {
                    el.setAttribute('style', `
                      width: 100% !important;
                      max-width: 100% !important;
                      overflow-x: hidden !important;
                      overflow-y: auto !important;
                    `)
                  }
                })
              }, 10)
              
            } catch (error) {
              console.error('靜態響應式設定錯誤:', error)
            }
          }
          
          // 2. 極簡裝置切換 - 不觸發其他更新
          editor.on('change:device', (device: any) => {
            const deviceWidth = device.get('width')
            const frame = canvas.getBody()?.parentNode
            if (frame) {
              if (deviceWidth && deviceWidth !== '') {
                frame.style.width = deviceWidth
                frame.style.maxWidth = deviceWidth
              } else {
                frame.style.width = '100%'
                frame.style.maxWidth = '100%'
              }
            }
          })
          
          // 3. 只在頁面切換時重新設定 - 其他時候完全不動
          editor.on('page:select', () => {
            setTimeout(setupStaticResponsive, 100)
          })
          
          // 4. 畫布載入時設定 - 最後一次
          editor.on('canvas:frame:load', () => {
            setTimeout(setupStaticResponsive, 50)
          })
          
          // 5. 初始化 - 只執行一次
          setTimeout(setupStaticResponsive, 100)
          
          // === 完全移除所有其他監聽器 ===
          // 不再監聽: component:update, canvas:update, load 等
          
          // === 其他功能配置（不變） ===
          // 添加儲存命令
          editor.Commands.add('save-page', {
            run: () => handleSave(editor),
          })
          
          // 添加儲存按鈕到工具列
          editor.Panels.addButton('options', {
            id: 'save-page',
            className: 'fa fa-save',
            command: 'save-page',
            attributes: { title: '儲存頁面' },
          })
          
          // 添加鍵盤快捷鍵 Ctrl+S
          editor.setCustomRte({
            actions: ['bold', 'italic', 'underline', 'strikethrough'],
            disable: false,
          })
          
          // 監聽鍵盤事件
          document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault()
              handleSave(editor)
            }
          })
        }}
      />
    </div>
  );
};

export default ReactStudioEditor;

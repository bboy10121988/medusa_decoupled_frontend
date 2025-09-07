'use client';

import React, { useState, useRef, useCallback } from 'react';
import grapesjs from 'grapesjs';
import GjsEditor from '@grapesjs/react';
import type { Editor } from 'grapesjs';

interface GrapesJSEditorWrapperProps {
  className?: string;
}

export default function GrapesJSEditorWrapper({ className }: GrapesJSEditorWrapperProps) {
  const [activePanel, setActivePanel] = useState('blocks');
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  // 添加 ref 來儲存編輯器實例
  const editorRef = useRef<Editor | null>(null);
  
  // 元件庫初始化函數
  const initializeBlocks = useCallback((editor: Editor) => {
    const blockManager = editor.BlockManager;
    
    // 清除現有元件（避免重複）
    blockManager.getAll().reset();
    
    console.log('開始初始化元件庫...');
    
    // === 基本元件分類 ===
    blockManager.add('text', {
      label: '文字',
      category: '基本元件',
      content: {
        type: 'text',
        content: '插入您的文字內容',
        style: {
          'padding': '10px'
        }
      },
      media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z"/>
      </svg>`
    });

    blockManager.add('image', {
      label: '圖片',
      category: '基本元件',
      content: {
        type: 'image',
        style: {
          'max-width': '100%'
        },
        attributes: {
          src: 'https://via.placeholder.com/300x200'
        }
      },
      media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
      </svg>`
    });

    blockManager.add('divider', {
      label: '分隔線',
      category: '基本元件',
      content: {
        type: 'text',
        content: '<hr style="border: 1px solid #ddd; margin: 20px 0;">',
      },
      media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,13H5V11H19V13Z"/>
      </svg>`
    });

    blockManager.add('spacer', {
      label: '間距',
      category: '基本元件',
      content: {
        type: 'text',
        content: '<div style="height: 50px;"></div>',
      },
      media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M8,11H16V13H8V11Z"/>
      </svg>`
    });

    // === 佈局元件分類 ===
    blockManager.add('container', {
      label: '容器',
      category: '佈局元件',
      content: {
        type: 'default',
        tagName: 'div',
        style: {
          'min-height': '50px',
          'padding': '20px',
          'background-color': '#f8f9fa',
          'border': '2px dashed #dee2e6'
        },
        content: '拖拽元件到這裡'
      },
      media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M2,3H8V5H4V9H2V3M2,21V15H4V19H8V21H2M22,21H16V19H20V15H22V21M22,9V3H16V5H20V9H22Z"/>
      </svg>`
    });

    blockManager.add('columns-2', {
      label: '兩欄佈局',
      category: '佈局元件',
      content: {
        type: 'default',
        tagName: 'div',
        style: {
          'display': 'flex',
          'justify-content': 'space-between',
          'gap': '20px'
        },
        components: [
          {
            tagName: 'div',
            style: {
              'flex': '1',
              'padding': '10px',
              'border': '1px dashed #ccc',
              'min-height': '80px'
            },
            content: '欄位 1'
          },
          {
            tagName: 'div',
            style: {
              'flex': '1',
              'padding': '10px',
              'border': '1px dashed #ccc',
              'min-height': '80px'
            },
            content: '欄位 2'
          }
        ]
      },
      media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M3,3H11V5H5V11H3V3M13,3H21V5H15V11H13V3M3,13H11V15H5V21H3V13M13,13H21V15H15V21H13V13Z"/>
      </svg>`
    });
    
    // === 表單元件分類 ===
    blockManager.add('button', {
      label: '按鈕',
      category: '表單元件',
      content: {
        type: 'button',
        content: '點擊按鈕',
        style: {
          'background-color': '#007acc',
          'color': '#ffffff',
          'padding': '10px 20px',
          'border': 'none',
          'border-radius': '4px',
          'cursor': 'pointer'
        }
      },
      media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z"/>
      </svg>`
    });

    blockManager.add('input', {
      label: '輸入框',
      category: '表單元件',
      content: {
        type: 'input',
        attributes: {
          type: 'text',
          placeholder: '請輸入文字'
        },
        style: {
          'width': '100%',
          'padding': '10px',
          'border': '1px solid #ccc',
          'border-radius': '4px'
        }
      },
      media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4,6H20V8H4V6M4,11H20V13H4V11M4,16H20V18H4V16Z"/>
      </svg>`
    });
    
    // === 多媒體元件分類 ===
    blockManager.add('video', {
      label: '影片',
      category: '多媒體元件',
      content: {
        type: 'video',
        style: {
          'max-width': '100%',
          'height': 'auto'
        },
        attributes: {
          src: 'https://www.w3schools.com/html/mov_bbb.mp4',
          controls: true
        }
      },
      media: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="currentColor" d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z"/>
      </svg>`
    });
      
    console.log('元件庫已重新組織:', blockManager.getAll());
  }, []);
  
  const onEditor = (editor: Editor) => {
    console.log('GrapesJS 編輯器已載入:', editor);
    editorRef.current = editor;
    
    // 初始載入時執行一次
    setTimeout(() => {
      initializeBlocks(editor);
    }, 500);
    
    // 使用JavaScript直接設置畫布背景色
    const setCanvasBackground = () => {
      const canvas = document.querySelector('.gjs-cv-canvas');
      const frame = document.querySelector('.gjs-frame');
      const iframe = document.querySelector('iframe');
      
      if (canvas) {
        (canvas as HTMLElement).style.setProperty('background-color', '#ffffff', 'important');
      }
      if (frame) {
        (frame as HTMLElement).style.setProperty('background-color', '#ffffff', 'important');
      }
      if (iframe) {
        (iframe as HTMLElement).style.setProperty('background-color', '#ffffff', 'important');
      }
    };
    
    // 延遲執行以確保DOM已渲染
    setTimeout(setCanvasBackground, 100);
    
    // 監聽編輯器變化
    editor.on('load', setCanvasBackground);
    editor.on('canvas:update', setCanvasBackground);
  };

  return (
    <div className={`h-screen flex flex-col bg-gray-100 ${className || ''}`}>
      {/* 頂部工具列 */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        {/* 左側 Logo 和專案名稱 */}
        <div className="flex items-center space-x-4">
          <div className="text-xl font-bold text-gray-800">GrapesJS Studio</div>
          <div className="text-sm text-gray-500">未命名專案</div>
        </div>
        
        {/* 中間裝置切換 */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              deviceMode === 'desktop' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5a1 1 0 01-1-1V6a1 1 0 011-1h10a1 1 0 011 1v5a1 1 0 01-1 1H8.771z" clipRule="evenodd" />
            </svg>
            桌面
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              deviceMode === 'tablet' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9V7a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            平板
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              deviceMode === 'mobile' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v10a1 1 0 01-1 1H7a1 1 0 01-1-1V4zm4 12a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            手機
          </button>
        </div>
        
        {/* 右側操作按鈕 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title="切換右側面板"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
            發布
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium">
            預覽
          </button>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左側面板 */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* 面板切換標籤 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActivePanel('blocks');
                // 當切換到元件頁籤時，重新初始化元件庫
                if (editorRef.current) {
                  setTimeout(() => {
                    initializeBlocks(editorRef.current!);
                  }, 100);
                }
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activePanel === 'blocks'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM4 9a2 2 0 100 4h12a2 2 0 100-4H4zM4 15a2 2 0 100 4h12a2 2 0 100-4H4z" />
              </svg>
              元件
            </button>
            <button
              onClick={() => setActivePanel('layers')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activePanel === 'layers'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              圖層
            </button>
            <button
              onClick={() => setActivePanel('pages')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activePanel === 'pages'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
              </svg>
              頁面
            </button>
          </div>

          {/* 面板內容 - 佔滿剩餘空間 */}
          <div className="flex-1 overflow-y-auto bg-white">
            {activePanel === 'blocks' && (
              <div className="h-full bg-white">
                <div className="p-4 border-b border-gray-100 bg-white">
                  <h3 className="text-sm font-semibold text-gray-800">拖拽元件到畫布</h3>
                  <p className="text-xs text-gray-500 mt-1">選擇您需要的元件</p>
                </div>
                <div className="px-4 pb-4 bg-white">
                  <div id="blocks"></div>
                </div>
              </div>
            )}
            {activePanel === 'layers' && (
              <div className="h-full bg-white">
                <div className="p-4 border-b border-gray-100 bg-white">
                  <h3 className="text-sm font-semibold text-gray-800">圖層結構</h3>
                  <p className="text-xs text-gray-500 mt-1">管理元件層級</p>
                </div>
                <div className="px-4 pb-4 bg-white">
                  <div id="layers"></div>
                </div>
              </div>
            )}
            {activePanel === 'pages' && (
              <div className="h-full bg-white">
                <div className="p-4 border-b border-gray-100 bg-white">
                  <h3 className="text-sm font-semibold text-gray-800">頁面管理</h3>
                  <p className="text-xs text-gray-500 mt-1">建立和管理頁面</p>
                </div>
                <div className="p-4 bg-white">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">首頁</span>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">目前頁面</span>
                      </div>
                    </div>
                    <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      新增頁面
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 中間編輯區域 */}
        <div className="flex-1 flex flex-col">
          {/* 編輯器工具列 */}
          <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <span className="text-xs text-gray-500">100%</span>
              <button className="text-xs text-gray-500 hover:text-gray-700">−</button>
              <button className="text-xs text-gray-500 hover:text-gray-700">+</button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded" title="檢視代碼">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* 畫布容器 - 完全佔滿剩餘空間 */}
          <div className="flex-1 bg-white relative">
            {/* 響應式畫布包裝器 */}
            <div className="h-full w-full flex items-center justify-center">
              <div 
                className={`bg-white h-full transition-all duration-300 ${
                  deviceMode === 'desktop' ? 'w-full' :
                  deviceMode === 'tablet' ? 'w-[768px] shadow-lg' :
                  'w-[375px] shadow-lg'
                }`}
              >
                <div id="gjs" className="h-full w-full">
                  <GjsEditor
                    grapesjs={grapesjs}
                    grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
                    options={{
                      height: '100%',
                      width: 'auto',
                      storageManager: false,
                      container: '#gjs',
                      showOffsets: true,
                      fromElement: false,
                      noticeOnUnload: false,
                      blockManager: {
                        appendTo: '#blocks',
                        blocks: []
                      },
                      styleManager: {
                        appendTo: '#styles',
                      },
                      layerManager: {
                        appendTo: '#layers',
                      },
                      traitManager: {
                        appendTo: '#traits',
                      },
                      canvas: {
                        styles: [],
                        scripts: []
                      },
                      components: `
                        <div style="padding: 60px 40px; text-align: center; font-family: Arial, sans-serif;">
                          <h1 style="color: #333; margin-bottom: 20px; font-size: 2.5rem;">歡迎使用 GrapesJS Studio</h1>
                          <p style="color: #666; font-size: 1.2rem; margin-bottom: 30px;">從左側拖拽元件來開始設計您的頁面</p>
                          <button style="background-color: #007acc; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer;">開始設計</button>
                        </div>
                      `,
                      style: `
                        body {
                          margin: 0;
                          padding: 0;
                          background-color: #ffffff;
                        }
                      `
                    }}
                    plugins={[
                      {
                        id: 'gjs-blocks-basic',
                        src: 'https://unpkg.com/grapesjs-blocks-basic'
                      },
                      {
                        id: 'grapesjs-plugin-forms',
                        src: 'https://unpkg.com/grapesjs-plugin-forms'
                      },
                      {
                        id: 'grapesjs-component-countdown',
                        src: 'https://unpkg.com/grapesjs-component-countdown'
                      },
                      {
                        id: 'grapesjs-tabs',
                        src: 'https://unpkg.com/grapesjs-tabs'
                      }
                    ]}
                    onEditor={onEditor}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側屬性面板 */}
        {showRightPanel && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">屬性設定</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">樣式</h4>
                <div id="styles"></div>
              </div>
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">屬性</h4>
                <div id="traits"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 自定義CSS樣式覆蓋 */}
      <style jsx global>{`
        /* 覆蓋 GrapesJS 元件庫背景色 - 使用更強的選擇器 */
        #blocks,
        #blocks *,
        .gjs-blocks-c,
        .gjs-blocks-c * {
          background-color: white !important;
        }
        
        /* 覆蓋 GrapesJS 圖層面板背景色 */
        #layers,
        #layers *,
        .gjs-layers-c,
        .gjs-layers-c * {
          background-color: white !important;
        }
        
        /* 覆蓋所有 GrapesJS 面板的背景色 */
        .gjs-pn-panel,
        .gjs-pn-panel *,
        .gjs-pn-views-container,
        .gjs-pn-views-container * {
          background-color: white !important;
        }
        
        /* 元件卡片樣式 - 使用更具體的選擇器 */
        #blocks .gjs-block,
        .gjs-blocks-c .gjs-block,
        [data-gjs-type="block"] {
          background-color: #374151 !important; /* 深灰色背景 */
          color: white !important; /* 白色文字 */
          border: 1px solid #4b5563 !important; /* 稍淺的灰色邊框 */
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
        }
        
        /* hover 效果 */
        #blocks .gjs-block:hover,
        .gjs-blocks-c .gjs-block:hover,
        [data-gjs-type="block"]:hover {
          background-color: #4b5563 !important; /* hover時稍淺 */
          border-color: #60a5fa !important; /* hover時藍色邊框 */
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* 元件標籤文字顏色 - 背景透明，文字白色 */
        #blocks .gjs-block-label,
        .gjs-blocks-c .gjs-block-label,
        #blocks .gjs-block .gjs-block-label,
        .gjs-blocks-c .gjs-block .gjs-block-label {
          color: white !important;
          font-weight: 500 !important;
          background-color: transparent !important;
          background: transparent !important;
        }
        
        /* 元件圖示顏色 */
        #blocks .gjs-block svg,
        .gjs-blocks-c .gjs-block svg,
        #blocks .gjs-block img,
        .gjs-blocks-c .gjs-block img {
          filter: invert(1) !important; /* 反轉顏色讓圖示變白 */
        }
        
        /* 分類標題樣式調整 */
        #blocks .gjs-block-category .gjs-title,
        .gjs-blocks-c .gjs-block-category .gjs-title {
          background-color: white !important;
          color: #374151 !important;
          border-bottom: 1px solid #e5e7eb !important;
          font-weight: 600 !important;
          padding: 8px 12px !important;
        }
        
        /* 圖層面板項目樣式 */
        #layers .gjs-layer,
        .gjs-layers-c .gjs-layer {
          background-color: white !important;
          border-bottom: 1px solid #f3f4f6 !important;
          color: #374151 !important;
        }
        
        #layers .gjs-layer:hover,
        .gjs-layers-c .gjs-layer:hover {
          background-color: #f9fafb !important;
        }
        
        /* 強制所有可能的元件容器背景為白色 */
        .gjs-pn-commands,
        .gjs-pn-options,
        .gjs-pn-views,
        .gjs-sm-sectors,
        .gjs-tm-traits {
          background-color: white !important;
        }
        
        /* 確保沒有灰色背景殘留 */
        [class*="gjs-"] {
          background-color: white !important;
        }
        
        /* 重新設定元件容器樣式 */
        [class*="gjs-"]:not(.gjs-block) {
          background-color: white !important;
        }
      `}</style>
    </div>
  );
}

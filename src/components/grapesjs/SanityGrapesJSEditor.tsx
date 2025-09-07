"use client"

import React, { useState } from 'react'
import SimpleGrapesJSEditor from './SimpleGrapesJSEditor'
import { useSanityGrapesJS } from './useSanityGrapesJS'
import type { Editor } from 'grapesjs'

interface SanityGrapesJSEditorProps {
  pageId?: string
  onPageChange?: (pageId: string) => void
}

const SanityGrapesJSEditor: React.FC<SanityGrapesJSEditorProps> = ({
  pageId,
  onPageChange
}) => {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [showPageManager, setShowPageManager] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageSlug, setNewPageSlug] = useState('')

  const {
    currentPage,
    isLoading,
    isSaving,
    error,
    hasUnsavedChanges,
    loadPage,
    savePage,
    createPage,
    setError
  } = useSanityGrapesJS({
    editor,
    pageId,
    autoSave: true,
    autoSaveInterval: 5000
  })

  const handleSave = async () => {
    try {
      await savePage()
      alert('頁面已保存！')
    } catch (error) {
      alert('保存失敗：' + (error instanceof Error ? error.message : '未知錯誤'))
    }
  }

  const handleCreatePage = async () => {
    try {
      if (!newPageTitle || !newPageSlug) {
        alert('請填寫頁面標題和網址別名')
        return
      }

      const page = await createPage(newPageTitle, newPageSlug)
      setNewPageTitle('')
      setNewPageSlug('')
      setShowPageManager(false)
      
      if (onPageChange) {
        onPageChange(page._id)
      }
      
      alert('頁面創建成功！')
    } catch (error) {
      alert('創建失敗：' + (error instanceof Error ? error.message : '未知錯誤'))
    }
  }

  const handleLoadPage = async () => {
    const id = prompt('請輸入頁面 ID:')
    if (id) {
      try {
        await loadPage(id)
        if (onPageChange) {
          onPageChange(id)
        }
      } catch (error) {
        alert('載入失敗：' + (error instanceof Error ? error.message : '未知錯誤'))
      }
    }
  }

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div className="sanity-grapesjs-editor">
      {/* 頂部工具欄 */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <h1>GrapesJS + Sanity 編輯器</h1>
          {currentPage && (
            <span className="page-info">
              {currentPage.title}
              {hasUnsavedChanges && <span className="unsaved-indicator"> • 未保存</span>}
              {isSaving && <span className="saving-indicator"> • 保存中...</span>}
            </span>
          )}
        </div>
        
        <div className="toolbar-right">
          <button
            onClick={() => setShowPageManager(!showPageManager)}
            className="btn btn-secondary"
          >
            頁面管理
          </button>
          
          <button
            onClick={handleSave}
            disabled={!editor || !currentPage || isSaving}
            className="btn btn-primary"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* 頁面管理面板 */}
      {showPageManager && (
        <div className="page-manager">
          <div className="page-manager-content">
            <h3>頁面管理</h3>
            
            {/* 創建新頁面 */}
            <div className="create-page-section">
              <h4>創建新頁面</h4>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="頁面標題"
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value)
                    setNewPageSlug(generateSlugFromTitle(e.target.value))
                  }}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="網址別名"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  className="form-input"
                />
                <button
                  onClick={handleCreatePage}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  創建
                </button>
              </div>
            </div>

            {/* 載入現有頁面 */}
            <div className="load-page-section">
              <h4>載入現有頁面</h4>
              <button
                onClick={handleLoadPage}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                載入頁面
              </button>
            </div>

            <button
              onClick={() => setShowPageManager(false)}
              className="btn btn-close"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* 錯誤提示 */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn-close-error">
            ×
          </button>
        </div>
      )}

      {/* 載入提示 */}
      {isLoading && (
        <div className="loading-banner">
          正在載入頁面數據...
        </div>
      )}

      {/* GrapesJS 編輯器 */}
      <div className="editor-container">
        <SimpleGrapesJSEditor onEditorReady={setEditor} />
      </div>

      <style jsx>{`
        .sanity-grapesjs-editor {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .editor-toolbar {
          background: #2c3e50;
          color: white;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .toolbar-left h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .page-info {
          margin-left: 20px;
          font-size: 14px;
          opacity: 0.9;
        }

        .unsaved-indicator {
          color: #f39c12;
        }

        .saving-indicator {
          color: #27ae60;
        }

        .toolbar-right {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2980b9;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #7f8c8d;
        }

        .btn-close {
          background: #e74c3c;
          color: white;
          margin-top: 15px;
        }

        .btn-close:hover {
          background: #c0392b;
        }

        .page-manager {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .page-manager-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          min-width: 500px;
          max-width: 600px;
        }

        .page-manager-content h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
        }

        .create-page-section,
        .load-page-section {
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ecf0f1;
        }

        .create-page-section h4,
        .load-page-section h4 {
          margin: 0 0 15px 0;
          color: #34495e;
          font-size: 16px;
        }

        .form-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .form-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #bdc3c7;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-input:focus {
          outline: none;
          border-color: #3498db;
        }

        .error-banner {
          background: #e74c3c;
          color: white;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-close-error {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-banner {
          background: #f39c12;
          color: white;
          padding: 12px 20px;
          text-align: center;
        }

        .editor-container {
          flex: 1;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default SanityGrapesJSEditor

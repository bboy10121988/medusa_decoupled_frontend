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
      const pages = editor.Pages.getAll()
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
        alert(`頁面儲存成功！\n您可以在以下網址查看頁面：\n${window.location.origin}/${pageId}`)
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
          }
        }}
        onReady={(editor) => {
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
            // 重要：設定默認的 RTE
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

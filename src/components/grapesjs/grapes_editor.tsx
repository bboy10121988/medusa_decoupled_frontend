'use client'

import { useEffect, useRef } from 'react'
import 'grapesjs/dist/css/grapes.min.css'
import './grapes-editor.css'

interface GrapesEditorProps {
  onSave?: (content: string) => void
}

export default function GrapesEditor({ onSave }: GrapesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<any>(null)

  useEffect(() => {
    if (!editorRef.current || editorInstance.current) return

    // 動態導入所有依賴
    const initEditor = async () => {
      const grapesjs = (await import('grapesjs')).default
      
      // Import all the plugins used in the official demo
      const pluginWebpage = (await import('grapesjs-preset-webpage')).default
      const pluginBlocksBasic = (await import('grapesjs-blocks-basic')).default
      const pluginForms = (await import('grapesjs-plugin-forms')).default
      const pluginCountdown = (await import('grapesjs-component-countdown')).default
      const pluginTabs = (await import('grapesjs-tabs')).default
      const pluginCustomCode = (await import('grapesjs-custom-code')).default
      const pluginTooltip = (await import('grapesjs-tooltip')).default
      const pluginTyped = (await import('grapesjs-typed')).default

      // Initialize GrapesJS editor exactly like the official demo
      const editor = grapesjs.init({
        // Indicate where to init the editor. You can also pass an HTMLElement
        container: editorRef.current!,
        // Get the content for the canvas directly from the element
        fromElement: true,
        // Size of the editor
        height: '100vh',
        width: 'auto',
        // Disable the storage manager for the demo
        storageManager: false,
        
        // Add all the plugins from the official demo
        plugins: [
          pluginWebpage,
          pluginBlocksBasic,
          pluginForms,
          pluginCountdown,
          pluginTabs,
          pluginCustomCode,
          pluginTooltip,
          pluginTyped
        ],
        
        // Plugin options exactly like the official demo
        pluginsOpts: {
          'grapesjs-preset-webpage': {
            modalImportTitle: 'Import Template',
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
            modalImportContent: function(editor: any) {
              return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
            }
          },
          'grapesjs-blocks-basic': { 
            flexGrid: true 
          },
          'grapesjs-plugin-forms': {
            // Official demo forms configuration
          },
          'grapesjs-component-countdown': {
            // Official demo countdown configuration
          },
          'grapesjs-tabs': {
            // Official demo tabs configuration
          },
          'grapesjs-custom-code': {
            // Official demo custom code configuration
          },
          'grapesjs-tooltip': {
            // Official demo tooltip configuration
          },
          'grapesjs-typed': {
            // Official demo typed configuration
          }
        }
      })

      // Add custom save command
      editor.Commands.add('save-content', {
        run: (editor: any) => {
          if (onSave) {
            const html = editor.getHtml()
            const css = editor.getCss()
            const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Generated Page</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`
            onSave(content)
          }
        }
      })

      // Add save button to the toolbar
      editor.Panels.addButton('options', [
        {
          id: 'save-content',
          className: 'btn-save',
          label: '💾',
          command: 'save-content',
          attributes: { title: 'Save Content (Ctrl+S)' }
        }
      ])

      // Add keyboard shortcuts
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

      editorInstance.current = editor
    }

    initEditor()

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy()
        editorInstance.current = null
      }
    }
  }, [onSave])

  return (
    <div style={{ 
      height: '100vh'
    }}>
      <div ref={editorRef}>
        <h1>Hello World Component!</h1>
        <p>This is a simple text paragraph.</p>
      </div>
    </div>
  )
}
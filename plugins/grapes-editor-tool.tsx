import { definePlugin, Tool } from 'sanity'
import { EditIcon } from '@sanity/icons'
import dynamic from 'next/dynamic'

// 動態導入 GrapesJS 編輯器組件，避免 SSR 問題
const GrapesEditor = dynamic(() => import('../src/components/grapesjs/grapes_editor'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>載入 GrapesJS 編輯器中...</div>
})

// 定義 GrapesJS 編輯器工具
const grapesJSEditorTool: Tool = {
  name: 'grapes-editor',
  title: 'GrapesJS 頁面編輯器',
  icon: EditIcon,
  component: () => {
    const handleSave = (content: string) => {
      console.log('保存的完整頁面內容:', content)
      // 這裡的保存邏輯會使用 Sanity Studio 的身份驗證
    }

    return (
      <div style={{ height: '100vh', width: '100%' }}>
        <GrapesEditor onSave={handleSave} />
      </div>
    )
  }
}

// 定義 GrapesJS 插件
export const grapesJSPlugin = definePlugin({
  name: 'grapes-editor-plugin',
  tools: [grapesJSEditorTool]
})
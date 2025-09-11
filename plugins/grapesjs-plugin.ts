import { definePlugin } from 'sanity'
import { ComponentIcon } from '@sanity/icons'
import ReactStudioEditor from '../src/components/grapesjs/ReactStudioEditor'

export const grapesJSPlugin = definePlugin({
  name: 'grapesjs-editor',
  tools: [
    {
      name: 'grapesjs-editor',
      title: '頁面編輯器',
      icon: ComponentIcon,
      component: ReactStudioEditor,
    },
  ],
})

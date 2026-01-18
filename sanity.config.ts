import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { documentInternationalization } from '@sanity/document-internationalization'
import { schemaTypes } from './schemas/index'
// import { WEBHOOK_URL, WEBHOOK_SECRET } from './src/config/webhook'
import { structure } from './sanity-structure'
// import type { DocumentActionProps } from 'sanity'

// 多語系設定
const i18nConfig = {
  // 支援的語言
  supportedLanguages: [
    { id: 'zh-TW', title: '繁體中文' },
    { id: 'en', title: 'English' },
    { id: 'ja-JP', title: '日本語' },
  ],
  // 需要多語系支援的 Schema 類型
  schemaTypes: [
    'homePage',
    'dynamicPage',
    'blogPage',
    'post',
    'category',
    'header',
    'footer',
    'product', // 新增商品 schema
  ],
}

// const GeneratePageAction = (props: DocumentActionProps) => {
//   const { published } = props

//   // 沒有已發布的文檔時不顯示這個動作
//   if (!published) return null

//   return {
//     label: '生成頁面',
//     onHandle: async () => {
//       try {
//         const response = await fetch(WEBHOOK_URL, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'x-webhook-secret': WEBHOOK_SECRET
//           },
//           body: JSON.stringify({
//             event: 'page.publish',
//             documentId: published._id
//           })
//         })

//         if (!response.ok) {
//           throw new Error('頁面生成失敗')
//         }

//         return { message: '頁面生成成功!' }

//       } catch (error) {
//         console.error('頁面生成錯誤:', error)
//         return { message: '頁面生成失敗,請稍後再試' }
//       }
//     }
//   }
// }

export default defineConfig({
  name: 'default',
  title: 'tims_web',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  basePath: '/cms',

  plugins: [
    structureTool({ structure }),
    visionTool(),
    documentInternationalization(i18nConfig),
  ],

  // document: {
  //   actions: (prev, context) => {
  //     // 僅當 webhook 設定齊全時才顯示「生成頁面」
  //     const canGenerate = Boolean(WEBHOOK_URL && WEBHOOK_SECRET)
  //     if (context.schemaType === 'pages' && canGenerate) {
  //       return [...prev, GeneratePageAction]
  //     }
  //     return prev
  //   }
  // },

  schema: {
    types: schemaTypes as any,
  },

  // 暫時禁用媒體插件避免 Mux 播放器問題
  studioHost: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
})

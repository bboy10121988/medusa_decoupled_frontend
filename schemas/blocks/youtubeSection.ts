import { Rule } from '@sanity/types'

export default {
  name: 'youtubeSection',
  title: '影片區塊 (YouTube + 上傳)',
  type: 'object',
  fields: [
    {
      name: 'isActive',
      title: '是否啟用',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'paddingX',
      title: '左右邊距 (百分比)',
      type: 'number',
      description: '輸入 0-100 的數字，代表左右留白佔全寬的百分比 (例如輸入 80 代表左右留白共 80%，內容佔 20%)',
      validation: (Rule: any) => Rule.min(0).max(100)
    },
    {
      name: 'title',
      title: '標題',
      type: 'string'
    },
    {
      name: 'description',
      title: '描述',
      type: 'text'
    },
    // 影片模式選擇
    {
      name: 'videoMode',
      title: '影片模式',
      type: 'string',
      description: '選擇使用 YouTube 連結還是上傳影片檔案',
      options: {
        list: [
          { title: 'YouTube 連結模式', value: 'youtube' },
          { title: '上傳影片檔案模式', value: 'upload' }
        ]
      },
      initialValue: 'youtube',
      validation: (Rule: Rule) => Rule.required()
    },
    // YouTube 模式設定
    {
      name: 'youtubeSettings',
      title: 'YouTube 響應式設定',
      type: 'object',
      description: '為不同裝置設定不同的 YouTube 影片',
      hidden: ({ parent }: { parent: any }) => parent?.videoMode !== 'youtube',
      fields: [
        {
          name: 'desktopVideoUrl',
          title: '桌面版 YouTube 網址',
          type: 'url',
          description: '桌面版 (768px 以上) 顯示的 YouTube 影片網址',
          validation: (Rule: Rule) => Rule.custom((value: string, context: any) => {
            const parent = context?.parent
            if (parent?.videoMode === 'youtube' && !value) {
              return '桌面版 YouTube 網址為必填欄位'
            }
            return true
          })
        },
        {
          name: 'mobileVideoUrl',
          title: '手機版 YouTube 網址',
          type: 'url',
          description: '手機版 (768px 以下) 顯示的 YouTube 影片網址',
          validation: (Rule: Rule) => Rule.custom((value: string, context: any) => {
            const parent = context?.parent
            if (parent?.videoMode === 'youtube' && !value) {
              return '手機版 YouTube 網址為必填欄位'
            }
            return true
          })
        },
        {
          name: 'useSameVideo',
          title: '使用相同影片',
          type: 'boolean',
          description: '勾選此選項將在所有裝置上使用桌面版影片',
          initialValue: false
        },
        {
          name: 'autoplay',
          title: '自動播放',
          type: 'boolean',
          description: '是否自動播放影片（YouTube 限制需要靜音）',
          initialValue: true
        },
        {
          name: 'loop',
          title: '循環播放',
          type: 'boolean',
          description: '是否循環播放影片',
          initialValue: true
        },
        {
          name: 'muted',
          title: '靜音播放',
          type: 'boolean',
          description: '是否靜音播放影片（自動播放需要靜音）',
          initialValue: true
        },
        {
          name: 'showControls',
          title: '顯示控制項',
          type: 'boolean',
          description: '是否顯示 YouTube 播放控制項',
          initialValue: false
        }
      ]
    },
    // 上傳影片模式設定
    {
      name: 'uploadSettings',
      title: '上傳影片設定',
      type: 'object',
      description: '上傳影片檔案並為不同裝置設定',
      hidden: ({ parent }: { parent: any }) => parent?.videoMode !== 'upload',
      fields: [
        {
          name: 'desktopVideo',
          title: '桌面版影片檔案',
          type: 'file',
          description: '桌面版顯示的影片檔案 (推薦 16:9 比例)',
          options: {
            accept: 'video/*'
          },
          validation: (Rule: Rule) => Rule.custom((value: any, context: any) => {
            const parent = context?.parent
            if (parent?.videoMode === 'upload' && !value) {
              return '桌面版影片檔案為必填欄位'
            }
            return true
          })
        },
        {
          name: 'mobileVideo',
          title: '手機版影片檔案',
          type: 'file',
          description: '手機版顯示的影片檔案 (推薦 9:16 比例)',
          options: {
            accept: 'video/*'
          },
          validation: (Rule: Rule) => Rule.custom((value: any, context: any) => {
            const parent = context?.parent
            if (parent?.videoMode === 'upload' && !value) {
              return '手機版影片檔案為必填欄位'
            }
            return true
          })
        },
        {
          name: 'useSameVideo',
          title: '使用相同影片',
          type: 'boolean',
          description: '勾選此選項將在所有裝置上使用桌面版影片',
          initialValue: false
        },
        {
          name: 'autoplay',
          title: '自動播放',
          type: 'boolean',
          description: '是否自動播放影片（靜音）',
          initialValue: true
        },
        {
          name: 'loop',
          title: '循環播放',
          type: 'boolean',
          description: '是否循環播放影片',
          initialValue: true
        },
        {
          name: 'muted',
          title: '靜音播放',
          type: 'boolean',
          description: '是否靜音播放影片（自動播放需要靜音）',
          initialValue: true
        },
        {
          name: 'showControls',
          title: '顯示控制項',
          type: 'boolean',
          description: '是否顯示影片播放控制項',
          initialValue: false
        }
      ]
    },
    {
      name: 'fullWidth',
      title: '全寬顯示',
      type: 'boolean',
      description: '是否以全寬模式顯示影片',
      initialValue: true
    }
  ],
  preview: {
    select: {
      heading: 'heading',
      videoMode: 'videoMode',
      youtubeDesktop: 'youtubeSettings.desktopVideoUrl',
      youtubeMobile: 'youtubeSettings.mobileVideoUrl',
      youtubeUseSame: 'youtubeSettings.useSameVideo',
      uploadDesktop: 'uploadSettings.desktopVideo.asset.originalFilename',
      uploadMobile: 'uploadSettings.mobileVideo.asset.originalFilename',
      uploadUseSame: 'uploadSettings.useSameVideo'
    },
    prepare({heading, videoMode, youtubeDesktop, youtubeMobile, youtubeUseSame, uploadDesktop, uploadMobile, uploadUseSame}: {
      heading: string,
      videoMode: 'youtube' | 'upload',
      youtubeDesktop: string,
      youtubeMobile: string,
      youtubeUseSame: boolean,
      uploadDesktop: string,
      uploadMobile: string,
      uploadUseSame: boolean
    }) {
      let subtitle = ''
      
      if (videoMode === 'youtube') {
        subtitle = youtubeUseSame 
          ? `YouTube 統一: ${youtubeDesktop || '未設定'}`
          : `YouTube - 桌面: ${youtubeDesktop || '未設定'} | 手機: ${youtubeMobile || '未設定'}`
      } else if (videoMode === 'upload') {
        subtitle = uploadUseSame
          ? `上傳統一: ${uploadDesktop || '未設定'}`
          : `上傳 - 桌面: ${uploadDesktop || '未設定'} | 手機: ${uploadMobile || '未設定'}`
      } else {
        subtitle = '未設定模式'
      }
      
      return {
        title: heading || '影片區塊 (YouTube + 上傳)',
        subtitle: subtitle
      }
    }
  }
}

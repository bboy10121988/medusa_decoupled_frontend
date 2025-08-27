import { Rule } from '@sanity/types'

export default {
  name: 'youtubeSection',
  title: 'YouTube 影片區塊',
  type: 'object',
  fields: [
    {
      name: 'isActive',
      title: '是否啟用',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'videoUrl',
      title: 'YouTube 影片網址',
      type: 'url',
      description: '請輸入完整的 YouTube 影片網址',
      validation: (Rule: Rule) => Rule.required().error('影片網址為必填欄位')
    },
    {
      name: 'heading',
      title: '標題',
      type: 'string'
    },
    {
      name: 'description',
      title: '描述',
      type: 'text'
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
      videoUrl: 'videoUrl'
    },
    prepare({heading, videoUrl}: {heading: string, videoUrl: string}) {
      return {
        title: heading || 'YouTube 影片區塊',
        subtitle: videoUrl ? `影片網址: ${videoUrl}` : ''
      }
    }
  }
}

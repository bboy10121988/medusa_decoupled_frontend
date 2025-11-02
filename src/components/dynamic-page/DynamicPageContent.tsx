import React from 'react'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlForImage } from '@/sanity-client/image'

// 動態頁面內容區塊的類型定義
interface TextBlock {
  _type: 'textBlock'
  title?: string
  content: any[]
  alignment: 'left' | 'center' | 'right'
}

interface ImageBlock {
  _type: 'imageBlock'
  title?: string
  image: any
  alt: string
  caption?: string
  layout: 'full' | 'center' | 'float-left' | 'float-right'
}

interface VideoBlock {
  _type: 'videoBlock'
  title?: string
  videoUrl: string
  thumbnail?: any
  description?: string
}

interface CtaBlock {
  _type: 'ctaBlock'
  title?: string
  buttonText: string
  buttonUrl: string
  buttonStyle: 'primary' | 'secondary' | 'outline'
  alignment: 'left' | 'center' | 'right'
}

type ContentBlock = TextBlock | ImageBlock | VideoBlock | CtaBlock

interface DynamicPageContentProps {
  content: ContentBlock[]
}

// 文字區塊組件
const TextBlockComponent: React.FC<{ block: TextBlock }> = ({ block }) => {
  return (
    <div className={`my-8 text-${block.alignment}`}>
      {block.title && (
        <h2 className="text-2xl font-bold mb-4">{block.title}</h2>
      )}
      <div className="prose prose-lg max-w-none">
        <PortableText value={block.content} />
      </div>
    </div>
  )
}

// 圖片區塊組件
const ImageBlockComponent: React.FC<{ block: ImageBlock }> = ({ block }) => {
  const getLayoutClasses = () => {
    switch (block.layout) {
      case 'full':
        return 'w-full'
      case 'center':
        return 'max-w-4xl mx-auto'
      case 'float-left':
        return 'float-left mr-6 mb-4 max-w-md'
      case 'float-right':
        return 'float-right ml-6 mb-4 max-w-md'
      default:
        return 'max-w-4xl mx-auto'
    }
  }

  if (!block.image) return null

  return (
    <div className={`my-8 ${getLayoutClasses()}`}>
      {block.title && (
        <h2 className="text-2xl font-bold mb-4">{block.title}</h2>
      )}
      <div className="relative">
        <Image
          src={urlForImage(block.image) || ''}
          alt={block.alt || ''}
          width={800}
          height={600}
          className="rounded-lg shadow-lg"
        />
        {block.caption && (
          <p className="text-sm text-gray-600 mt-2 text-center">
            {block.caption}
          </p>
        )}
      </div>
    </div>
  )
}

// 影片區塊組件
const VideoBlockComponent: React.FC<{ block: VideoBlock }> = ({ block }) => {
  const getVideoEmbedUrl = (url: string) => {
    // YouTube URL 轉換
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // 簡化的 YouTube ID 提取
      let videoId = ''
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
      } else if (url.includes('youtube.com/watch')) {
        videoId = url.split('v=')[1]?.split('&')[0] || ''
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0] || ''
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    
    // Vimeo URL 轉換
    if (url.includes('vimeo.com')) {
      const videoId = url.match(/vimeo\.com\/.*?(\d+)/)?.[1]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }
    
    return url
  }

  return (
    <div className="my-8 max-w-4xl mx-auto">
      {block.title && (
        <h2 className="text-2xl font-bold mb-4">{block.title}</h2>
      )}
      <div className="aspect-video relative rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={getVideoEmbedUrl(block.videoUrl)}
          title={block.title || '影片'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      {block.description && (
        <p className="text-gray-600 mt-4">{block.description}</p>
      )}
    </div>
  )
}

// CTA 按鈕區塊組件
const CtaBlockComponent: React.FC<{ block: CtaBlock }> = ({ block }) => {
  const getButtonClasses = () => {
    const baseClasses = 'inline-block px-6 py-3 rounded-lg font-semibold transition-colors duration-200'
    
    switch (block.buttonStyle) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`
      case 'secondary':
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700`
      case 'outline':
        return `${baseClasses} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white`
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`
    }
  }

  return (
    <div className={`my-8 text-${block.alignment}`}>
      {block.title && (
        <h2 className="text-2xl font-bold mb-4">{block.title}</h2>
      )}
      <a
        href={block.buttonUrl}
        className={getButtonClasses()}
      >
        {block.buttonText}
      </a>
    </div>
  )
}

// 主要的動態頁面內容組件
export const DynamicPageContent: React.FC<DynamicPageContentProps> = ({ content }) => {
  if (!content || content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">尚未設置頁面內容</p>
      </div>
    )
  }

  return (
    <div className="dynamic-page-content">
      {content.map((block, index) => {
        const key = `block-${index}`
        
        switch (block._type) {
          case 'textBlock':
            return <TextBlockComponent key={key} block={block} />
          
          case 'imageBlock':
            return <ImageBlockComponent key={key} block={block} />
          
          case 'videoBlock':
            return <VideoBlockComponent key={key} block={block} />
          
          case 'ctaBlock':
            return <CtaBlockComponent key={key} block={block} />
          
          default:
            // console.warn(`Unknown block type: ${(block as any)._type}`)
            return null
        }
      })}
    </div>
  )
}

export default DynamicPageContent
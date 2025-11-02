'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@lib/util/cn'

interface ImageConfig {
  url?: string
  alt?: string
  linkUrl?: string
}

interface ImageTextBlockProps {
  heading: string
  content?: string
  image?: ImageConfig
  layout: 'imageLeft' | 'imageRight' | 'imageLeftImageRight' | 'textLeftTextRight' | 'centerText'
  leftImage?: ImageConfig
  rightImage?: ImageConfig
  leftContent?: string
  rightContent?: string
  hideTitle?: boolean
}

// 圖片包裝組件
const ImageWrapper = ({ imageConfig, className, sizes }: { 
  imageConfig: ImageConfig
  className?: string
  sizes?: string 
}) => {
  // 輸出圖片配置，幫助調試連結問題
  // console.log('ImageWrapper 處理圖片:', {
    // url: imageConfig.url,
    // alt: imageConfig.alt,
    // linkUrl: imageConfig.linkUrl
  // });

  const imageElement = (
    <Image
      src={imageConfig.url!}
      alt={imageConfig.alt || '區塊圖片'}
      width={1920}
      height={1080}
      className={cn("w-full h-auto object-cover", className)}
      sizes={sizes}
    />
  )

  if (imageConfig.linkUrl) {
    return (
      <Link href={imageConfig.linkUrl} className="block w-full relative z-20" target="_blank" rel="noopener noreferrer">
        {imageElement}
      </Link>
    )
  }

  return imageElement
}

const ImageTextBlock = ({
  heading,
  content,
  image,
  layout,
  leftImage,
  rightImage,
  leftContent,
  rightContent,
  hideTitle = false
}: ImageTextBlockProps) => {
  // 檢查是否真的有標題內容
  const hasTitle = !hideTitle && heading && heading.trim().length > 0
  
  // 決定容器樣式
  const containerClasses = (() => {
    const isImageLayout = layout === 'imageLeft' || layout === 'imageRight' || layout === 'imageLeftImageRight'
    
    if (isImageLayout) {
      return "w-full max-w-none -mx-0 md:mx-0 px-0 md:px-0"
    }
    
    if (hasTitle) {
      return "w-full max-w-none -mx-0 md:mx-0 py-12 md:py-20 px-6 md:px-12"
    }
    
    return "w-full max-w-none -mx-0 md:mx-0 px-6 md:px-12"
  })()
  
  return (
    <div className={containerClasses}>
      {/* 左圖右文布局 */}
      {layout === 'imageLeft' && image?.url && (
        <div className="grid md:grid-cols-2 items-center gap-0">
          <div className="relative w-full overflow-hidden">
            <ImageWrapper 
              imageConfig={image} 
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className={cn(
            "flex flex-col justify-center px-4 py-6 md:px-12 xl:px-16 2xl:px-24 md:py-0",
            hasTitle ? "space-y-6 md:space-y-8" : "space-y-4"
          )}>
            {hasTitle && (
              <h2 className="h1 mb-6 text-center">
                {heading}
              </h2>
            )}
            {content && (
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </div>
        </div>
      )}

      {/* 右圖左文布局 */}
      {layout === 'imageRight' && image?.url && (
        <div className="grid md:grid-cols-2 items-center gap-0">
          <div className={cn(
            "flex flex-col justify-center px-4 py-6 md:px-12 xl:px-16 2xl:px-24 md:py-0 order-2 md:order-1",
            hasTitle ? "space-y-6 md:space-y-8" : "space-y-4"
          )}>
            {hasTitle && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-primary">
                {heading}
              </h2>
            )}
            {content && (
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </div>
          <div className="relative w-full overflow-hidden order-1 md:order-2">
            <ImageWrapper 
              imageConfig={image} 
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      )}

      {/* 中間文字布局 */}
      {layout === 'centerText' && (
        <div className="max-w-4xl mx-auto px-6 md:px-12 xl:px-16 2xl:px-24">
          <div className={cn(
            "text-center",
            hasTitle ? "space-y-8" : "space-y-4"
          )}>
            {hasTitle && (
              <h2 className="h1 mb-6">
                {heading}
              </h2>
            )}
            {content && (
              <div className="prose prose-lg max-w-none mx-auto" dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </div>
        </div>
      )}

      {/* 雙圖布局 */}
      {layout === 'imageLeftImageRight' && (
        <div className="w-full max-w-none m-0 p-0">
          {hasTitle && (
            <div className="text-center max-w-4xl mx-auto px-4 py-6 md:px-0 md:py-8">
              <h2 className="h1 mb-4 md:mb-8">
                {heading}
              </h2>
            </div>
          )}
          <div className="grid grid-cols-2 w-full m-0 p-0 gap-0">
            {leftImage?.url && (
              <div className="relative w-full overflow-hidden m-0 p-0">
                <ImageWrapper 
                  imageConfig={leftImage} 
                  sizes="(max-width: 768px) 50vw, 50vw"
                />
              </div>
            )}
            {rightImage?.url && (
              <div className="relative w-full overflow-hidden m-0 p-0">
                <ImageWrapper 
                  imageConfig={rightImage} 
                  sizes="(max-width: 768px) 50vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 雙文布局 */}
      {layout === 'textLeftTextRight' && (
        <div className="w-full max-w-none">
          {hasTitle && (
            <div className="text-center max-w-4xl mx-auto mb-8">
              <h2 className="h1">
                {heading}
              </h2>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-8 px-6 md:px-12 xl:px-16 2xl:px-24">
            {leftContent && (
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: leftContent }} />
              </div>
            )}
            {rightContent && (
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: rightContent }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageTextBlock

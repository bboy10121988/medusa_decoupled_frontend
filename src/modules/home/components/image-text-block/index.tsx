'use client'

import Image from 'next/image'
import { cn } from '@lib/util/cn'

interface ImageConfig {
  url?: string
  alt?: string
}

interface ImageTextBlockProps {
  heading: string
  content: string
  image?: ImageConfig
  layout: 'imageLeft' | 'imageRight' | 'imageLeftImageRight' | 'textLeftTextRight' | 'centerText'
  leftImage?: ImageConfig
  rightImage?: ImageConfig
  leftContent?: string
  rightContent?: string
  hideTitle?: boolean
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
  
  return (
    <div className={cn(
      "w-full max-w-[1440px] mx-auto",
      // 左圖右文和右圖左文模組例外，皆為0間距
      (layout === 'imageLeft' || layout === 'imageRight') ? "" : 
      // 其他布局：有標題則顯示間距，無標題則為0
      hasTitle ? "py-12 md:py-20" : ""
    )}>
      {/* 左圖右文布局 */}
      {layout === 'imageLeft' && image && (
        <div className="grid md:grid-cols-2 items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-white">
            <Image
              src={image.url || ''}
              alt={image.alt || '區塊圖片'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className={cn(
            "flex flex-col justify-center px-4 md:px-8",
            hasTitle ? "space-y-8" : "space-y-4"
          )}>
            {hasTitle && (
              <h2 className="h1 mb-6">
                {heading}
              </h2>
            )}
            <div 
              className="text-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      )}

      {/* 右圖左文布局 */}
      {layout === 'imageRight' && image && (
        <div className="grid md:grid-cols-2 items-center">
          <div className={cn(
            "flex flex-col justify-center px-4 md:px-8 order-2 md:order-1",
            hasTitle ? "space-y-8" : "space-y-4"
          )}>
            {hasTitle && (
              <h2 className="h1 mb-6">
                {heading}
              </h2>
            )}
            <div 
              className="text-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden order-1 md:order-2 border border-white">
            <Image
              src={image.url || ''}
              alt={image.alt || '區塊圖片'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      )}

      {/* 中間文字布局 */}
      {layout === 'centerText' && (
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className={cn(
            "text-center",
            hasTitle ? "space-y-8" : "space-y-4"
          )}>
            {hasTitle && (
              <h2 className="h1 mb-6">
                {heading}
              </h2>
            )}
            <div 
              className="text-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      )}

      {/* 雙圖布局 */}
      {layout === 'imageLeftImageRight' && (
        <div className={cn(
          "px-4 md:px-8",
          hasTitle ? "space-y-10" : "space-y-6"
        )}>
          <div className="text-center max-w-4xl mx-auto">
            {hasTitle && (
              <h2 className="h1 mb-8">
                {heading}
              </h2>
            )}
            {content && (
              <div 
                className="text-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {leftImage && (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={leftImage.url || ''}
                  alt={leftImage.alt || '左側圖片'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            {rightImage && (
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={rightImage.url || ''}
                  alt={rightImage.alt || '右側圖片'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 雙文布局 */}
      {layout === 'textLeftTextRight' && (
        <div className={cn(
          "px-4 md:px-8",
          hasTitle ? "space-y-8" : "space-y-4"
        )}>
          <div className="text-center max-w-4xl mx-auto">
            {hasTitle && (
              <h2 className="h1 mb-6">
                {heading}
              </h2>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {leftContent && (
              <div className="space-y-4">
                <div 
                  className="text-content"
                  dangerouslySetInnerHTML={{ __html: leftContent }}
                />
              </div>
            )}
            {rightContent && (
              <div className="space-y-4">
                <div 
                  className="text-content"
                  dangerouslySetInnerHTML={{ __html: rightContent }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageTextBlock

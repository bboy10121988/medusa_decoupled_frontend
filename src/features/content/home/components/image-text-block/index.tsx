'use client'

import Image from 'next/image'
import { cn } from '@lib/util/cn'

interface ImageConfig {
  url?: string
  alt?: string
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
      "w-full max-w-none",
      (layout === 'imageLeft' || layout === 'imageRight' || layout === 'imageLeftImageRight') ? "" : (hasTitle ? "py-12 md:py-20" : "")
    )}>
      {/* 左圖右文布局 */}
      {layout === 'imageLeft' && image?.url && (
        <div className="grid md:grid-cols-2 items-center">
          <div className="relative w-full overflow-hidden border border-white">
            <Image
              src={image.url}
              alt={image.alt || '區塊圖片'}
              width={1920}
              height={1080}
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className={cn(
            "flex flex-col justify-center px-6 md:px-12 xl:px-16 2xl:px-24",
            hasTitle ? "space-y-8" : "space-y-4"
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
        <div className="grid md:grid-cols-2 items-center">
          <div className={cn(
            "flex flex-col justify-center px-6 md:px-12 xl:px-16 2xl:px-24 order-2 md:order-1",
            hasTitle ? "space-y-8" : "space-y-4"
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
          <div className="relative w-full overflow-hidden order-1 md:order-2 border border-white">
            <Image
              src={image.url}
              alt={image.alt || '區塊圖片'}
              width={1920}
              height={1080}
              className="w-full h-auto object-cover"
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
            <div className="text-center max-w-4xl mx-auto m-0 p-0">
              <h2 className="h1 mb-8">
                {heading}
              </h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 w-full m-0 p-0 gap-2 md:gap-0">
            {leftImage?.url && (
              <div className="relative w-full overflow-hidden m-0 p-0">
                <Image
                  src={leftImage.url}
                  alt={leftImage.alt || '左側圖片'}
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            {rightImage?.url && (
              <div className="relative w-full overflow-hidden m-0 p-0">
                <Image
                  src={rightImage.url}
                  alt={rightImage.alt || '右側圖片'}
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
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

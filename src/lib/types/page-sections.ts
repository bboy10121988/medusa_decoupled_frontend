
export type BannerSlide = {
  heading: string
  subheading?: string
  desktopImage: string
  desktopImageAlt?: string
  mobileImage: string
  mobileImageAlt?: string
  imageLink?: string
  buttonText?: string
  buttonLink?: string
}

export type BannerSettings = {
  autoplay: boolean
  autoplaySpeed: number
  showArrows: boolean
  showDots: boolean
}

export type MainBanner = {
  _type: "mainBanner"
  isActive: boolean
  slides: BannerSlide[]
  settings: BannerSettings
}

export type ImageConfig = {
  url?: string
  alt?: string
  linkUrl?: string
}

export type ImageTextBlock = {
  _type: "imageTextBlock"
  isActive: boolean
  heading: string
  content: string
  image: ImageConfig
  layout: "imageLeft" | "imageRight" | "imageLeftImageRight" | "textLeftTextRight" | "centerText"
  leftImage?: ImageConfig
  rightImage?: ImageConfig
  leftContent?: string
  rightContent?: string
  hideTitle?: boolean
}

export type BlogSection = {
  _type: "blogSection"
  isActive: boolean
  title?: string
  category?: string
  limit: number
  postsPerRow: number
}

export type FeaturedProductsSection = {
  _type: "featuredProducts"
  heading: string
  showHeading: boolean
  showSubheading: boolean
  collection_id: string
  isActive: boolean
}

export type YoutubeSection = {
  _type: "youtubeSection"
  isActive: boolean
  heading?: string
  description?: string
  // 保留舊的 videoUrl 以向後兼容
  videoUrl?: string
  // 影片模式選擇
  videoMode?: 'youtube' | 'upload'
  // YouTube 模式設定
  youtubeSettings?: {
    desktopVideoUrl: string
    mobileVideoUrl: string
    useSameVideo: boolean
    autoplay: boolean
    loop: boolean
    muted: boolean
    showControls: boolean
  }
  // 上傳影片模式設定
  uploadSettings?: {
    desktopVideo?: {
      asset: {
        _id: string
        url: string
        originalFilename: string
        mimeType: string
      }
    }
    mobileVideo?: {
      asset: {
        _id: string
        url: string
        originalFilename: string
        mimeType: string
      }
    }
    useSameVideo: boolean
    autoplay: boolean
    loop: boolean
    muted: boolean
    showControls: boolean
  }
  // 向後兼容 - 舊的響應式影片設定
  videoSettings?: {
    desktopVideoUrl: string
    mobileVideoUrl: string
    useSameVideo: boolean
  }
  fullWidth: boolean
}

export type GoogleMapsSection = {
  _type: "googleMapsSection"
  isActive: boolean
  heading?: string
  description?: string
  googleMapsUrl?: string
  mapHeight?: number
}

import type { ContactSection, ContentSection } from './sections'
import type { ServiceCards } from './service-cards'

export type MainSection = MainBanner | ImageTextBlock | FeaturedProductsSection | BlogSection | YoutubeSection | ContentSection | ContactSection | ServiceCards | GoogleMapsSection


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
  videoUrl: string
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

// 基本內容區塊類型
export type TextBlock = {
  _type: "textBlock"
  title?: string
  content: any[]
  alignment?: "left" | "center" | "right"
}

export type ImageBlock = {
  _type: "imageBlock"
  title?: string
  image: {
    url?: string
    alt?: string
  }
  alt?: string
  caption?: string
  layout?: "full" | "center" | "float-left" | "float-right"
}

export type VideoBlock = {
  _type: "videoBlock"
  title?: string
  videoUrl?: string
  thumbnail?: {
    url?: string
  }
  description?: string
}

export type CTABlock = {
  _type: "ctaBlock"
  title?: string
  buttonText?: string
  buttonUrl?: string
  buttonStyle?: "primary" | "secondary" | "outline"
  alignment?: "left" | "center" | "right"
}

import type { ContactSection, ContentSection } from './sections'
import type { ServiceCards } from './service-cards'

export type MainSection = 
  | MainBanner 
  | ImageTextBlock 
  | FeaturedProductsSection 
  | BlogSection 
  | YoutubeSection 
  | ContentSection 
  | ContactSection 
  | ServiceCards 
  | GoogleMapsSection
  | TextBlock
  | ImageBlock
  | VideoBlock
  | CTABlock

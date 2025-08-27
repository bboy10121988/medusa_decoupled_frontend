
export type BannerSlide = {
  heading: string
  backgroundImage: string
  backgroundImageAlt?: string
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
}

import type { ContactSection, ContentSection } from './sections'
import type { ServiceCards } from './service-cards'

export type MainSection = MainBanner | ImageTextBlock | FeaturedProductsSection | BlogSection | YoutubeSection | ContentSection | ContactSection | ServiceCards

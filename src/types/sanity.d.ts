/**
 * Sanity 型別定義
 * 為 Sanity CMS 相關類型提供完整定義
 */

import type { PortableTextBlock } from "@portabletext/types"

// 基礎 Sanity 型別
export interface SanityDocument {
  _id: string
  _type: string
  _createdAt: string
  _updatedAt: string
  _rev?: string
}

// Sanity 圖片型別
export interface SanityImage {
  _type: "image"
  asset: {
    _ref: string
    _type: "reference"
  }
  alt?: string
  caption?: string
  url: string // 確保 url 屬性存在
}

// Sanity 參考型別
export interface SanityReference {
  _type: "reference"
  _ref: string
}

// Header 型別定義
export interface SanityHeader extends SanityDocument {
  _type: "header"
  logo?: SanityImage
  logoHeight?: number // 添加缺失的 logoHeight 屬性
  logoWidth?: number  // 添加缺失的 logoWidth 屬性
  logoSize?: {        // 添加 logoSize 屬性
    desktop?: number
    mobile?: number
  }
  storeName?: string  // 添加缺失的 storeName 屬性
  navigation?: NavigationItem[] // 更新為 NavigationItem 類型
  marquee?: {         // 添加 marquee 屬性
    enabled?: boolean
    text1?: {
      enabled?: boolean
      content?: string
    }
    text2?: {
      enabled?: boolean
      content?: string
    }
    text3?: {
      enabled?: boolean
      content?: string
    }
    linkUrl?: string
    pauseOnHover?: boolean
  }
}

// Navigation Item 型別定義
export interface NavigationItem {
  _key?: string
  _type?: string
  name: string    // 必需屬性，符合模板中的使用
  href: string    // 必需屬性，符合模板中的使用
  submenu?: NavigationItem[]
}

// Footer Link 型別定義
export interface FooterLink {
  _key?: string
  text: string
  linkType?: 'internal' | 'external'
  internalLink?: string
  externalUrl?: string
  url?: string     // 向後兼容字段
  href?: string    // 更早的向後兼容字段
}

// Footer 型別定義
export interface SanityFooter extends SanityDocument {
  _type: "footer"
  // 基本資訊
  title?: string
  logo?: SanityImage
  logoWidth?: number
  copyright?: string
  
  // 聯絡資訊已經移除
  
  // 社群媒體
  socialMedia?: {
    facebook?: {
      enabled?: boolean
      url?: string
    }
    instagram?: {
      enabled?: boolean
      url?: string
    }
    line?: {
      enabled?: boolean
      url?: string
    }
    youtube?: {
      enabled?: boolean
      url?: string
    }
    twitter?: {
      enabled?: boolean
      url?: string
    }
  }
  
  // 區段資訊
  sections?: Array<{
    _key: string
    title: string
    links?: FooterLink[]
  }>
  
  // 簡化連結格式
  links?: Array<{
    title: string
    href: string
  }>
  
  // 社群連結（簡化格式）
  socialLinks?: Array<{
    platform: string
    url: string
  }>
}

// FooterData 別名，用於向後兼容
export type FooterData = SanityFooter;

// 內容區塊型別
export interface SanityContentSection extends SanityDocument {
  _type: "contentSection"
  title?: string
  content?: PortableTextBlock[]
  image?: SanityImage
}

// Blog 文章型別
export interface SanityPost extends SanityDocument {
  _type: "post"
  title: string
  slug: {
    current: string
  }
  author?: SanityReference
  categories?: SanityReference[]
  publishedAt?: string
  excerpt?: string
  body?: PortableTextBlock[]
  mainImage?: SanityImage
  seo?: SanitySEO
}

// 作者型別
export interface SanityAuthor extends SanityDocument {
  _type: "author"
  name: string
  slug: {
    current: string
  }
  image?: SanityImage
  bio?: PortableTextBlock[]
}

// 分類型別
export interface SanityCategory extends SanityDocument {
  _type: "category"
  title: string
  slug: {
    current: string
  }
  description?: string
}

// 產品型別
export interface SanityProduct extends SanityDocument {
  _type: "product"
  title: string
  slug: {
    current: string
  }
  description?: PortableTextBlock[]
  images?: SanityImage[]
  price?: number
  medusaProductId?: string
  categories?: SanityReference[]
  tags?: string[]
  seo?: SanitySEO
}

// SEO 型別
export interface SanitySEO {
  title?: string
  description?: string
  keywords?: string[]
  openGraph?: {
    title?: string
    description?: string
    image?: SanityImage
  }
}

// 頁面型別
export interface SanityPage extends SanityDocument {
  _type: "page"
  title: string
  slug: {
    current: string
  }
  content?: PortableTextBlock[]
  seo?: SanitySEO
  blocks?: Array<SanityContentBlock>
}

// 內容區塊聯合型別
export type SanityContentBlock = 
  | SanityMainBanner
  | SanityContentSection
  | SanityImageTextBlock
  | SanityBlogSection
  | SanityYoutubeSection
  | SanityFeaturedProducts
  | SanityServiceCardSection

// 橫幅區塊
export interface SanityMainBanner extends SanityDocument {
  _type: "mainBanner"
  title?: string
  subtitle?: string
  image?: SanityImage
  ctaText?: string
  ctaLink?: string
}

// 圖文區塊
export interface SanityImageTextBlock extends SanityDocument {
  _type: "imageTextBlock"
  title?: string
  content?: PortableTextBlock[]
  image?: SanityImage
  imagePosition?: "left" | "right"
}

// Blog 區塊
export interface SanityBlogSection extends SanityDocument {
  _type: "blogSection"
  title?: string
  posts?: SanityReference[]
  showCount?: number
}

// YouTube 區塊
export interface SanityYoutubeSection extends SanityDocument {
  _type: "youtubeSection"
  title?: string
  videoId?: string
  description?: PortableTextBlock[]
}

// 特色產品區塊
export interface SanityFeaturedProducts extends SanityDocument {
  _type: "featuredProducts"
  title?: string
  products?: SanityReference[]
}

// 服務卡片區塊
export interface SanityServiceCardSection extends SanityDocument {
  _type: "serviceCardSection"
  title?: string
  cards?: Array<{
    title: string
    description: string
    icon?: SanityImage
    link?: string
  }>
}

// Content Props for components
export interface SanityContentProps {
  content: PortableTextBlock[]
  blocks?: any[] // 支援自定義區塊
}

// Sanity Client 相關型別
export interface SanityClientConfig {
  projectId: string
  dataset: string
  apiVersion: string
  useCdn?: boolean
  token?: string
}

// GROQ 查詢結果型別
export interface SanityQueryResult<T = any> {
  query: string
  result: T
  ms: number
}

// 動態頁面型別
export interface SanityDynamicPage extends SanityDocument {
  _type: "dynamicPage"
  title: string
  slug: {
    current: string
  }
  status: 'draft' | 'preview' | 'published' | 'archived'
  description?: string
  
  // 頁面內容
  pageContent?: Array<{
    _type: 'textBlock' | 'imageBlock' | 'videoBlock' | 'ctaBlock'
    _key: string
    [key: string]: any
  }>
  
  // SEO 相關
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  ogImage?: SanityImage
  
  // 社群媒體分享
  ogTitle?: string
  ogDescription?: string
  socialImage?: SanityImage
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  
  // 頁面設定
  version?: number
  publishedAt?: string
  lastModified?: string
  customCSS?: string
  customJS?: string
}

// 聲明全域模組擴展
declare global {
  namespace Sanity {
    interface Document extends SanityDocument {}
    interface Image extends SanityImage {}
    interface Reference extends SanityReference {}
  }
}

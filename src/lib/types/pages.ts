import type { MainSection } from './page-sections'

export type SeoData = {
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
  seoKeywords?: string[]
  noIndex?: boolean
  noFollow?: boolean
  ogTitle?: string
  ogDescription?: string
  ogImage?: {
    asset: { url: string }
    alt: string
  }
  twitterCard?: string
}

export type PageData = {
  _type: string
  title: string
  slug: string
  pageStatus: 'draft' | 'published'
  seoDescription?: string
  additionalKeywords?: string[]
  noIndex?: boolean
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: {
    asset: { url: string }
    alt: string
  }
  twitterCard?: string
  mainSections: MainSection[]
}

export type HomePageData = {
  title: string
  mainSections: MainSection[]
  seoTitle?: string
  seoDescription?: string
  focusKeyword?: string
  seoKeywords?: string[]
  canonicalUrl?: string
  noIndex?: boolean
  noFollow?: boolean
  ogTitle?: string
  ogDescription?: string
  ogImage?: {
    asset: { url: string }
    alt: string
  }
  twitterCard?: string
}

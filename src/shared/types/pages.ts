import type { MainSection } from './page-sections'

export type SeoData = {
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
}

export type PageData = {
  title: string
  slug: string
  isActive: boolean
  mainSections: MainSection[]
  seo?: SeoData
}

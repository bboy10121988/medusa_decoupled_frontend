import { Rule, ValidationContext } from '@sanity/types'

export interface SanityReference {
  _type: string
  _ref: string
}

export interface ServiceStyleLevel {
  _key: string
  levelName: string
  levelOrder: number
  price: number
  stylistName?: string
}

export interface ServiceCardImage {
  _type: 'image'
  asset: SanityReference
  alt?: string
  caption?: string
}

export interface ServiceCard {
  _type: 'serviceCard'
  _id: string
  title: string
  englishTitle?: string
  mainPrice: number
  priceLabel: 'up' | 'fixed'
  cardImage?: ServiceCardImage
  stylists?: ServiceStyleLevel[]
  link?: string
}

export interface ServiceCardSection {
  _type: 'serviceCardSection'
  _id: string
  isActive: boolean
  heading?: string
  subheading?: string
  cardsPerRow: number
  cards: ServiceCard[]
}

export type SanityRule = Rule
export type SanityValidationContext = ValidationContext

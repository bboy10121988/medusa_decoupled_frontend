import type { PortableTextBlock } from '@portabletext/types'

export type ContentSection = {
  _type: "contentSection"
  isActive: boolean
  heading?: string
  content: PortableTextBlock[]
}

export type ContactSection = {
  _type: "contactSection"
  isActive: boolean
  title?: string
  address?: string
  phone?: string
  email?: string
  businessHours?: Array<{
    days: string
    hours: string
  }>
  socialLinks?: Array<{
    platform: string
    url: string
  }>
  googleMapsUrl?: string
}

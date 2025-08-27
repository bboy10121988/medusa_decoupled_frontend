export interface Footer {
  title?: string
  logo?: {
    url: string
    alt?: string
  }
  logoWidth?: number
  sections?: Section[]
  contactInfo?: {
    phone?: string
    email?: string
  }
  socialMedia?: {
    facebook?: SocialMediaItem
    instagram?: SocialMediaItem
    line?: SocialMediaItem
    youtube?: SocialMediaItem
    twitter?: SocialMediaItem
  }
  copyright?: string
}

export interface Section {
  title: string
  links?: Array<{
    text: string
    url: string
  }>
}

export interface Link {
  title: string
  url: string
}

export interface SocialMediaItem {
  enabled: boolean
  url?: string
}

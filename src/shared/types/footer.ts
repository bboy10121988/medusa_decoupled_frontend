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
    address?: string
  }
  // contactInfo 已移至 sections[].customInfo
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
  customInfo?: {
    phone?: string
    email?: string
    text?: string
  }
}

export interface Link {
  title: string
  url: string
}

export interface SocialMediaItem {
  enabled: boolean
  url?: string
}

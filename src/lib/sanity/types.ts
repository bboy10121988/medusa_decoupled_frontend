// Type re-exports for backward compatibility
export type { 
  SanityHeader, 
  NavigationItem, 
  SanityImage, 
  Footer,
  FooterSection,
  FooterLink,
  ContactInfo,
  SocialLink 
} from '../../types/global'

// 從 Sanity 類型定義匯出 FooterData
export type { SanityFooter as FooterData } from '../../types/sanity.d'

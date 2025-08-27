export interface SanityImageAsset {
  _id: string;
  url: string;
}

export interface SanityImage {
  asset: SanityImageAsset;
}

export interface BlogPostType {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage: {
    asset: {
      url: string;
    };
  };
  publishedAt: string;
  categories?: CategoryType[];
  excerpt?: string;
  author?: {
    name: string;
    image?: SanityImage;
  };
  body?: any; // PortableText content
  status?: string;
}

export interface CategoryType {
  _id: string;
  title: string;
}

// Header and Footer types for Sanity CMS
export interface HeaderData {
  storeName: string;
  logoHeight: number;
  marquee: {
    enabled: boolean;
    texts: string[];
  };
  navigation: NavigationItem[];
}

export interface NavigationItem {
  name: string;
  href: string;
  _key?: string;
}

export interface FooterData {
  copyright: string;
  sections: FooterSection[];
  contactInfo: ContactInfo;
  socialMedia: SocialMediaLinks;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
  _key?: string;
}

export interface FooterLink {
  text: string;
  url: string;
  _key?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
}

export interface SocialMediaLinks {
  facebook: {
    enabled: boolean;
    url: string;
  };
  instagram: {
    enabled: boolean;
    url: string;
  };
  line: {
    enabled: boolean;
    url: string;
  };
  youtube?: {
    enabled: boolean;
    url: string;
  };
}

export interface SanityImageCrop {
  _type: 'sanity.imageCrop'
  top: number
  bottom: number
  left: number
  right: number
}

export interface SanityImageHotspot {
  _type: 'sanity.imageHotspot'
  x: number
  y: number
  height: number
  width: number
}

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  crop?: SanityImageCrop
  hotspot?: SanityImageHotspot
}

export interface FeaturedProduct {
  heading: string
  showHeading: boolean
  showSubheading: boolean
  collection_id: string
  isActive: boolean
}

export interface BlogPost {
  _id: string
  _type: 'post'
  title: string
  slug: {
    current: string
    _type: 'slug'
  }
  mainImage: {
    asset: {
      url: string
      _ref: string
      _type: 'reference'
    }
  }
  publishedAt: string
  excerpt?: string
  categories?: Category[]
  author?: {
    name: string
    image?: SanityImage
  }
  body?: any // Portable Text 內容
  status?: string
}

export interface Category {
  _id: string
  _type: 'category'
  title: string
}

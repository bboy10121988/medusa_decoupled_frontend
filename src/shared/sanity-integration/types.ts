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

import type { Footer } from './types/footer'
import type { BlogPost, FeaturedProduct } from '../types/global'
import type { MainSection } from './types/page-sections'
import type { PageData } from './types/pages'
import type { Category } from '../types/sanity'
import type { ServiceCards } from './types/service-cards'
import { client, safeFetch } from './sanity-client'
import {
  HOMEPAGE_OLD_QUERY,
  FEATURED_PRODUCTS_QUERY,
  FEATURED_PRODUCTS_HEADING_QUERY,
  HEADER_QUERY,
  PAGE_BY_SLUG_QUERY,
  ALL_PAGES_QUERY,
  HOMEPAGE_QUERY,
  ALL_POSTS_BASE_QUERY,
  ALL_POSTS_PROJECTION,
  CATEGORIES_QUERY,
  POST_BY_SLUG_QUERY,
  POST_BY_TITLE_OR_ID_QUERY,
  SERVICE_SECTION_QUERY,
  FOOTER_QUERY,
  ALL_FOOTERS_QUERY,
  BLOG_PAGE_SETTINGS_QUERY
} from './sanity-queries'

export async function getHomepage_old(): Promise<{ title: string; mainSections: MainSection[] }> {
  const result: any = await safeFetch(HOMEPAGE_OLD_QUERY, {}, {
    next: { revalidate: 300 } // 5 分鐘緩存
  }, null)

  // 過濾掉未知類型的 sections 並記錄警告
  if (result?.mainSections) {
    result.mainSections = result.mainSections.filter((section: any) => {
      if (section?.isUnknownType) {
        return false
      }
      return section?._type // 只保留有 _type 的 sections
    })
  }

  return result as { title: string; mainSections: MainSection[] }
}

export async function getFeaturedProducts(language: string = 'zh-TW'): Promise<FeaturedProduct[]> {
  return (await safeFetch(FEATURED_PRODUCTS_QUERY, { lang: language }, {
    next: { revalidate: 300 } // 5 分鐘緩存
  }, [])) as FeaturedProduct[]
}

export async function getFeaturedProductsHeading(collectionId: string, language: string = 'zh-TW') {
  return await safeFetch(FEATURED_PRODUCTS_HEADING_QUERY, { collectionId, lang: language }, {
    next: { revalidate: 300 }
  }, null)
}

export async function getHeader(language: string = 'zh-TW') {
  return await safeFetch(HEADER_QUERY, { lang: language }, {
    next: { revalidate: 300 } // 5 分鐘緩存
  }, null)
}

export async function getPageBySlug(slug: string, language: string = 'zh-TW'): Promise<PageData | null> {
  try {
    return await safeFetch(PAGE_BY_SLUG_QUERY, { slug, lang: language }, {}, null)
  } catch (error) {
    return null
  }
}

export async function getAllPosts(category?: string, limit: number = 50, language: string = 'zh-TW'): Promise<BlogPost[]> {
  try {
    const lang = language
    const categoryFilter = category ? ` && "${category}" in categories[]->title` : ""
    const query = `${ALL_POSTS_BASE_QUERY}${categoryFilter}] | order(publishedAt desc) [0...${limit}] ${ALL_POSTS_PROJECTION}`

    console.log('[getAllPosts] DEBUG:', { category, limit, language, lang, query })

    const posts = await safeFetch<BlogPost[]>(query, { lang }, { next: { revalidate: 300 } }, [])
    return posts || []
  } catch (error) {
    console.error('[getAllPosts] Error:', error)
    return []
  }
}

export async function getCategories(language: string = 'zh-TW'): Promise<Category[]> {
  try {
    const lang = language
    const categories = await safeFetch<Category[]>(CATEGORIES_QUERY, { lang }, {}, [])
    return categories || []
  } catch (error) {
    return []
  }
}

export async function getPostBySlug(slug: string, language: string = 'zh-TW'): Promise<BlogPost | null> {
  try {
    const lang = language
    let result = await safeFetch(POST_BY_SLUG_QUERY, { slug, lang }, {}, null)

    if (result) {
      return result
    }

    const searchTerm = slug.includes('post-') ? slug.split('post-')[1] : slug.replace(/-/g, ' ')
    result = await safeFetch(POST_BY_TITLE_OR_ID_QUERY, { slug, title: searchTerm, lang }, {}, null)

    return result
  } catch (error) {
    return null
  }
}

export async function getAllPages(): Promise<PageData[]> {
  try {
    const pages = await safeFetch<PageData[]>(ALL_PAGES_QUERY, {}, {}, [])
    return pages || []
  } catch (error) {
    return []
  }
}

export async function getHomepage(language: string = 'zh-TW'): Promise<{
  title: string;
  mainSections: MainSection[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: { asset: { url: string }; alt: string };
  twitterCard?: string;
}> {
  try {
    const lang = language
    const result = await safeFetch(HOMEPAGE_QUERY, { lang }, {
      next: { revalidate: 300 } // 5 分鐘緩存
    }, { title: '', mainSections: [] })

    // 過濾掉未知類型的 sections 並記錄警告
    if (result?.mainSections) {
      result.mainSections = result.mainSections.filter((section: any) => {
        if (section?.isUnknownType) {
          return false
        }
        return section?._type // 只保留有 _type 的 sections
      })
    }

    return result as { title: string; mainSections: MainSection[] }
  } catch (error) {
    return { title: '', mainSections: [] }
  }
}

export async function getServiceSection(): Promise<ServiceCards | null> {
  try {
    const result = await safeFetch(SERVICE_SECTION_QUERY, {}, {}, null)

    // 添加 _type 如果不存在
    if (result && !result._type) {
      result._type = "serviceCardSection"
    }

    return result || null
  } catch (error) {
    return null
  }
}

export async function getFooter(language: string = 'zh-TW'): Promise<Footer | null> {
  return await safeFetch(FOOTER_QUERY, { lang: language }, {}, null)
}

export async function getAllFooters(): Promise<Footer[]> {
  return await safeFetch(ALL_FOOTERS_QUERY, {}, {}, [])
}

export async function getBlogPageSettings() {
  try {
    const result = await safeFetch(BLOG_PAGE_SETTINGS_QUERY, {}, {}, null)
    return result || {
      title: '部落格文章',
      subtitle: '探索我們的最新消息與文章',
      showTitle: false,
      showSubtitle: false,
      postsPerPage: 9,
      showCategories: true,
      categoryTitle: '文章分類',
      allCategoriesLabel: '全部文章',
      showSidebar: true,
      showLatestPosts: true,
      latestPostsTitle: '最新文章',
      latestPostsCount: 4,
      gridColumns: 3,
      mobileColumns: 2,
      layout: 'grid',
      cardStyle: 'card',
      showExcerpt: true,
      excerptLength: 80,
      showReadMore: true,
      readMoreText: '閱讀更多',
      showPublishDate: true,
      showAuthor: false,
      showCategoryTags: true,
      categoryTagLimit: 2,
      enablePagination: true,
      enableSearch: false
    }
  } catch (error) {
    return {
      title: '部落格文章',
      subtitle: '探索我們的最新消息與文章',
      showTitle: false,
      showSubtitle: false,
      postsPerPage: 9,
      showCategories: true,
      categoryTitle: '文章分類',
      allCategoriesLabel: '全部文章',
      showSidebar: true,
      showLatestPosts: true,
      latestPostsTitle: '最新文章',
      latestPostsCount: 4,
      gridColumns: 3,
      mobileColumns: 2,
      layout: 'grid',
      cardStyle: 'card',
      showExcerpt: true,
      excerptLength: 80,
      showReadMore: true,
      readMoreText: '閱讀更多',
      showPublishDate: true,
      showAuthor: false,
      showCategoryTags: true,
      categoryTagLimit: 2,
      enablePagination: true,
      enableSearch: false
    }
  }
}

export async function getSiteInfo(language: string = 'zh-TW') {
  try {
    const homepage = await getHomepage(language);
    return {
      title: "首頁", // fallback
      description: homepage.seoDescription || "",
      seoDescription: homepage.seoDescription || "",
      seoTitle: homepage.seoTitle || "Fantasy World Barber Shop"
    }
  } catch (error) {
    return {
      title: "首頁",
      description: "",
      seoDescription: "",
      seoTitle: "Fantasy World Barber Shop"
    }
  }
}

export { client }
export default client

import { createClient } from "next-sanity"
import { BlogPostType, CategoryType, HeaderData, FooterData } from "./types"

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
})

export async function getAllPosts(category?: string, limit: number = 50): Promise<BlogPostType[]> {
  try {
    // 建立基本查詢
    const baseQuery = "*[_type == \"post\""
    const categoryFilter = category ? " && \"" + category + "\" in categories[]->title" : ""
    const query = baseQuery + categoryFilter + "] | order(publishedAt desc) [0..." + limit + "] { title, slug, mainImage { asset->{ url } }, publishedAt, excerpt, categories[]->{ _id, title }, author->{ name, image }, status, _id }"

    const posts = await client.fetch<BlogPostType[]>(query)
    return posts || []
  } catch (error) {
    console.error("[getAllPosts] 從 Sanity 獲取部落格文章時發生錯誤:", error)
    return []
  }
}

export async function getCategories(): Promise<CategoryType[]> {
  try {
    const query = "*[_type == \"category\"] { _id, title }"
    
    const categories = await client.fetch<CategoryType[]>(query)
    return categories || []
  } catch (error) {
    console.error("[getCategories] 從 Sanity 獲取分類時發生錯誤:", error)
    return []
  }
}

// 新增 Header 資料獲取函數
export async function getHeader() {
  try {
    const query = `*[_type == "header"][0]{
      logo{
        "url": asset->url,
        alt
      },
      storeName,
      logoWidth,
      navigation[]{
        name,
        href
      },
      marquee {
        enabled,
        text1 {
          enabled,
          content
        },
        text2 {
          enabled,
          content
        },
        text3 {
          enabled,
          content
        },
        linkUrl,
        pauseOnHover
      }
    }`
    
    const headerData = await client.fetch(query)
    return headerData || null
  } catch (error) {
    console.error("[getHeader] 從 Sanity 獲取 Header 資料時發生錯誤:", error)
    return null
  }
}

// 新增 Footer 資料獲取函數
export async function getFooter() {
  try {
    const query = `*[_type == "footer" && !(_id in path('drafts.**'))] | order(_updatedAt desc)[0] {
      title,
      logo {
        "url": asset->url,
        alt
      },
      logoWidth,
      sections[] {
        title,
        links[] {
          text,
          url
        }
      },
      contactInfo {
        phone,
        email
      },
      socialMedia {
        facebook {
          enabled,
          url
        },
        instagram {
          enabled,
          url
        },
        line {
          enabled,
          url
        },
        youtube {
          enabled,
          url
        },
        twitter {
          enabled,
          url
        }
      },
      copyright
    }`
    
    const footerData = await client.fetch(query)
    return footerData || null
  } catch (error) {
    console.error("[getFooter] 從 Sanity 獲取 Footer 資料時發生錯誤:", error)
    return null
  }
}

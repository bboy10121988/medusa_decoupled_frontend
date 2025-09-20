import { createClient } from 'next-sanity'
import { BlogPostType, CategoryType } from './types'

// 檢查 token 並提供開發時警告
const publicToken = process.env.NEXT_PUBLIC_SANITY_TOKEN
const serverToken = process.env.SANITY_API_TOKEN

if (typeof window === 'undefined' && !serverToken && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ [Sanity] 缺少 SANITY_API_TOKEN 環境變數，server-side 寫入功能將受限。')
  console.warn('📝 請在 .env.local 中加入: SANITY_API_TOKEN=你的_sanity_寫入_token')
}

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: !serverToken, // 如果沒有 server token，則使用 CDN（只讀模式）
  token: publicToken || serverToken, // 支援兩種 token 名稱
})

export async function getAllPosts(category?: string, limit: number = 50): Promise<BlogPostType[]> {
  try {
    // 建立基本查詢
    const baseQuery = `*[_type == "post"`
    const categoryFilter = category ? ` && "${category}" in categories[]->title` : ""
    const query = `${baseQuery}${categoryFilter}] | order(publishedAt desc) [0...${limit}] {
      title,
      slug,
      mainImage {
        asset->{
          url
        }
      },
      publishedAt,
      excerpt,
      categories[]->{
        _id,
        title
      },
      author->{
        name,
        image
      },
      status,
      _id
    }`

    const posts = await client.fetch<BlogPostType[]>(query)
    return posts || []
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('[getAllPosts] 從 Sanity 獲取部落格文章時發生錯誤:', error)
    return []
  }
}

export async function getCategories(): Promise<CategoryType[]> {
  try {
    const query = `*[_type == "category"] {
      _id,
      title
    }`
    
    const categories = await client.fetch<CategoryType[]>(query)
    return categories || []
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('[getCategories] 從 Sanity 獲取分類時發生錯誤:', error)
    return []
  }
}

// 為了向後兼容，添加默認導出
export default client

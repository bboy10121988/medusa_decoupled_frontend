import { createClient } from 'next-sanity'
import { BlogPostType, CategoryType } from './types'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
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
    console.error('[getAllPosts] 從 Sanity 獲取部落格文章時發生錯誤:', error)
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
    console.error('[getCategories] 從 Sanity 獲取分類時發生錯誤:', error)
    return []
  }
}

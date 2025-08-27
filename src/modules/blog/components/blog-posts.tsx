import BlogCard from "./blog-card"
import type { BlogPost } from "./blog-card"
import client from "@lib/sanity"

async function getBlogPosts(category?: string, limit: number = 6) {
  try {
    // 1. 建立基本查詢條件
    const baseQuery = `_type == "post"`
    
    // 2. 建立分類過濾條件
    const categoryFilter = category ? `&& $category in categories[]->title` : ''
    
    // 3. 組合完整查詢 - 使用 _createdAt 而不是 publishedAt
    const query = `*[${baseQuery} ${categoryFilter}] | order(_createdAt desc) [0...${limit}] {
      title,
      slug,
      mainImage {
        asset->{
          url
        }
      },
      publishedAt,
      _createdAt,
      categories[]->{
        title
      },
      _id,
      status,
      body // 添加文章內文
    }`

    // 4. 設置查詢參數
    const params = category ? { category } : {}

    // 5. 執行查詢並傳入參數
    const posts = await client.fetch<BlogPost[]>(query, params)
    console.log('BlogPosts - 查詢到的文章數量:', posts?.length)
    return posts
  } catch (error) {
    console.error('取得部落格文章時發生錯誤:', error)
    return []
  }
}

export default async function BlogPosts({ 
  category,
  limit = 2,
  title,
  postsPerRow = 3,
  showTitle = true
}: { 
  category?: string
  limit?: number
  title?: string 
  postsPerRow?: number
  showTitle?: boolean
}) {
  try {
    const posts = await getBlogPosts(category, limit)

    // 檢查並過濾無效的文章 - 移除對主圖片的強制要求
    const validPosts = posts?.filter(post => (
      post && 
      post.title && 
      post.slug?.current
    ))

    // 根據 postsPerRow 設置網格樣式
    const getGridCols = (cols: number) => {
      switch (cols) {
        case 1:
          return "grid-cols-1"
        case 2:
          return "grid-cols-2 md:grid-cols-2"
        case 3:
          return "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
        case 4:
          return "grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
        default:
          return "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
      }
    }

    if (!validPosts || validPosts.length === 0) {
      return (
        <div className={(showTitle && title) ? "py-8 md:py-12 bg-gray-50" : "py-0 bg-gray-50"}>
          <div className="container mx-auto px-4">
            <div className="text-center text-gray-500">
              目前還沒有已發布的文章
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={(showTitle && title) ? "py-8 md:py-12 bg-gray-50" : "py-0 bg-gray-50"}>
        <div className="content-container">
          {/* 標題區塊 - 作為整體處理，只有在 showTitle 為 true 且有標題時才顯示 */}
          {showTitle && title && (
            <div className="section-header-container">
              <h2 className="h1">{title}</h2>
              {/* 調試信息作為標題的一部分 */}
              <div className="text-sm text-gray-500 mt-2">
                {`找到 ${posts?.length || 0} 篇文章，其中 ${validPosts?.length || 0} 篇可顯示`}
              </div>
            </div>
          )}
          {validPosts && validPosts.length > 0 ? (
            <ul className={`grid ${getGridCols(postsPerRow)} gap-0`}>
              {validPosts.map((post) => (
                <BlogCard 
                  key={post._id || post.title} 
                  post={post} 
                />
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500">
              目前還沒有已發布的文章
            </div>
          )}
          {validPosts?.length >= limit && (
            <div className="flex justify-center mt-12">
              <a 
                href="/blog" 
                className="btn-secondary"
              >
                查看更多文章
              </a>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('顯示部落格文章時發生錯誤:', error)
    return (
      <div className={(showTitle && title) ? "py-8 md:py-12 bg-gray-50" : "py-0 bg-gray-50"}>
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">
            載入文章時發生錯誤，請稍後再試
          </div>
        </div>
      </div>
    )
  }
}

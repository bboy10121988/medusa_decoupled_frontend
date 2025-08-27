import client from "@lib/sanity"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const categoryId = searchParams.get('category')

  try {
    const query = categoryId
      ? `*[_type == "post" && $categoryId in categories[]->_id] | order(publishedAt desc) {
          _id,
          title,
          "slug": slug.current,
          publishedAt,
          mainImage {
            asset->{
              url
            }
          },
          categories[]->{
            title
          }
        }`
      : `*[_type == "post"] | order(publishedAt desc) {
          _id,
          title,
          "slug": slug.current,
          publishedAt,
          mainImage {
            asset->{
              url
            }
          },
          categories[]->{
            title
          }
        }`

    const posts = await client.fetch(query, { categoryId })
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('獲取文章時出錯:', error)
    return NextResponse.json({ error: '獲取文章時出錯' }, { status: 500 })
  }
}

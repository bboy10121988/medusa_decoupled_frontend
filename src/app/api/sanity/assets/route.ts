import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export const runtime = 'nodejs'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-30',
  useCdn: true,
  perspective: 'published',
})

type SortKey = 'newest' | 'oldest' | 'largest' | 'smallest'

function getOrder(sort: SortKey): string {
  switch (sort) {
    case 'oldest':
      return '_createdAt asc'
    case 'largest':
      return 'coalesce(size, 0) desc, _createdAt desc'
    case 'smallest':
      return 'coalesce(size, 0) asc, _createdAt desc'
    case 'newest':
    default:
      return '_createdAt desc'
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const q = (searchParams.get('q') || '').trim()
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '24', 10) || 24, 1), 100)
    const sort = (searchParams.get('sort') as SortKey) || 'newest'

    const offset = (page - 1) * pageSize
    const end = offset + pageSize + 1 // 多取一筆判斷是否有下一頁

    const order = getOrder(sort)

    const query = `*[_type == "sanity.imageAsset" && (${q ? 'originalFilename match $q' : 'true'})]
      | order(${order})
      [${offset}...${end}] {
        _id,
        _type,
        url,
        originalFilename,
        size,
        metadata { dimensions { width, height }, format },
        _createdAt,
        _updatedAt
      }`

    const results = await client.fetch<any[]>(query, q ? { q: `${q}*` } : {})
    const hasMore = results.length > pageSize
    const items = hasMore ? results.slice(0, pageSize) : results

    return NextResponse.json({
      success: true,
      items,
      page,
      pageSize,
      nextPage: hasMore ? page + 1 : undefined,
      sort,
      q,
    })
  } catch (error: any) {
    // console.error('Sanity assets list error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch assets' }, { status: 500 })
  }
}


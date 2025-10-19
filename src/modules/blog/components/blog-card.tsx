import Link from "next/link"
import Image from "next/image"

export type BlogPost = {
  _id: string
  title: string
  slug?: { current?: string }
  mainImage?: { asset?: { url?: string } }
  publishedAt?: string
  _createdAt?: string
  excerpt?: string
  categories?: { title?: string }[]
  status?: string
  body?: unknown
}

export default function BlogCard({ post, countryCode = "tw" }: { readonly post: BlogPost; readonly countryCode?: string }) {
  // 創建一個安全的slug
  const createSlug = (title: string, id: string) => {
    if (!title || !id) return 'no-slug'
    
    // 將中文標題轉換為拼音或使用ID
    const safeTitle = title
      .toLowerCase()
      .replaceAll(/[^\w\s]/gi, '')
      .replaceAll(/\s+/g, '-')
      .slice(0, 30)
    
    const shortId = id.replaceAll('-', '').slice(0, 8)
    return safeTitle || `post-${shortId}`
  }
  
  // 使用slug.current，如果沒有則根據標題和ID創建slug
  const slug = post?.slug?.current ?? createSlug(post?.title ?? '', post?._id ?? '')
  const href = `/${countryCode}/blog/${slug}`
  const imageUrl = post?.mainImage?.asset?.url
  const date = post?.publishedAt ?? post?._createdAt

  return (
    <li className="group bg-white overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-xl">
      <Link href={href} className="block transition-colors">
        <div className="flex flex-col h-full">
          {imageUrl && (
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
              <Image
                src={imageUrl}
                alt={post.title || "文章封面"}
                fill
                className="object-cover transition-all duration-1000"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
              {/* 簡約漸層覆蓋層 */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            </div>
          )}

          <div className="p-4 flex-1">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-stone-800 transition-colors duration-300">{post.title}</h3>

            {post?.categories?.length ? (
              <div className="mt-1 text-xs text-gray-500">
                {post.categories.map((c) => c.title).filter(Boolean).join(" · ")}
              </div>
            ) : null}

            {date && (
              <time className="mt-1 text-xs text-gray-400" dateTime={date}>
                {new Date(date).toLocaleDateString()}
              </time>
            )}
          </div>
        </div>
      </Link>
    </li>
  )}


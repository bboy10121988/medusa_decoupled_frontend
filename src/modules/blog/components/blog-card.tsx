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

export default function BlogCard({ post, countryCode = "tw" }: { post: BlogPost; countryCode?: string }) {
  const href = `/${countryCode}/blog/${post?.slug?.current ?? ""}`
  const imageUrl = post?.mainImage?.asset?.url
  const date = post?.publishedAt || post?._createdAt

  return (
    <li className="group border-b border-gray-100">
      <Link href={href} className="block p-4 hover:bg-gray-50 transition-colors">
        <div className="flex flex-col h-full">
          {imageUrl && (
            <div className="relative w-full aspect-[16/9] mb-3 overflow-hidden rounded-md bg-gray-100">
              <Image
                src={imageUrl}
                alt={post.title || "文章封面"}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            </div>
          )}

          <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{post.title}</h3>

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
      </Link>
    </li>
  )}


import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"

export type BlogPost = {
  _id?: string
  _type?: string
  title: string
  body?: string // 添加文章內文欄位
  slug?: {
    current?: string
    _type?: string
  } | null
  mainImage?: {
    asset?: {
      url?: string
      _type?: string
    } | null
    _type?: string
  } | null
  publishedAt?: string
  categories?: Array<{
    title?: string
    _type?: string
  } | null> | null
  cstatus?: string
}

export default function BlogCard({ post, countryCode = "tw" }: { post: BlogPost; countryCode?: string }) {
  // 處理摘要內容
  const getExcerpt = (content: any) => {
    if (typeof content === 'string') {
      return content.slice(0, 80) + '...'
    }
    // 如果是 Portable Text 格式,只取純文字內容
    if (Array.isArray(content)) {
      const text = content
        .filter(block => block._type === 'block')
        .map(block => block.children
          ?.map((child: any) => child.text)
          .join('') || ''
        )
        .join(' ')
      return text.slice(0, 80) + '...'
    }
    return ''
  }

  return (
    <li className="group relative">
      <Link href={`/${countryCode}/blog/${post.slug?.current ?? ""}`}>
        <article className="h-full flex flex-col border border-transparent hover:border-gray-200 transition-all duration-200">
          <div className="aspect-[4/3] w-full relative">
            {post.mainImage?.asset?.url ? (
              <Image 
                src={post.mainImage.asset.url}
                alt={post.title}
                className="absolute inset-0 object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100" />
            )}
          </div>
          <div className="flex flex-col flex-1 px-4 md:px-8 py-4">
            <div className="mb-4">
              {post.categories?.map((category) => (
                <span key={category?.title} className="text-sm text-ui-fg-subtle font-base mr-2">
                  {category?.title}
                </span>
              ))}
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-light text-gray-900 mb-2 leading-tight">
              {post.title}
            </h2>
            <p className="text-sm md:text-base text-ui-fg-subtle mb-4 leading-relaxed overflow-hidden" 
               style={{ 
                 display: '-webkit-box',
                 WebkitLineClamp: 3,
                 WebkitBoxOrient: 'vertical' as const
               }}>
              {post.body && getExcerpt(post.body)}
            </p>
            <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                {post.publishedAt && (
                  <time className="text-sm text-ui-fg-subtle font-base">
                    {format(new Date(post.publishedAt), "yyyy年MM月dd日", { locale: zhTW })}
                  </time>
                )}
              </div>
              <span className="text-sm text-gray-900 hover:text-black font-medium transition-colors duration-200 self-start sm:self-auto">
                閱讀更多 →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </li>
  )
}

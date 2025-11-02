import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle } from "@lib/data/collections"
import { getFeaturedProductsHeading } from "@lib/sanity"
import { StoreCollection } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

// 強制動態渲染,避免預渲染問題
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export const PRODUCT_LIMIT = 12

// 移除預產生的靜態參數,避免影響其他動態路由的建置
// export async function generateStaticParams() { /* removed to force dynamic */ }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const sanityHeading = await getFeaturedProductsHeading(collection.id)
  const title = sanityHeading?.heading || collection.title

  return {
    title: `${title} | Tim's Fantasy World`,
    description: `${collection.title} collection`,
  } as Metadata
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const collection = await getCollectionByHandle(params.handle).then(
    (collection: StoreCollection) => collection
  )

  if (!collection) {
    notFound()
  }

  // 從首頁的 featuredProducts 區塊讀取標題配置
  const sanityHeading = await getFeaturedProductsHeading(collection.id)

  return (
    <CollectionTemplate
      collection={collection}
      {...(page && { page })}
      {...(sortBy && { sortBy })}
      countryCode={params.countryCode}
      sanityHeading={sanityHeading}
    />
  )
}

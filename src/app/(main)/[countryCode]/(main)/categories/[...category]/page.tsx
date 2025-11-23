import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle } from "@lib/data/categories"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getHomepage } from "@lib/sanity"
import type { FeaturedProductsSection } from "@lib/types/page-sections"

// 強制動態渲染，避免預渲染問題
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

// 移除預產生的靜態參數，避免影響其他動態路由的建置
// export async function generateStaticParams() { /* removed to force dynamic */ }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    if (!productCategory) {
      return {
        title: "Category Not Found | Medusa Store",
        description: "The requested category could not be found.",
      }
    }

    const title = productCategory.name + " | Medusa Store"

    const description = productCategory.description ?? `${title} category.`

    return {
      title: `${title} | Medusa Store`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  // Fetch homepage settings for global padding
  const homepage = await getHomepage()
  const featuredProductsSection = homepage.mainSections?.find(
    (s) => s._type === "featuredProducts"
  ) as FeaturedProductsSection | undefined
  const paddingX = featuredProductsSection?.paddingX

  return (
    <CategoryTemplate
      category={productCategory}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
      paddingX={paddingX}
    />
  )
}

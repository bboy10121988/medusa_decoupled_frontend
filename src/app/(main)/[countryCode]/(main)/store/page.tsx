import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { getHomepage } from "@lib/sanity"
import type { FeaturedProductsSection } from "@lib/types/page-sections"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page } = searchParams

  // Fetch homepage settings for global padding
  const homepage = await getHomepage()
  const featuredProductsSection = homepage.mainSections?.find(
    (s) => s._type === "featuredProducts"
  ) as FeaturedProductsSection | undefined
  const paddingX = featuredProductsSection?.paddingX

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      paddingX={paddingX}
    />
  )
}

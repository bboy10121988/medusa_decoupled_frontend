import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import RefinementList from "@modules/store/components/refinement-list"

import PaginatedProducts from "./paginated-products"

const storeTranslations: Record<string, { title: string; description: string }> = {
  tw: { title: "所有商品", description: "探索我們的完整商品系列" },
  jp: { title: "すべての商品", description: "すべての商品コレクションをご覧ください" },
  us: { title: "All Products", description: "Explore our complete product collection" },
}

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  paddingX
}: {
  sortBy?: SortOptions | undefined
  page?: string | undefined
  countryCode: string
  paddingX?: number | undefined
}) => {
  const sort = sortBy || "created_at"
  const pageNumber = page ? parseInt(page) : 1
  const t = storeTranslations[countryCode] || storeTranslations.tw

  const paddingStyle = paddingX ? {
    paddingLeft: `${paddingX / 2}%`,
    paddingRight: `${paddingX / 2}%`
  } : {}

  return (
    <div className="pt-0 pb-8" data-testid="store-container" style={paddingStyle}>
      {/* 標題區域 - 置中對齊 */}
      <div className="px-4 md:px-8 lg:px-12 py-3 border-b border-gray-100 text-center">
        <h1 data-testid="store-page-title" className="text-2xl font-semibold mb-1">
          {t.title}
        </h1>
        <p className="text-base text-gray-600">
          {t.description}
        </p>
      </div>

      {/* 篩選器區域 */}
      <div className="px-4 md:px-8 lg:px-12 py-1 border-b border-gray-100">
        <RefinementList sortBy={sort} data-testid="sort-by-container" />
      </div>

      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          countryCode={countryCode}
          hideRefinementList={true}
        />
      </Suspense>
    </div>
  )
}

export default StoreTemplate

import { Suspense } from "react"

import SkeletonProductGrid from "@features/loading-states/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@features/product-browsing/store/components/refinement-list/sort-products"
import RefinementList from "@features/product-browsing/store/components/refinement-list"

import InfiniteScrollProducts from "./infinite-scroll-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const sort = sortBy || "created_at"

  return (
    <div className="pt-0 pb-8" data-testid="store-container">
      {/* 標題區域 - 置中對齊 */}
      <div className="px-4 md:px-8 lg:px-12 py-3 border-b border-gray-100 text-center">
        <h1 data-testid="store-page-title" className="text-2xl font-semibold mb-1">
          所有商品
        </h1>
        <p className="text-base text-gray-600">
          探索我們的完整商品系列
        </p>
      </div>

      {/* 篩選器區域 */}
      <div className="px-4 md:px-8 lg:px-12 py-1 border-b border-gray-100">
        <RefinementList sortBy={sort} data-testid="sort-by-container" />
      </div>

      <Suspense fallback={<SkeletonProductGrid />}>
        <InfiniteScrollProducts
          sortBy={sort}
          countryCode={countryCode}
        />
      </Suspense>
    </div>
  )
}

export default StoreTemplate

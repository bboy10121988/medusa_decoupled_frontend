import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

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
    <div className="pt-0 pb-8" data-testid="category-container">
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

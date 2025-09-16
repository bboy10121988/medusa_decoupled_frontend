import { Suspense } from "react"

import SkeletonProductGrid from "@features/loading-states/skeletons/templates/skeleton-product-grid/index"
import { SortOptions } from "../../store/components/refinement-list/sort-products/index"
import PaginatedProducts from "../../store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="pt-0 pb-8">
      <Suspense
        fallback={
          <SkeletonProductGrid
            numberOfProducts={collection.products?.length}
          />
        }
      >
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          collectionId={collection.id}
          countryCode={countryCode}
          hideRefinementList={true}
        />
      </Suspense>
    </div>
  )
}

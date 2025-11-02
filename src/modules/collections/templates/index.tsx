import { Suspense } from "react"

import SkeletonProductGrid from "../../skeletons/templates/skeleton-product-grid/index"
import { SortOptions } from "../../store/components/refinement-list/sort-products/index"
import PaginatedProducts from "../../store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

type FeaturedProductsHeading = {
  heading?: string
  showHeading?: boolean
}

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  sanityHeading,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  sanityHeading?: FeaturedProductsHeading | null
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // 集合頁面永遠顯示標題（硬編碼），不受 Sanity showHeading 控制
  const heading = sanityHeading?.heading || collection.title

  return (
    <div className="pt-8 pb-8">
      {/* 標題區塊 - 永遠顯示 */}
      {heading && (
        <div className="container mx-auto px-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            {heading}
          </h1>
        </div>
      )}

      {/* 商品列表與篩選器 */}
      <Suspense
        fallback={
          <SkeletonProductGrid
            numberOfProducts={collection.products?.length || 12}
          />
        }
      >
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          collectionId={collection.id}
          countryCode={countryCode}
          hideRefinementList={false}
        />
      </Suspense>
    </div>
  )
}

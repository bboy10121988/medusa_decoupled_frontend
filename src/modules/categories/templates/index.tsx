import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "../../skeletons/templates/skeleton-product-grid/index"
import { SortOptions } from "../../store/components/refinement-list/sort-products/index"
import PaginatedProducts from "../../store/templates/paginated-products"
import RefinementList from "../../store/components/refinement-list/index"
import LocalizedClientLink from "../../common/components/localized-client-link/index"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="pt-0 pb-8" data-testid="category-container">
      {/* 標題區域 - 置中對齊 */}
      <div className="px-4 md:px-8 lg:px-12 py-6 border-b border-gray-100 text-center">
        <div className="flex flex-row mb-4 text-2xl-semi gap-4 justify-center">
          {parents &&
            parents.map((parent) => (
              <span key={parent.id} className="text-ui-fg-subtle">
                <LocalizedClientLink
                  className="mr-4 hover:text-black"
                  href={`/categories/${parent.handle}`}
                  data-testid="category-parent-link"
                >
                  {parent.name}
                </LocalizedClientLink>
                /
              </span>
            ))}
          <h1 data-testid="category-page-title" className="text-2xl font-semibold">
            {category.name}
          </h1>
        </div>
        {category.description && (
          <div className="mb-4 text-base text-gray-600 text-center">
            <p>{category.description}</p>
          </div>
        )}
      </div>

      {/* 篩選器區域 */}
      <div className="px-4 md:px-8 lg:px-12 py-4 border-b border-gray-100">
        <RefinementList sortBy={sort} data-testid="sort-by-container" />
      </div>

      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          categoryId={category.id}
          countryCode={countryCode}
          hideRefinementList={true}
        />
      </Suspense>
    </div>
  )
}

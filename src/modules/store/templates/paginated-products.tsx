"use client"

import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "../../products/components/product-preview"
import { Pagination } from "../components/pagination"
import { SortOptions } from "../components/refinement-list/sort-products/index"
import RefinementList from "../components/refinement-list"
import { useEffect, useState } from "react"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  hideRefinementList = false,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  hideRefinementList?: boolean
}) {
  const [products, setProducts] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      const queryParams: PaginatedProductsParams = {
        limit: 12,
      }

      if (collectionId) {
        queryParams["collection_id"] = [collectionId]
      }

      if (categoryId) {
        queryParams["category_id"] = [categoryId]
      }

      if (productsIds) {
        queryParams["id"] = productsIds
      }

      if (sortBy === "created_at") {
        queryParams["order"] = "created_at"
      }

      const region = await getRegion(countryCode)

      if (!region) {
        return
      }

      const {
        response: { products: fetchedProducts, count },
      } = await listProductsWithSort({
        page,
        queryParams,
        ...(sortBy ? { sortBy } : {}),
        countryCode,
      })

      setProducts(fetchedProducts)
      setTotalPages(Math.ceil(count / PRODUCT_LIMIT))
    }

    fetchProducts()
  }, [collectionId, categoryId, productsIds, sortBy, page, countryCode])

  return (
    <div className="flex flex-col">
      {!hideRefinementList && (
        <div className="mb-8 px-4 md:px-8 lg:px-12 flex justify-center">
          <RefinementList sortBy={sortBy || "created_at"} />
        </div>
      )}
      <div>
        <ul
          className="grid grid-cols-2 md:grid-cols-4 min-[1280px]:grid-cols-5 min-[1536px]:grid-cols-6 gap-0 w-full bg-white"
          data-testid="products-list"
        >
          {products.map((p) => {
            return (
              <li key={p.id} className="w-full">
                <ProductPreview product={p} countryCode={countryCode} />
              </li>
            )
          })}
        </ul>
        {totalPages > 1 && !hideRefinementList && (
          <div className="mt-8 px-4 md:px-8 lg:px-12 flex justify-center">
            <Pagination
              data-testid="product-pagination"
              page={page}
              totalPages={totalPages}
            />
          </div>
        )}
        {totalPages > 1 && hideRefinementList && (
          <div className="mt-8 flex justify-center">
            <Pagination
              data-testid="product-pagination"
              page={page}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  )
}

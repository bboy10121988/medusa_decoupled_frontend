import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { SortOptions } from "../components/refinement-list/sort-products/index"
import { sortProducts } from "@lib/util/sort-products"
import InfiniteProducts from "../components/infinite-products"
import { convertToStandardProducts } from "@lib/util/product-type-converter"

const PRODUCT_LIMIT = 12

export default async function InfiniteScrollProducts({
  sortBy,
  countryCode,
}: {
  sortBy: SortOptions
  countryCode: string
}) {
  if (process.env.NODE_ENV === 'development') console.log("🏪 InfiniteScrollProducts called with:", {
    sortBy,
    countryCode
  })

  const region = await getRegion(countryCode)

  if (!region) {
    if (process.env.NODE_ENV === 'development') console.log("🏪 InfiniteScrollProducts - No region found for:", countryCode)
    return null
  }

  if (process.env.NODE_ENV === 'development') console.log("🏪 InfiniteScrollProducts - Region found:", {
    id: region.id,
    name: region.name
  })

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      limit: PRODUCT_LIMIT,
    },
    countryCode,
  })

  if (process.env.NODE_ENV === 'development') console.log("🏪 InfiniteScrollProducts - Products loaded:", {
    count: products?.length,
    totalCount: count,
    productIds: products?.map(p => p.id)
  })

  // 先排序再轉換類型
  const sortedLocalProducts = sortProducts(products, sortBy)
  const sortedProducts = convertToStandardProducts(sortedLocalProducts)

  if (process.env.NODE_ENV === 'development') console.log("🏪 InfiniteScrollProducts - Products sorted:", {
    sortBy,
    sortedCount: sortedProducts?.length
  })

  return (
    <InfiniteProducts
      initialProducts={sortedProducts}
      params={{
        countryCode,
        queryParams: {
          limit: PRODUCT_LIMIT,
        },
      }}
      totalCount={count}
    />
  )
}

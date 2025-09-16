import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@features/product-browsing/products/components/product-preview"
import { listProducts } from "@lib/data/products"
import { convertToStandardProducts } from "@shared/utilities/product-type-converter"

type ProductPreviewGridProps = {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}

export default async function ProductPreviewGrid({
  collection,
  region,
}: ProductPreviewGridProps) {
  const { response: { products } } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: [collection.id],
      limit: 4
    } as any
  })

  if (!products || products.length === 0) {
    return null
  }

  // 轉換產品類型以匹配 HttpTypes.StoreProduct
  const standardProducts = convertToStandardProducts(products)

  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 gap-0 w-full">
      {standardProducts.map(product => (
        <li key={product.id} className="w-full bg-white">
          <ProductPreview 
            product={product}
            isFeatured={collection.handle === "featured"}
            countryCode="tw"
          />
        </li>
      ))}
    </ul>
  )
}
